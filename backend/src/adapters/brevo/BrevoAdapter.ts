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

const BASE_URL = 'https://api.brevo.com/v3';

const BREVO_STATUS_MAP: Record<string, string> = {
  draft: 'DRAFT',
  queued: 'SCHEDULED',
  inProcess: 'SENDING',
  in_process: 'SENDING',
  sent: 'SENT',
  suspended: 'CANCELLED',
  archive: 'ARCHIVED',
  inReview: 'DRAFT',
};

const INTERNAL_STATUS_MAP: Record<string, string> = {
  DRAFT: 'draft',
  SCHEDULED: 'queued',
  SENDING: 'inProcess',
  SENT: 'sent',
  CANCELLED: 'suspended',
  ARCHIVED: 'archive',
};

export class BrevoAdapter extends EmailPlatformAdapter {
  constructor(clientId: string, credentials: PlatformCredentials) {
    super(clientId, credentials, 'Brevo');
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const account = await this.request<{
        email: string;
        companyName: string;
        plan: { type: string }[];
      }>('GET', '/account');

      return {
        success: true,
        message: 'Successfully connected to Brevo',
        accountInfo: {
          id: account.email,
          name: account.companyName || account.email,
          email: account.email,
          plan: account.plan?.[0]?.type,
        },
      };
    } catch (error) {
      this.log('error', 'Connection test failed', { error: this.extractErrorMessage(error) });
      return {
        success: false,
        message: 'Failed to connect to Brevo',
        error: this.extractErrorMessage(error),
      };
    }
  }

  async getCampaigns(options?: PaginationOptions): Promise<PaginatedResult<PlatformCampaign>> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 50;
      const offset = (page - 1) * limit;

      const params: Record<string, string> = {
        limit: String(limit),
        offset: String(offset),
        sort: 'desc',
      };

      if (options?.status && options.status.length > 0) {
        params.status = options.status
          .map(s => INTERNAL_STATUS_MAP[s] || s.toLowerCase())
          .join(',');
      }

      const response = await this.request<{ campaigns: any[]; count: number }>(
        'GET',
        '/emailCampaigns',
        undefined,
        params,
      );

      const campaigns = (response.campaigns || []).map((c: any) => this.mapCampaign(c));

      return {
        items: campaigns,
        total: response.count || campaigns.length,
        page,
        limit,
        hasMore: offset + campaigns.length < (response.count || 0),
      };
    } catch (error) {
      this.handleApiError(error, 'getCampaigns');
    }
  }

  async getCampaign(externalId: string): Promise<PlatformCampaign | null> {
    try {
      const campaign = await this.request<any>('GET', `/emailCampaigns/${externalId}`);
      return this.mapCampaign(campaign);
    } catch (error: any) {
      if (error.status === 404) return null;
      this.handleApiError(error, 'getCampaign');
    }
  }

  async createCampaign(input: CreateCampaignInput): Promise<PlatformCampaign> {
    try {
      const body: Record<string, any> = {
        name: input.name,
        subject: input.subjectLine,
        sender: { name: input.fromName, email: input.fromEmail },
        htmlContent: input.contentHtml,
        recipients: { listIds: [Number(input.listId)] },
      };

      if (input.previewText) {
        body.previewText = input.previewText;
      }

      const response = await this.request<{ id: number }>('POST', '/emailCampaigns', body);

      // Brevo create returns only { id }, re-fetch for full data
      const campaign = await this.getCampaign(String(response.id));
      if (!campaign) {
        throw new PlatformError('Brevo', 'createCampaign', 'Campaign not found after creation');
      }
      return campaign;
    } catch (error: any) {
      if (error instanceof PlatformError) throw error;
      this.handleApiError(error, 'createCampaign');
    }
  }

  async updateCampaign(externalId: string, updates: UpdateCampaignInput): Promise<PlatformCampaign> {
    try {
      const body: Record<string, any> = {};

      if (updates.name) body.name = updates.name;
      if (updates.subjectLine) body.subject = updates.subjectLine;
      if (updates.previewText) body.previewText = updates.previewText;
      if (updates.contentHtml) body.htmlContent = updates.contentHtml;
      if (updates.fromName || updates.fromEmail) {
        body.sender = {};
        if (updates.fromName) body.sender.name = updates.fromName;
        if (updates.fromEmail) body.sender.email = updates.fromEmail;
      }

      // PUT returns 204 No Content
      await this.request<void>('PUT', `/emailCampaigns/${externalId}`, body);

      const campaign = await this.getCampaign(externalId);
      if (!campaign) {
        throw new PlatformError('Brevo', 'updateCampaign', 'Campaign not found after update');
      }
      return campaign;
    } catch (error: any) {
      if (error instanceof PlatformError) throw error;
      this.handleApiError(error, 'updateCampaign');
    }
  }

  async scheduleCampaign(externalId: string, scheduledAt: Date): Promise<void> {
    try {
      await this.request<void>('PUT', `/emailCampaigns/${externalId}`, {
        scheduledAt: scheduledAt.toISOString(),
      });
      this.log('info', 'Campaign scheduled', { externalId, scheduledAt });
    } catch (error) {
      this.handleApiError(error, 'scheduleCampaign');
    }
  }

  async sendCampaign(externalId: string): Promise<void> {
    try {
      await this.request<void>('POST', `/emailCampaigns/${externalId}/sendNow`);
      this.log('info', 'Campaign sent', { externalId });
    } catch (error: any) {
      if (error.status === 402) {
        throw new PlatformError(
          'Brevo',
          'sendCampaign',
          'Insufficient Brevo email credits to send this campaign',
        );
      }
      this.handleApiError(error, 'sendCampaign');
    }
  }

  async getCampaignMetrics(externalId: string): Promise<PlatformMetrics> {
    try {
      const campaign = await this.request<any>(
        'GET',
        `/emailCampaigns/${externalId}`,
        undefined,
        { statistics: 'globalStats' },
      );

      const stats = campaign.statistics?.globalStats;
      if (!stats) return this.emptyMetrics();

      const sent = stats.sent || 0;
      const delivered = stats.delivered || sent - (stats.hardBounces || 0) - (stats.softBounces || 0);
      const uniqueOpens = stats.uniqueOpens || 0;
      const totalOpens = stats.viewed || uniqueOpens;
      const uniqueClicks = stats.uniqueClicks || 0;
      const totalClicks = stats.clickers || uniqueClicks;
      const bounces = (stats.hardBounces || 0) + (stats.softBounces || 0);
      const unsubscribes = stats.unsubscriptions || 0;
      const complaints = stats.spamReports || 0;

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
      let offset = 0;
      const limit = 50;

      while (true) {
        const response = await this.request<{ lists: any[]; count: number }>(
          'GET',
          '/contacts/lists',
          undefined,
          { limit: String(limit), offset: String(offset) },
        );

        const lists = (response.lists || []).map((l: any) => this.mapList(l));
        allLists.push(...lists);

        if (allLists.length >= response.count || lists.length < limit) break;
        offset += limit;
      }

      return allLists;
    } catch (error) {
      this.handleApiError(error, 'getLists');
    }
  }

  async getList(externalId: string): Promise<PlatformList | null> {
    try {
      const list = await this.request<any>('GET', `/contacts/lists/${externalId}`);
      return this.mapList(list);
    } catch (error: any) {
      if (error.status === 404) return null;
      this.handleApiError(error, 'getList');
    }
  }

  protected normalizeCampaignStatus(platformStatus: string): string {
    return BREVO_STATUS_MAP[platformStatus] || 'UNKNOWN';
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

    const headers: Record<string, string> = {
      'api-key': this.credentials.apiKey || '',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

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
        message = parsed.message || parsed.error || errorBody;
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

    // 204 No Content
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
  }

  private mapCampaign(campaign: any): PlatformCampaign {
    const stats = campaign.statistics?.globalStats;
    const metrics: PlatformMetrics | undefined = stats
      ? {
          sent: stats.sent || 0,
          delivered: stats.delivered || 0,
          uniqueOpens: stats.uniqueOpens || 0,
          totalOpens: stats.viewed || stats.uniqueOpens || 0,
          uniqueClicks: stats.uniqueClicks || 0,
          totalClicks: stats.clickers || stats.uniqueClicks || 0,
          bounces: (stats.hardBounces || 0) + (stats.softBounces || 0),
          unsubscribes: stats.unsubscriptions || 0,
          complaints: stats.spamReports || 0,
          openRate: (stats.sent || 0) > 0 ? (stats.uniqueOpens || 0) / (stats.sent || 1) : 0,
          clickRate: (stats.sent || 0) > 0 ? (stats.uniqueClicks || 0) / (stats.sent || 1) : 0,
          bounceRate: (stats.sent || 0) > 0
            ? ((stats.hardBounces || 0) + (stats.softBounces || 0)) / (stats.sent || 1)
            : 0,
          unsubscribeRate: (stats.sent || 0) > 0
            ? (stats.unsubscriptions || 0) / (stats.sent || 1)
            : 0,
        }
      : undefined;

    return {
      externalId: String(campaign.id),
      name: campaign.name || '',
      subjectLine: campaign.subject || '',
      previewText: campaign.previewText || '',
      fromName: campaign.sender?.name || '',
      fromEmail: campaign.sender?.email || '',
      status: this.normalizeCampaignStatus(campaign.status),
      contentHtml: campaign.htmlContent || undefined,
      listId: campaign.recipients?.listIds?.[0] != null
        ? String(campaign.recipients.listIds[0])
        : undefined,
      scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt) : undefined,
      sentAt: campaign.sentDate ? new Date(campaign.sentDate) : undefined,
      metrics,
      metadata: {
        tag: campaign.tag,
        createdAt: campaign.createdAt,
        modifiedAt: campaign.modifiedAt,
      },
    };
  }

  private mapList(list: any): PlatformList {
    return {
      externalId: String(list.id),
      name: list.name || '',
      memberCount: list.totalSubscribers || list.uniqueSubscribers || 0,
      createdAt: list.createdAt ? new Date(list.createdAt) : undefined,
      metadata: {
        folderId: list.folderId,
        totalBlacklisted: list.totalBlacklisted,
        dynamicList: list.dynamicList,
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
