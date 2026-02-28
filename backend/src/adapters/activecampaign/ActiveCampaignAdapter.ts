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

// Numeric statuses as strings
const AC_STATUS_MAP: Record<string, string> = {
  '0': 'DRAFT',
  '1': 'SCHEDULED',
  '2': 'SENDING',
  '3': 'CANCELLED', // paused
  '4': 'CANCELLED', // stopped
  '5': 'SENT',      // completed
  '6': 'DRAFT',     // disabled
};

const INTERNAL_STATUS_MAP: Record<string, string> = {
  DRAFT: '0',
  SCHEDULED: '1',
  SENDING: '2',
  CANCELLED: '4',
  SENT: '5',
};

const DATE_SENTINEL = '0000-00-00 00:00:00';

export class ActiveCampaignAdapter extends EmailPlatformAdapter {
  private baseUrl: string;

  constructor(clientId: string, credentials: PlatformCredentials) {
    super(clientId, credentials, 'ActiveCampaign');
    // Account-specific URL: strip trailing slash, append /api/3
    const accountUrl = (credentials.accountUrl || '').replace(/\/+$/, '');
    this.baseUrl = `${accountUrl}/api/3`;
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const response = await this.request<{ user: any }>('GET', '/users/me');
      const user = response.user;

      return {
        success: true,
        message: 'Successfully connected to ActiveCampaign',
        accountInfo: {
          id: String(user.id),
          name: user.username || user.firstName || String(user.id),
          email: user.email,
        },
      };
    } catch (error) {
      this.log('error', 'Connection test failed', { error: this.extractErrorMessage(error) });
      return {
        success: false,
        message: 'Failed to connect to ActiveCampaign',
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
      };

      const response = await this.request<{
        campaigns: any[];
        meta: { total: string };
      }>('GET', '/campaigns', undefined, params);

      const campaigns = (response.campaigns || []).map((c: any) => this.mapCampaign(c));
      const total = parseInt(response.meta?.total || '0', 10);

      return {
        items: campaigns,
        total,
        page,
        limit,
        hasMore: offset + campaigns.length < total,
      };
    } catch (error) {
      this.handleApiError(error, 'getCampaigns');
    }
  }

  async getCampaign(externalId: string): Promise<PlatformCampaign | null> {
    try {
      const response = await this.request<{ campaign: any }>('GET', `/campaigns/${externalId}`);
      return this.mapCampaign(response.campaign);
    } catch (error: any) {
      if (error.status === 404) return null;
      this.handleApiError(error, 'getCampaign');
    }
  }

  async createCampaign(input: CreateCampaignInput): Promise<PlatformCampaign> {
    try {
      // Step 1: Create the campaign
      const campaignBody = {
        campaign: {
          type: 'single',
          name: input.name,
          status: 0, // draft
          segmentid: 0, // default — no segment
          p: { [input.listId]: input.listId },
        },
      };

      const createResponse = await this.request<{ campaign: any }>(
        'POST',
        '/campaigns',
        campaignBody,
      );

      const campaignId = createResponse.campaign.id;

      // Step 2: Create the campaign message with content
      const messageBody = {
        message: {
          campaignid: campaignId,
          subject: input.subjectLine,
          preheader_text: input.previewText || '',
          fromname: input.fromName,
          fromemail: input.fromEmail,
          html: input.contentHtml,
          text: input.contentText || '',
        },
      };

      await this.request<any>('POST', `/campaigns/${campaignId}/messages`, messageBody);

      // Re-fetch the full campaign
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) {
        throw new PlatformError(
          'ActiveCampaign',
          'createCampaign',
          'Campaign not found after creation',
        );
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

      if (Object.keys(body).length > 0) {
        await this.request<any>('PUT', `/campaigns/${externalId}`, { campaign: body });
      }

      // For content updates (subject, html, etc.), update the message
      if (updates.subjectLine || updates.contentHtml || updates.fromName || updates.fromEmail || updates.previewText) {
        // Get the campaign to find its message ID
        const campaignResponse = await this.request<{ campaign: any }>(
          'GET',
          `/campaigns/${externalId}`,
        );
        const messageId = campaignResponse.campaign?.activerss_items?.[0]?.messageid;

        if (messageId) {
          const messageBody: Record<string, any> = {};
          if (updates.subjectLine) messageBody.subject = updates.subjectLine;
          if (updates.contentHtml) messageBody.html = updates.contentHtml;
          if (updates.contentText) messageBody.text = updates.contentText;
          if (updates.fromName) messageBody.fromname = updates.fromName;
          if (updates.fromEmail) messageBody.fromemail = updates.fromEmail;
          if (updates.previewText) messageBody.preheader_text = updates.previewText;

          await this.request<any>(`PUT`, `/messages/${messageId}`, { message: messageBody });
        }
      }

      const campaign = await this.getCampaign(externalId);
      if (!campaign) {
        throw new PlatformError(
          'ActiveCampaign',
          'updateCampaign',
          'Campaign not found after update',
        );
      }
      return campaign;
    } catch (error: any) {
      if (error instanceof PlatformError) throw error;
      this.handleApiError(error, 'updateCampaign');
    }
  }

  async scheduleCampaign(externalId: string, scheduledAt: Date): Promise<void> {
    try {
      // Format date as ActiveCampaign expects: YYYY-MM-DD HH:mm:ss
      const sdate = scheduledAt.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');

      await this.request<any>('PUT', `/campaigns/${externalId}`, {
        campaign: {
          status: 1, // scheduled
          sdate,
        },
      });
      this.log('info', 'Campaign scheduled', { externalId, scheduledAt });
    } catch (error) {
      this.handleApiError(error, 'scheduleCampaign');
    }
  }

  async sendCampaign(externalId: string): Promise<void> {
    try {
      await this.request<any>('PUT', `/campaigns/${externalId}`, {
        campaign: { status: 2 }, // sending
      });
      this.log('info', 'Campaign sent', { externalId });
    } catch (error) {
      this.handleApiError(error, 'sendCampaign');
    }
  }

  async getCampaignMetrics(externalId: string): Promise<PlatformMetrics> {
    try {
      const response = await this.request<{ campaign: any }>('GET', `/campaigns/${externalId}`);
      const c = response.campaign;
      if (!c) return this.emptyMetrics();

      const sent = parseInt(c.send_amt || '0', 10);
      const uniqueOpens = parseInt(c.uniqueopens || '0', 10);
      const totalOpens = parseInt(c.opens || c.uniqueopens || '0', 10);
      const uniqueClicks = parseInt(c.uniquelinkclicks || '0', 10);
      const totalClicks = parseInt(c.linkclicks || c.uniquelinkclicks || '0', 10);
      const bounces = parseInt(c.hardbounces || '0', 10) + parseInt(c.softbounces || '0', 10);
      const unsubscribes = parseInt(c.unsubscribes || '0', 10);
      const complaints = parseInt(c.spamcount || '0', 10);
      const delivered = sent - bounces;

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
      const limit = 100;

      while (true) {
        const response = await this.request<{ lists: any[]; meta: { total: string } }>(
          'GET',
          '/lists',
          undefined,
          { limit: String(limit), offset: String(offset) },
        );

        const lists = (response.lists || []).map((l: any) => this.mapList(l));
        allLists.push(...lists);

        const total = parseInt(response.meta?.total || '0', 10);
        if (allLists.length >= total || lists.length < limit) break;
        offset += limit;
      }

      return allLists;
    } catch (error) {
      this.handleApiError(error, 'getLists');
    }
  }

  async getList(externalId: string): Promise<PlatformList | null> {
    try {
      const response = await this.request<{ list: any }>('GET', `/lists/${externalId}`);
      return this.mapList(response.list);
    } catch (error: any) {
      if (error.status === 404) return null;
      this.handleApiError(error, 'getList');
    }
  }

  protected normalizeCampaignStatus(platformStatus: string): string {
    return AC_STATUS_MAP[String(platformStatus)] || 'UNKNOWN';
  }

  protected mapCampaignStatus(internalStatus: string): string {
    return INTERNAL_STATUS_MAP[internalStatus] || '0';
  }

  // --- Private helpers ---

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, any>,
    queryParams?: Record<string, string>,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        url.searchParams.append(key, value);
      }
    }

    const headers: Record<string, string> = {
      'Api-Token': this.credentials.apiKey || '',
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
        message = parsed.message || parsed.errors?.[0]?.title || parsed.error || errorBody;
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

  private parseDate(dateStr: string | null | undefined): Date | undefined {
    if (!dateStr || dateStr === DATE_SENTINEL) return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
  }

  private mapCampaign(campaign: any): PlatformCampaign {
    const sent = parseInt(campaign.send_amt || '0', 10);
    const hasStats = sent > 0;

    const metrics: PlatformMetrics | undefined = hasStats
      ? {
          sent,
          delivered: sent - (parseInt(campaign.hardbounces || '0', 10) + parseInt(campaign.softbounces || '0', 10)),
          uniqueOpens: parseInt(campaign.uniqueopens || '0', 10),
          totalOpens: parseInt(campaign.opens || campaign.uniqueopens || '0', 10),
          uniqueClicks: parseInt(campaign.uniquelinkclicks || '0', 10),
          totalClicks: parseInt(campaign.linkclicks || campaign.uniquelinkclicks || '0', 10),
          bounces: parseInt(campaign.hardbounces || '0', 10) + parseInt(campaign.softbounces || '0', 10),
          unsubscribes: parseInt(campaign.unsubscribes || '0', 10),
          complaints: parseInt(campaign.spamcount || '0', 10),
          openRate: sent > 0 ? parseInt(campaign.uniqueopens || '0', 10) / sent : 0,
          clickRate: sent > 0 ? parseInt(campaign.uniquelinkclicks || '0', 10) / sent : 0,
          bounceRate: sent > 0
            ? (parseInt(campaign.hardbounces || '0', 10) + parseInt(campaign.softbounces || '0', 10)) / sent
            : 0,
          unsubscribeRate: sent > 0 ? parseInt(campaign.unsubscribes || '0', 10) / sent : 0,
        }
      : undefined;

    return {
      externalId: String(campaign.id),
      name: campaign.name || '',
      subjectLine: campaign.subject || '',
      status: this.normalizeCampaignStatus(campaign.status),
      scheduledAt: this.parseDate(campaign.sdate),
      sentAt: this.parseDate(campaign.ldate),
      metrics,
      metadata: {
        type: campaign.type,
        cdate: campaign.cdate,
        mdate: campaign.mdate,
        segmentid: campaign.segmentid,
      },
    };
  }

  private mapList(list: any): PlatformList {
    return {
      externalId: String(list.id),
      name: list.name || '',
      memberCount: parseInt(list.subscriber_count || '0', 10),
      createdAt: this.parseDate(list.cdate),
      updatedAt: this.parseDate(list.udate),
      metadata: {
        stringid: list.stringid,
        sender_name: list.sender_name,
        sender_addr: list.sender_addr,
        sender_city: list.sender_city,
        sender_url: list.sender_url,
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
