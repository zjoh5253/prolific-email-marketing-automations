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

const BASE_URL = 'https://api.hubapi.com';

const HUBSPOT_STATUS_MAP: Record<string, string> = {
  DRAFT: 'DRAFT',
  AUTOMATED_DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'SENT',
  AUTOMATED: 'SENT',
  CANCELED: 'CANCELLED',
  CANCELLED: 'CANCELLED',
};

const INTERNAL_STATUS_MAP: Record<string, string> = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  SENT: 'PUBLISHED',
  CANCELLED: 'CANCELED',
  SENDING: 'PUBLISHED',
};

export class HubSpotAdapter extends EmailPlatformAdapter {
  constructor(clientId: string, credentials: PlatformCredentials) {
    super(clientId, credentials, 'HubSpot');
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const account = await this.request<{
        portalId: number;
        uiDomain: string;
        companyName?: string;
      }>('GET', '/account-info/v3/details');

      return {
        success: true,
        message: 'Successfully connected to HubSpot',
        accountInfo: {
          id: String(account.portalId),
          name: account.companyName || account.uiDomain || String(account.portalId),
        },
      };
    } catch (error) {
      this.log('error', 'Connection test failed', { error: this.extractErrorMessage(error) });
      return {
        success: false,
        message: 'Failed to connect to HubSpot',
        error: this.extractErrorMessage(error),
      };
    }
  }

  async getCampaigns(options?: PaginationOptions): Promise<PaginatedResult<PlatformCampaign>> {
    try {
      const limit = options?.limit || 50;

      const params: Record<string, string> = {
        limit: String(limit),
      };

      // HubSpot uses cursor pagination; page > 1 not supported without external cursor tracking
      // Callers should use the hasMore flag and manage cursor state externally

      const response = await this.request<{
        results: any[];
        total: number;
        paging?: { next?: { after: string } };
      }>('GET', '/marketing/v3/emails', undefined, params);

      const campaigns = (response.results || []).map((e: any) => this.mapEmail(e));
      const after = response.paging?.next?.after;

      return {
        items: campaigns,
        total: response.total || campaigns.length,
        page: options?.page || 1,
        limit,
        hasMore: !!after,
      };
    } catch (error) {
      this.handleApiError(error, 'getCampaigns');
    }
  }

  async getCampaign(externalId: string): Promise<PlatformCampaign | null> {
    try {
      const email = await this.request<any>('GET', `/marketing/v3/emails/${externalId}`);
      return this.mapEmail(email);
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
        fromName: input.fromName,
        content: {
          html: input.contentHtml,
          plainText: input.contentText || '',
        },
      };

      if (input.previewText) {
        body.preheaderText = input.previewText;
      }

      if (input.listId) {
        body.activeContactListId = Number(input.listId);
      }

      const response = await this.request<any>('POST', '/marketing/v3/emails', body);
      return this.mapEmail(response);
    } catch (error) {
      this.handleApiError(error, 'createCampaign');
    }
  }

  async updateCampaign(externalId: string, updates: UpdateCampaignInput): Promise<PlatformCampaign> {
    try {
      const body: Record<string, any> = {};

      if (updates.name) body.name = updates.name;
      if (updates.subjectLine) body.subject = updates.subjectLine;
      if (updates.previewText) body.preheaderText = updates.previewText;
      if (updates.fromName) body.fromName = updates.fromName;
      if (updates.contentHtml || updates.contentText) {
        body.content = {};
        if (updates.contentHtml) body.content.html = updates.contentHtml;
        if (updates.contentText) body.content.plainText = updates.contentText;
      }

      const response = await this.request<any>(
        'PATCH',
        `/marketing/v3/emails/${externalId}`,
        body,
      );
      return this.mapEmail(response);
    } catch (error) {
      this.handleApiError(error, 'updateCampaign');
    }
  }

  async scheduleCampaign(externalId: string, scheduledAt: Date): Promise<void> {
    try {
      // Set the publish date
      await this.request<any>('PATCH', `/marketing/v3/emails/${externalId}`, {
        publishDate: scheduledAt.toISOString(),
      });

      // Then trigger publish (Enterprise only)
      await this.request<void>('POST', `/marketing/v3/emails/${externalId}/publish`);
      this.log('info', 'Campaign scheduled', { externalId, scheduledAt });
    } catch (error: any) {
      if (error.status === 403) {
        throw new PlatformError(
          'HubSpot',
          'scheduleCampaign',
          'Scheduling campaigns requires a HubSpot Marketing Hub Enterprise subscription',
        );
      }
      this.handleApiError(error, 'scheduleCampaign');
    }
  }

  async sendCampaign(externalId: string): Promise<void> {
    try {
      await this.request<void>('POST', `/marketing/v3/emails/${externalId}/publish`);
      this.log('info', 'Campaign sent', { externalId });
    } catch (error: any) {
      if (error.status === 403) {
        throw new PlatformError(
          'HubSpot',
          'sendCampaign',
          'Sending campaigns via API requires a HubSpot Marketing Hub Enterprise subscription',
        );
      }
      this.handleApiError(error, 'sendCampaign');
    }
  }

  async getCampaignMetrics(externalId: string): Promise<PlatformMetrics> {
    try {
      const email = await this.request<any>('GET', `/marketing/v3/emails/${externalId}`);

      const stats = email.stats;
      if (!stats) return this.emptyMetrics();

      const sent = stats.counters?.sent || 0;
      const delivered = stats.counters?.delivered || sent;
      const uniqueOpens = stats.counters?.open || 0;
      const totalOpens = stats.counters?.open || 0;
      const uniqueClicks = stats.counters?.click || 0;
      const totalClicks = stats.counters?.click || 0;
      const bounces = stats.counters?.bounce || 0;
      const unsubscribes = stats.counters?.unsubscribed || 0;
      const complaints = stats.counters?.spamreport || 0;

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
      const response = await this.request<{
        lists: any[];
        'has-more'?: boolean;
        offset?: number;
      }>('GET', '/crm/v3/lists', undefined, { count: '250' });

      return (response.lists || []).map((l: any) => this.mapList(l));
    } catch (error) {
      this.handleApiError(error, 'getLists');
    }
  }

  async getList(externalId: string): Promise<PlatformList | null> {
    try {
      const list = await this.request<any>('GET', `/crm/v3/lists/${externalId}`);
      return this.mapList(list);
    } catch (error: any) {
      if (error.status === 404) return null;
      this.handleApiError(error, 'getList');
    }
  }

  protected normalizeCampaignStatus(platformStatus: string): string {
    return HUBSPOT_STATUS_MAP[platformStatus] || 'UNKNOWN';
  }

  protected mapCampaignStatus(internalStatus: string): string {
    return INTERNAL_STATUS_MAP[internalStatus] || 'DRAFT';
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
      Authorization: `Bearer ${this.credentials.accessToken}`,
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
        message = parsed.message || parsed.errors?.[0]?.message || parsed.error || errorBody;
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

  private mapEmail(email: any): PlatformCampaign {
    // Check archived boolean — overrides status
    let status: string;
    if (email.archived === true) {
      status = 'ARCHIVED';
    } else {
      status = this.normalizeCampaignStatus(email.state || email.status || '');
    }

    const stats = email.stats;
    const sent = stats?.counters?.sent || 0;
    const metrics: PlatformMetrics | undefined = stats
      ? {
          sent,
          delivered: stats.counters?.delivered || sent,
          uniqueOpens: stats.counters?.open || 0,
          totalOpens: stats.counters?.open || 0,
          uniqueClicks: stats.counters?.click || 0,
          totalClicks: stats.counters?.click || 0,
          bounces: stats.counters?.bounce || 0,
          unsubscribes: stats.counters?.unsubscribed || 0,
          complaints: stats.counters?.spamreport || 0,
          openRate: sent > 0 ? (stats.counters?.open || 0) / sent : 0,
          clickRate: sent > 0 ? (stats.counters?.click || 0) / sent : 0,
          bounceRate: sent > 0 ? (stats.counters?.bounce || 0) / sent : 0,
          unsubscribeRate: sent > 0 ? (stats.counters?.unsubscribed || 0) / sent : 0,
        }
      : undefined;

    return {
      externalId: String(email.id),
      name: email.name || '',
      subjectLine: email.subject || '',
      previewText: email.preheaderText || '',
      fromName: email.fromName || '',
      fromEmail: email.from || '',
      status,
      contentHtml: email.content?.html || undefined,
      contentText: email.content?.plainText || undefined,
      listId: email.activeContactListId ? String(email.activeContactListId) : undefined,
      scheduledAt: email.publishDate ? new Date(email.publishDate) : undefined,
      sentAt: email.publishedAt ? new Date(email.publishedAt) : undefined,
      metrics,
      metadata: {
        portalId: email.portalId,
        createdAt: email.createdAt,
        updatedAt: email.updatedAt,
        archived: email.archived,
      },
    };
  }

  private mapList(list: any): PlatformList {
    return {
      externalId: String(list.listId || list.id),
      name: list.name || '',
      memberCount: list.metaData?.size || list.size || 0,
      createdAt: list.createdAt ? new Date(list.createdAt) : undefined,
      updatedAt: list.updatedAt ? new Date(list.updatedAt) : undefined,
      metadata: {
        listType: list.listType,
        dynamic: list.dynamic,
        portalId: list.portalId,
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
