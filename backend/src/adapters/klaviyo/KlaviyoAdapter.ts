import { EmailPlatformAdapter } from '../base/EmailPlatformAdapter.js';
import {
  PlatformCredentials,
  ConnectionTestResult,
  PlatformCampaign,
  PlatformList,
  PlatformMetrics,
  CreateCampaignInput,
  UpdateCampaignInput,
  PaginationOptions,
  PaginatedResult,
} from '../types.js';
import { PlatformError } from '../../utils/errors.js';

const BASE_URL = 'https://a.klaviyo.com/api';
const API_REVISION = '2024-10-15';
const JSONAPI_CONTENT_TYPE = 'application/vnd.api+json';

const KLAVIYO_STATUS_MAP: Record<string, string> = {
  draft: 'DRAFT',
  scheduled: 'SCHEDULED',
  sending: 'SENDING',
  sent: 'SENT',
  cancelled: 'CANCELLED',
};

const INTERNAL_STATUS_MAP: Record<string, string> = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  SENDING: 'sending',
  SENT: 'sent',
  CANCELLED: 'cancelled',
};

export class KlaviyoAdapter extends EmailPlatformAdapter {
  constructor(clientId: string, credentials: PlatformCredentials) {
    super(clientId, credentials, 'Klaviyo');
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const response = await this.request<{ data: any[] }>('GET', '/accounts/');

      const account = response.data?.[0];
      const attrs = account?.attributes || {};

      return {
        success: true,
        message: 'Successfully connected to Klaviyo',
        accountInfo: {
          id: account?.id || '',
          name: attrs.contact_information?.organization_name || account?.id || '',
          email: attrs.contact_information?.default_sender_email,
        },
      };
    } catch (error) {
      this.log('error', 'Connection test failed', { error: this.extractErrorMessage(error) });
      return {
        success: false,
        message: 'Failed to connect to Klaviyo',
        error: this.extractErrorMessage(error),
      };
    }
  }

  async getCampaigns(options?: PaginationOptions): Promise<PaginatedResult<PlatformCampaign>> {
    try {
      const limit = options?.limit || 50;

      const params: Record<string, string> = {
        'filter': "equals(messages.channel,'email')",
        'page[size]': String(limit),
      };

      // Klaviyo uses cursor pagination; page > 1 not supported without external cursor tracking
      // Callers should use the hasMore flag and manage cursor state externally

      const response = await this.request<{
        data: any[];
        links?: { next?: string };
      }>('GET', '/campaigns', undefined, params);

      const campaigns = (response.data || []).map((c: any) => this.mapCampaignData(c));

      // Extract cursor from next link
      let hasMore = false;
      if (response.links?.next) {
        hasMore = true;
      }

      return {
        items: campaigns,
        total: campaigns.length, // Klaviyo doesn't return total count
        page: options?.page || 1,
        limit,
        hasMore,
      };
    } catch (error) {
      this.handleApiError(error, 'getCampaigns');
    }
  }

  async getCampaign(externalId: string): Promise<PlatformCampaign | null> {
    try {
      const response = await this.request<{ data: any }>('GET', `/campaigns/${externalId}`);
      return this.mapCampaignData(response.data);
    } catch (error: any) {
      if (error.status === 404) return null;
      this.handleApiError(error, 'getCampaign');
    }
  }

  async createCampaign(input: CreateCampaignInput): Promise<PlatformCampaign> {
    try {
      // Step 1: Create the campaign
      const campaignBody = {
        data: {
          type: 'campaign',
          attributes: {
            name: input.name,
            channel: 'email',
            audiences: {
              included: [input.listId],
              excluded: [],
            },
            send_strategy: {
              method: 'static',
              options_static: { datetime: null },
            },
          },
        },
      };

      const createResponse = await this.request<{ data: any }>(
        'POST',
        '/campaigns',
        campaignBody,
      );

      const campaignId = createResponse.data.id;

      // Step 2: Get the message ID from the campaign relationships
      const messageId = createResponse.data.relationships?.campaign_messages?.data?.[0]?.id;

      if (messageId) {
        // Step 3: Update the campaign message with content
        const messageBody = {
          data: {
            type: 'campaign-message',
            id: messageId,
            attributes: {
              label: input.name,
              subject: input.subjectLine,
              preview_text: input.previewText || '',
              from_email: input.fromEmail,
              from_label: input.fromName,
              content: {
                html: input.contentHtml,
                plain_text: input.contentText || '',
              },
            },
          },
        };

        await this.request<any>('PATCH', `/campaign-messages/${messageId}`, messageBody);
      }

      // Re-fetch the full campaign
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) {
        throw new PlatformError('Klaviyo', 'createCampaign', 'Campaign not found after creation');
      }
      return campaign;
    } catch (error: any) {
      if (error instanceof PlatformError) throw error;
      this.handleApiError(error, 'createCampaign');
    }
  }

  async updateCampaign(externalId: string, updates: UpdateCampaignInput): Promise<PlatformCampaign> {
    try {
      // Update campaign name if provided
      if (updates.name) {
        const campaignBody = {
          data: {
            type: 'campaign',
            id: externalId,
            attributes: {
              name: updates.name,
            },
          },
        };
        await this.request<any>('PATCH', `/campaigns/${externalId}`, campaignBody);
      }

      // Update message content if any content fields provided
      if (updates.subjectLine || updates.contentHtml || updates.fromName || updates.fromEmail || updates.previewText) {
        // Get the campaign to find message ID
        const campaignResponse = await this.request<{ data: any }>(
          'GET',
          `/campaigns/${externalId}`,
        );
        const messageId = campaignResponse.data?.relationships?.campaign_messages?.data?.[0]?.id;

        if (messageId) {
          const messageAttrs: Record<string, any> = {};
          if (updates.subjectLine) messageAttrs.subject = updates.subjectLine;
          if (updates.previewText) messageAttrs.preview_text = updates.previewText;
          if (updates.fromEmail) messageAttrs.from_email = updates.fromEmail;
          if (updates.fromName) messageAttrs.from_label = updates.fromName;
          if (updates.contentHtml || updates.contentText) {
            messageAttrs.content = {};
            if (updates.contentHtml) messageAttrs.content.html = updates.contentHtml;
            if (updates.contentText) messageAttrs.content.plain_text = updates.contentText;
          }

          const messageBody = {
            data: {
              type: 'campaign-message',
              id: messageId,
              attributes: messageAttrs,
            },
          };

          await this.request<any>('PATCH', `/campaign-messages/${messageId}`, messageBody);
        }
      }

      const campaign = await this.getCampaign(externalId);
      if (!campaign) {
        throw new PlatformError('Klaviyo', 'updateCampaign', 'Campaign not found after update');
      }
      return campaign;
    } catch (error: any) {
      if (error instanceof PlatformError) throw error;
      this.handleApiError(error, 'updateCampaign');
    }
  }

  async scheduleCampaign(externalId: string, scheduledAt: Date): Promise<void> {
    try {
      const body = {
        data: {
          type: 'campaign-send-job',
          attributes: {
            campaign_id: externalId,
            send_strategy: {
              method: 'static',
              options_static: {
                datetime: scheduledAt.toISOString(),
              },
            },
          },
        },
      };

      await this.request<any>('POST', '/campaign-send-jobs', body);
      this.log('info', 'Campaign scheduled', { externalId, scheduledAt });
    } catch (error) {
      this.handleApiError(error, 'scheduleCampaign');
    }
  }

  async sendCampaign(externalId: string): Promise<void> {
    try {
      // Send immediately by using current datetime
      const body = {
        data: {
          type: 'campaign-send-job',
          attributes: {
            campaign_id: externalId,
            send_strategy: {
              method: 'static',
              options_static: {
                datetime: new Date().toISOString(),
              },
            },
          },
        },
      };

      await this.request<any>('POST', '/campaign-send-jobs', body);
      this.log('info', 'Campaign sent', { externalId });
    } catch (error) {
      this.handleApiError(error, 'sendCampaign');
    }
  }

  async getCampaignMetrics(externalId: string): Promise<PlatformMetrics> {
    try {
      // Klaviyo uses POST-based reporting endpoint
      const body = {
        data: {
          type: 'campaign-values-report',
          attributes: {
            campaign_ids: [externalId],
            statistics: [
              'opens',
              'unique_opens',
              'clicks',
              'unique_clicks',
              'recipients',
              'deliveries',
              'bounces',
              'unsubscribes',
              'spam_complaints',
            ],
          },
        },
      };

      const response = await this.request<{ data: any }>('POST', '/campaign-values-reports', body);

      const results = response.data?.attributes?.results?.[0];
      if (!results || !results.statistics) return this.emptyMetrics();

      const stats = results.statistics;
      const sent = stats.recipients || 0;
      const delivered = stats.deliveries || sent;
      const uniqueOpens = stats.unique_opens || 0;
      const totalOpens = stats.opens || uniqueOpens;
      const uniqueClicks = stats.unique_clicks || 0;
      const totalClicks = stats.clicks || uniqueClicks;
      const bounces = stats.bounces || 0;
      const unsubscribes = stats.unsubscribes || 0;
      const complaints = stats.spam_complaints || 0;

      return {
        sent,
        delivered,
        uniqueOpens,
        totalOpens,
        uniqueClicks,
        totalClicks,
        bounces,
        unsubscribes,
        complaints,
        openRate: sent > 0 ? uniqueOpens / sent : 0,
        clickRate: sent > 0 ? uniqueClicks / sent : 0,
        bounceRate: sent > 0 ? bounces / sent : 0,
        unsubscribeRate: sent > 0 ? unsubscribes / sent : 0,
      };
    } catch (error: any) {
      if (error.status === 404) return this.emptyMetrics();
      this.handleApiError(error, 'getCampaignMetrics');
    }
  }

  async getLists(): Promise<PlatformList[]> {
    try {
      const allLists: PlatformList[] = [];
      let nextCursor: string | undefined;

      while (true) {
        const params: Record<string, string> = {
          'additional-fields[list]': 'profile_count',
          'page[size]': '100',
        };

        if (nextCursor) {
          params['page[cursor]'] = nextCursor;
        }

        const response = await this.request<{
          data: any[];
          links?: { next?: string };
        }>('GET', '/lists', undefined, params);

        const lists = (response.data || []).map((l: any) => this.mapListData(l));
        allLists.push(...lists);

        // Extract cursor from next link
        if (response.links?.next) {
          const nextUrl = new URL(response.links.next);
          nextCursor = nextUrl.searchParams.get('page[cursor]') || undefined;
          if (!nextCursor) break;
        } else {
          break;
        }
      }

      return allLists;
    } catch (error) {
      this.handleApiError(error, 'getLists');
    }
  }

  async getList(externalId: string): Promise<PlatformList | null> {
    try {
      const response = await this.request<{ data: any }>(
        'GET',
        `/lists/${externalId}`,
        undefined,
        { 'additional-fields[list]': 'profile_count' },
      );
      return this.mapListData(response.data);
    } catch (error: any) {
      if (error.status === 404) return null;
      this.handleApiError(error, 'getList');
    }
  }

  protected normalizeCampaignStatus(platformStatus: string): string {
    return KLAVIYO_STATUS_MAP[platformStatus] || 'UNKNOWN';
  }

  protected mapCampaignStatus(internalStatus: string): string {
    return INTERNAL_STATUS_MAP[internalStatus] || 'draft';
  }

  // --- Private helpers ---

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, any>,
    queryParams?: Record<string, string>,
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        url.searchParams.append(key, value);
      }
    }

    const isWrite = method === 'POST' || method === 'PATCH' || method === 'PUT';

    const headers: Record<string, string> = {
      Authorization: `Klaviyo-API-Key ${this.credentials.apiKey}`,
      revision: API_REVISION,
      Accept: JSONAPI_CONTENT_TYPE,
    };

    if (isWrite) {
      headers['Content-Type'] = JSONAPI_CONTENT_TYPE;
    }

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorBody = await res.text();
      let message: string;
      try {
        const parsed = JSON.parse(errorBody);
        message = parsed.errors?.[0]?.detail || parsed.errors?.[0]?.title || parsed.message || errorBody;
      } catch {
        message = errorBody;
      }

      const error: any = new Error(message);
      error.status = res.status;
      error.statusCode = res.status;
      if (res.headers.get('retry-after')) {
        error.response = { headers: { 'retry-after': res.headers.get('retry-after') } };
      }
      throw error;
    }

    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
  }

  private mapCampaignData(data: any): PlatformCampaign {
    const attrs = data.attributes || {};
    const audiences = attrs.audiences || {};
    const sendStrategy = attrs.send_strategy || {};

    // Determine scheduled datetime from send strategy
    const scheduledDatetime = sendStrategy.options_static?.datetime;

    return {
      externalId: data.id,
      name: attrs.name || '',
      subjectLine: attrs.subject || '',
      status: this.normalizeCampaignStatus(attrs.status || ''),
      listId: audiences.included?.[0] || undefined,
      scheduledAt: scheduledDatetime ? new Date(scheduledDatetime) : undefined,
      sentAt: attrs.send_time ? new Date(attrs.send_time) : undefined,
      metadata: {
        channel: attrs.channel,
        createdAt: attrs.created_at,
        updatedAt: attrs.updated_at,
        sendStrategy: sendStrategy.method,
        messageId: data.relationships?.campaign_messages?.data?.[0]?.id,
      },
    };
  }

  private mapListData(data: any): PlatformList {
    const attrs = data.attributes || {};

    return {
      externalId: data.id,
      name: attrs.name || '',
      memberCount: attrs.profile_count || 0,
      createdAt: attrs.created ? new Date(attrs.created) : undefined,
      updatedAt: attrs.updated ? new Date(attrs.updated) : undefined,
      metadata: {
        optInProcess: attrs.opt_in_process,
      },
    };
  }

  private emptyMetrics(): PlatformMetrics {
    return {
      sent: 0,
      delivered: 0,
      uniqueOpens: 0,
      totalOpens: 0,
      uniqueClicks: 0,
      totalClicks: 0,
      bounces: 0,
      unsubscribes: 0,
      complaints: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
      unsubscribeRate: 0,
    };
  }
}
