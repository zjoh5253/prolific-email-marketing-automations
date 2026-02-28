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

const BASE_URL = 'https://api.cc.email/v3';
const TOKEN_URL = 'https://authz.constantcontact.com/oauth2/default/v1/token';

const CC_STATUS_MAP: Record<string, string> = {
  Draft: 'DRAFT',
  Scheduled: 'SCHEDULED',
  Executing: 'SENDING',
  Done: 'SENT',
  Error: 'DRAFT',
  Removed: 'ARCHIVED',
};

const INTERNAL_STATUS_MAP: Record<string, string> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  SENDING: 'Executing',
  SENT: 'Done',
  ARCHIVED: 'Removed',
};

export class ConstantContactAdapter extends EmailPlatformAdapter {
  constructor(clientId: string, credentials: PlatformCredentials) {
    super(clientId, credentials, 'Constant Contact');
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const account = await this.request<any>('GET', '/account/summary');

      return {
        success: true,
        message: 'Successfully connected to Constant Contact',
        accountInfo: {
          id: account.encoded_account_id || '',
          name: account.organization_name || account.first_name || '',
          email: account.contact_email || '',
        },
      };
    } catch (error) {
      this.log('error', 'Connection test failed', { error: this.extractErrorMessage(error) });
      return {
        success: false,
        message: 'Failed to connect to Constant Contact',
        error: this.extractErrorMessage(error),
      };
    }
  }

  async getCampaigns(options?: PaginationOptions): Promise<PaginatedResult<PlatformCampaign>> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 50;

      const params: Record<string, string> = {
        limit: String(limit),
      };

      const response = await this.request<{ campaigns: any[]; _links?: any }>(
        'GET',
        '/emails',
        undefined,
        params,
      );

      const campaigns = (response.campaigns || []).map((c: any) => this.mapCampaign(c));

      return {
        items: campaigns,
        total: campaigns.length,
        page,
        limit,
        hasMore: !!response._links?.next,
      };
    } catch (error) {
      this.handleApiError(error, 'getCampaigns');
    }
  }

  async getCampaign(externalId: string): Promise<PlatformCampaign | null> {
    try {
      const campaign = await this.request<any>('GET', `/emails/${externalId}`);
      return this.mapCampaign(campaign);
    } catch (error: any) {
      if (error.status === 404 || error.statusCode === 404) return null;
      this.handleApiError(error, 'getCampaign');
    }
  }

  async createCampaign(input: CreateCampaignInput): Promise<PlatformCampaign> {
    try {
      // Step 1: Create the email campaign with an initial activity
      const createBody = {
        name: input.name,
        email_campaign_activities: [
          {
            format_type: 5, // Custom HTML
            from_name: input.fromName,
            from_email: input.fromEmail,
            reply_to_email: input.fromEmail,
            subject: input.subjectLine,
            preheader: input.previewText || '',
            html_content: input.contentHtml,
          },
        ],
      };

      const campaign = await this.request<any>('POST', '/emails', createBody);
      const campaignId = campaign.campaign_id;
      const activityId = campaign.campaign_activities?.[0]?.campaign_activity_id;

      // Step 2: If there's an activity and we need to set list, update the activity
      if (activityId && input.listId) {
        await this.request<any>(
          'PUT',
          `/emails/activities/${activityId}`,
          {
            format_type: 5,
            from_name: input.fromName,
            from_email: input.fromEmail,
            reply_to_email: input.fromEmail,
            subject: input.subjectLine,
            preheader: input.previewText || '',
            html_content: input.contentHtml,
            contact_list_ids: [input.listId],
          },
        );
      }

      // Fetch the full campaign
      const full = await this.request<any>('GET', `/emails/${campaignId}`);
      return this.mapCampaign(full);
    } catch (error) {
      this.handleApiError(error, 'createCampaign');
    }
  }

  async updateCampaign(externalId: string, updates: UpdateCampaignInput): Promise<PlatformCampaign> {
    try {
      // Update campaign name if provided
      if (updates.name) {
        await this.request<any>('PATCH', `/emails/${externalId}`, {
          name: updates.name,
        });
      }

      // Update campaign activity content if any content fields provided
      if (updates.subjectLine || updates.fromName || updates.fromEmail || updates.contentHtml || updates.previewText) {
        // Get the primary activity ID
        const campaign = await this.request<any>('GET', `/emails/${externalId}`);
        const activityId = this.getPrimaryActivityId(campaign);

        if (activityId) {
          // Get current activity to preserve fields we aren't updating
          const activity = await this.request<any>('GET', `/emails/activities/${activityId}`);

          const activityBody: Record<string, any> = {
            format_type: activity.format_type || 5,
            from_name: updates.fromName || activity.from_name,
            from_email: updates.fromEmail || activity.from_email,
            reply_to_email: updates.fromEmail || activity.reply_to_email,
            subject: updates.subjectLine || activity.subject,
            preheader: updates.previewText ?? activity.preheader ?? '',
            html_content: updates.contentHtml || activity.html_content,
          };

          if (activity.contact_list_ids) {
            activityBody.contact_list_ids = activity.contact_list_ids;
          }

          await this.request<any>('PUT', `/emails/activities/${activityId}`, activityBody);
        }
      }

      const updated = await this.request<any>('GET', `/emails/${externalId}`);
      return this.mapCampaign(updated);
    } catch (error) {
      this.handleApiError(error, 'updateCampaign');
    }
  }

  async scheduleCampaign(externalId: string, scheduledAt: Date): Promise<void> {
    try {
      const campaign = await this.request<any>('GET', `/emails/${externalId}`);
      const activityId = this.getPrimaryActivityId(campaign);

      if (!activityId) {
        throw new PlatformError('Constant Contact', 'scheduleCampaign', 'No campaign activity found');
      }

      await this.request<any>(
        'POST',
        `/emails/activities/${activityId}/schedules`,
        { scheduled_date: scheduledAt.toISOString() },
      );

      this.log('info', 'Campaign scheduled', { externalId, scheduledAt });
    } catch (error) {
      if (error instanceof PlatformError) throw error;
      this.handleApiError(error, 'scheduleCampaign');
    }
  }

  async sendCampaign(externalId: string): Promise<void> {
    try {
      const campaign = await this.request<any>('GET', `/emails/${externalId}`);
      const activityId = this.getPrimaryActivityId(campaign);

      if (!activityId) {
        throw new PlatformError('Constant Contact', 'sendCampaign', 'No campaign activity found');
      }

      // "0" means send immediately in CC API
      await this.request<any>(
        'POST',
        `/emails/activities/${activityId}/schedules`,
        { scheduled_date: '0' },
      );

      this.log('info', 'Campaign sent', { externalId });
    } catch (error) {
      if (error instanceof PlatformError) throw error;
      this.handleApiError(error, 'sendCampaign');
    }
  }

  async getCampaignMetrics(externalId: string): Promise<PlatformMetrics> {
    try {
      // Get the campaign to find its activity ID
      const campaign = await this.request<any>('GET', `/emails/${externalId}`);
      const activityId = this.getPrimaryActivityId(campaign);

      if (!activityId) {
        return this.emptyMetrics();
      }

      const report = await this.request<{ bulk_email_campaign_summaries?: any[] }>(
        'GET',
        `/reports/stats/email_campaign_activities/${activityId}`,
      );

      const stats = report.bulk_email_campaign_summaries?.[0]?.stats;
      if (!stats) return this.emptyMetrics();

      const sent = stats.em_sends || 0;
      const bounces = stats.em_bounces || 0;
      const delivered = sent - bounces;
      const uniqueOpens = stats.em_opens || 0;
      const uniqueClicks = stats.em_clicks || 0;

      return {
        sent,
        delivered,
        uniqueOpens,
        totalOpens: stats.em_opens_all || uniqueOpens,
        uniqueClicks,
        totalClicks: stats.em_clicks_all || uniqueClicks,
        bounces,
        unsubscribes: stats.em_optouts || 0,
        complaints: stats.em_abuse || 0,
        openRate: sent > 0 ? uniqueOpens / sent : 0,
        clickRate: sent > 0 ? uniqueClicks / sent : 0,
        bounceRate: sent > 0 ? bounces / sent : 0,
        unsubscribeRate: sent > 0 ? (stats.em_optouts || 0) / sent : 0,
      };
    } catch (error: any) {
      if (error.status === 404 || error.statusCode === 404) {
        return this.emptyMetrics();
      }
      this.handleApiError(error, 'getCampaignMetrics');
    }
  }

  async getLists(): Promise<PlatformList[]> {
    try {
      const response = await this.request<{ lists: any[] }>('GET', '/contact_lists');
      return (response.lists || []).map((list: any) => this.mapList(list));
    } catch (error) {
      this.handleApiError(error, 'getLists');
    }
  }

  async getList(externalId: string): Promise<PlatformList | null> {
    try {
      const list = await this.request<any>('GET', `/contact_lists/${externalId}`);
      return this.mapList(list);
    } catch (error: any) {
      if (error.status === 404 || error.statusCode === 404) return null;
      this.handleApiError(error, 'getList');
    }
  }

  protected normalizeCampaignStatus(platformStatus: string): string {
    return CC_STATUS_MAP[platformStatus] || 'UNKNOWN';
  }

  protected mapCampaignStatus(internalStatus: string): string {
    return INTERNAL_STATUS_MAP[internalStatus] || 'Draft';
  }

  // --- Private helpers ---

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, any>,
    queryParams?: Record<string, string>,
    isRetry = false,
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        url.searchParams.append(key, value);
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.credentials.accessToken}`,
      'Content-Type': 'application/json',
    };

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Auto-refresh on 401 and retry once
    if (res.status === 401 && !isRetry) {
      await this.refreshAccessToken();
      return this.request<T>(method, path, body, queryParams, true);
    }

    if (!res.ok) {
      const errorBody = await res.text();
      let message: string;
      try {
        const parsed = JSON.parse(errorBody);
        message = parsed.error_message || parsed.error_description || parsed.message || errorBody;
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

    // Some CC endpoints return 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return res.json() as Promise<T>;
  }

  private async refreshAccessToken(): Promise<void> {
    const clientId = this.credentials.clientId;
    const clientSecret = this.credentials.clientSecret;

    if (!clientId || !clientSecret || !this.credentials.refreshToken) {
      throw new PlatformError(
        'Constant Contact',
        'refreshAccessToken',
        'Missing clientId, clientSecret, or refreshToken for token refresh',
      );
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.credentials.refreshToken,
      }).toString(),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new PlatformError(
        'Constant Contact',
        'refreshAccessToken',
        `Token refresh failed: ${errorBody}`,
      );
    }

    const tokens = await res.json() as { access_token: string; refresh_token: string };

    // Update in-memory credentials (NOTE: caller should persist these externally)
    this.credentials.accessToken = tokens.access_token;
    this.credentials.refreshToken = tokens.refresh_token;

    this.log('info', 'Access token refreshed successfully');
  }

  private getPrimaryActivityId(campaign: any): string | undefined {
    const activities = campaign.campaign_activities || [];
    // The primary_email activity is the one used for content and scheduling
    const primary = activities.find((a: any) => a.role === 'primary_email') || activities[0];
    return primary?.campaign_activity_id;
  }

  private mapCampaign(cc: any): PlatformCampaign {
    const activities = cc.campaign_activities || [];
    const primaryActivity = activities.find((a: any) => a.role === 'primary_email') || activities[0];

    return {
      externalId: cc.campaign_id,
      name: cc.name || '',
      subjectLine: primaryActivity?.subject || '',
      previewText: primaryActivity?.preheader || '',
      fromName: primaryActivity?.from_name || '',
      fromEmail: primaryActivity?.from_email || '',
      status: this.normalizeCampaignStatus(cc.current_status || 'Draft'),
      contentHtml: primaryActivity?.html_content || undefined,
      scheduledAt: primaryActivity?.scheduled_date
        ? new Date(primaryActivity.scheduled_date)
        : undefined,
      sentAt: cc.current_status === 'Done' && cc.updated_at
        ? new Date(cc.updated_at)
        : undefined,
      metadata: {
        campaignActivityId: primaryActivity?.campaign_activity_id,
        type: cc.type,
        typeCode: cc.type_code,
        updatedAt: cc.updated_at,
        createdAt: cc.created_at,
      },
    };
  }

  private mapList(list: any): PlatformList {
    return {
      externalId: list.list_id,
      name: list.name || '',
      memberCount: list.membership_count || 0,
      createdAt: list.created_at ? new Date(list.created_at) : undefined,
      updatedAt: list.updated_at ? new Date(list.updated_at) : undefined,
      metadata: {
        description: list.description,
        favorite: list.favorite,
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
