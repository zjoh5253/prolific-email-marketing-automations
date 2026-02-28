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

const BASE_URL = 'https://api.beehiiv.com/v2';

// Beehiiv only has 3 post statuses; we infer SCHEDULED vs SENT from scheduled_at
const BEEHIIV_STATUS_MAP: Record<string, string> = {
  draft: 'DRAFT',
  confirmed: 'SENT', // default; overridden to SCHEDULED if scheduled_at is in the future
  archived: 'ARCHIVED',
};

const INTERNAL_STATUS_MAP: Record<string, string> = {
  DRAFT: 'draft',
  SCHEDULED: 'confirmed',
  SENT: 'confirmed',
  ARCHIVED: 'archived',
};

export class BeehiivAdapter extends EmailPlatformAdapter {
  private publicationId: string;

  constructor(clientId: string, credentials: PlatformCredentials) {
    super(clientId, credentials, 'Beehiiv');
    this.publicationId = credentials.accountId || '';
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      // Verify API key works by listing publications
      await this.request<{ data: any[] }>('GET', '/publications');

      if (!this.publicationId) {
        return {
          success: false,
          message: 'Missing publication ID (accountId credential)',
          error: 'accountId is required',
        };
      }

      // Verify the specific publication exists
      const pub = await this.request<{ data: any }>('GET', `/publications/${this.publicationId}`);

      return {
        success: true,
        message: 'Successfully connected to Beehiiv',
        accountInfo: {
          id: pub.data.id,
          name: pub.data.name || pub.data.id,
          email: pub.data.email_from_address,
          plan: pub.data.plan,
        },
      };
    } catch (error) {
      this.log('error', 'Connection test failed', { error: this.extractErrorMessage(error) });
      return {
        success: false,
        message: 'Failed to connect to Beehiiv',
        error: this.extractErrorMessage(error),
      };
    }
  }

  async getCampaigns(options?: PaginationOptions): Promise<PaginatedResult<PlatformCampaign>> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 50;

      const params: Record<string, string> = {
        page: String(page),
        limit: String(limit),
        'expand[]': 'stats',
      };

      if (options?.status && options.status.length > 0) {
        params.status = options.status
          .map(s => INTERNAL_STATUS_MAP[s] || s.toLowerCase())
          .join(',');
      }

      const response = await this.request<{ data: any[]; total_results: number }>(
        'GET',
        `/publications/${this.publicationId}/posts`,
        undefined,
        params,
      );

      const campaigns = response.data.map((post: any) => this.mapPost(post));

      return {
        items: campaigns,
        total: response.total_results ?? campaigns.length,
        page,
        limit,
        hasMore: campaigns.length === limit,
      };
    } catch (error) {
      this.handleApiError(error, 'getCampaigns');
    }
  }

  async getCampaign(externalId: string): Promise<PlatformCampaign | null> {
    try {
      const response = await this.request<{ data: any }>(
        'GET',
        `/publications/${this.publicationId}/posts/${externalId}`,
        undefined,
        { 'expand[]': 'stats' },
      );
      return this.mapPost(response.data);
    } catch (error: any) {
      if (error.status === 404 || error.statusCode === 404) return null;
      this.handleApiError(error, 'getCampaign');
    }
  }

  async createCampaign(input: CreateCampaignInput): Promise<PlatformCampaign> {
    try {
      const body: Record<string, any> = {
        title: input.name,
        subtitle: input.previewText || '',
        content_html: input.contentHtml,
        status: 'draft',
      };

      if (input.metadata?.segmentId) {
        body.segment_id = input.metadata.segmentId;
      }

      const response = await this.request<{ data: any }>(
        'POST',
        `/publications/${this.publicationId}/posts`,
        body,
      );

      return this.mapPost(response.data);
    } catch (error: any) {
      if (error.status === 403 || error.status === 402) {
        throw new PlatformError(
          'Beehiiv',
          'createCampaign',
          'Post creation via API requires a Beehiiv Enterprise plan',
        );
      }
      this.handleApiError(error, 'createCampaign');
    }
  }

  async updateCampaign(externalId: string, updates: UpdateCampaignInput): Promise<PlatformCampaign> {
    try {
      const body: Record<string, any> = {};

      if (updates.name) body.title = updates.name;
      if (updates.subjectLine) body.subtitle = updates.subjectLine;
      if (updates.contentHtml) body.content_html = updates.contentHtml;

      await this.request<{ data: any }>(
        'PATCH',
        `/publications/${this.publicationId}/posts/${externalId}`,
        body,
      );

      // Fetch the updated post
      const updated = await this.getCampaign(externalId);
      if (!updated) {
        throw new PlatformError('Beehiiv', 'updateCampaign', 'Post not found after update');
      }
      return updated;
    } catch (error: any) {
      if (error instanceof PlatformError) throw error;
      if (error.status === 403 || error.status === 402) {
        throw new PlatformError(
          'Beehiiv',
          'updateCampaign',
          'Post updates via API require a Beehiiv Enterprise plan',
        );
      }
      this.handleApiError(error, 'updateCampaign');
    }
  }

  async scheduleCampaign(externalId: string, scheduledAt: Date): Promise<void> {
    try {
      await this.request<any>(
        'PATCH',
        `/publications/${this.publicationId}/posts/${externalId}`,
        {
          status: 'confirmed',
          scheduled_at: scheduledAt.toISOString(),
        },
      );
      this.log('info', 'Campaign scheduled', { externalId, scheduledAt });
    } catch (error: any) {
      if (error.status === 403 || error.status === 402) {
        throw new PlatformError(
          'Beehiiv',
          'scheduleCampaign',
          'Scheduling via API requires a Beehiiv Enterprise plan',
        );
      }
      this.handleApiError(error, 'scheduleCampaign');
    }
  }

  async sendCampaign(externalId: string): Promise<void> {
    try {
      await this.request<any>(
        'PATCH',
        `/publications/${this.publicationId}/posts/${externalId}`,
        { status: 'confirmed' },
      );
      this.log('info', 'Campaign sent', { externalId });
    } catch (error: any) {
      if (error.status === 403 || error.status === 402) {
        throw new PlatformError(
          'Beehiiv',
          'sendCampaign',
          'Sending via API requires a Beehiiv Enterprise plan',
        );
      }
      this.handleApiError(error, 'sendCampaign');
    }
  }

  async getCampaignMetrics(externalId: string): Promise<PlatformMetrics> {
    try {
      const response = await this.request<{ data: any }>(
        'GET',
        `/publications/${this.publicationId}/posts/${externalId}`,
        undefined,
        { 'expand[]': 'stats' },
      );

      const stats = response.data?.stats;
      if (!stats) return this.emptyMetrics();

      const sent = stats.email?.recipients || 0;
      const delivered = sent - (stats.email?.bounces || 0);
      const uniqueOpens = stats.email?.unique_opens || 0;
      const totalOpens = stats.email?.total_opens || stats.email?.unique_opens || 0;
      const uniqueClicks = stats.email?.unique_clicks || 0;
      const totalClicks = stats.email?.total_clicks || stats.email?.unique_clicks || 0;
      const bounces = stats.email?.bounces || 0;
      const unsubscribes = stats.email?.unsubscribes || 0;
      const complaints = stats.email?.spam_reports || 0;

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
      if (error.status === 404 || error.statusCode === 404) {
        return this.emptyMetrics();
      }
      this.handleApiError(error, 'getCampaignMetrics');
    }
  }

  async getLists(): Promise<PlatformList[]> {
    try {
      const response = await this.request<{ data: any[] }>(
        'GET',
        `/publications/${this.publicationId}/segments`,
      );
      return response.data.map((segment: any) => this.mapSegment(segment));
    } catch (error) {
      this.handleApiError(error, 'getLists');
    }
  }

  async getList(externalId: string): Promise<PlatformList | null> {
    try {
      const response = await this.request<{ data: any }>(
        'GET',
        `/publications/${this.publicationId}/segments/${externalId}`,
      );
      return this.mapSegment(response.data);
    } catch (error: any) {
      if (error.status === 404 || error.statusCode === 404) return null;
      this.handleApiError(error, 'getList');
    }
  }

  protected normalizeCampaignStatus(platformStatus: string): string {
    return BEEHIIV_STATUS_MAP[platformStatus] || 'UNKNOWN';
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
      Authorization: `Bearer ${this.credentials.apiKey}`,
      'Content-Type': 'application/json',
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
        message = parsed.errors?.[0]?.message || parsed.message || parsed.error || errorBody;
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

    return res.json() as Promise<T>;
  }

  private mapPost(post: any): PlatformCampaign {
    // Beehiiv timestamps are Unix seconds
    const scheduledAt = post.scheduled_at ? new Date(post.scheduled_at * 1000) : undefined;
    const publishDate = post.publish_date ? new Date(post.publish_date * 1000) : undefined;

    // Infer status: confirmed + future scheduled_at = SCHEDULED, otherwise SENT
    let status = this.normalizeCampaignStatus(post.status);
    if (post.status === 'confirmed' && scheduledAt && scheduledAt.getTime() > Date.now()) {
      status = 'SCHEDULED';
    }

    const stats = post.stats;
    const metrics: PlatformMetrics | undefined = stats
      ? {
          sent: stats.email?.recipients || 0,
          delivered: (stats.email?.recipients || 0) - (stats.email?.bounces || 0),
          uniqueOpens: stats.email?.unique_opens || 0,
          totalOpens: stats.email?.total_opens || stats.email?.unique_opens || 0,
          uniqueClicks: stats.email?.unique_clicks || 0,
          totalClicks: stats.email?.total_clicks || stats.email?.unique_clicks || 0,
          bounces: stats.email?.bounces || 0,
          unsubscribes: stats.email?.unsubscribes || 0,
          complaints: stats.email?.spam_reports || 0,
          openRate: (stats.email?.recipients || 0) > 0
            ? (stats.email?.unique_opens || 0) / (stats.email?.recipients || 1)
            : 0,
          clickRate: (stats.email?.recipients || 0) > 0
            ? (stats.email?.unique_clicks || 0) / (stats.email?.recipients || 1)
            : 0,
          bounceRate: (stats.email?.recipients || 0) > 0
            ? (stats.email?.bounces || 0) / (stats.email?.recipients || 1)
            : 0,
          unsubscribeRate: (stats.email?.recipients || 0) > 0
            ? (stats.email?.unsubscribes || 0) / (stats.email?.recipients || 1)
            : 0,
        }
      : undefined;

    return {
      externalId: post.id,
      name: post.title || '',
      subjectLine: post.subtitle || post.title || '',
      previewText: post.preview_text || '',
      fromName: post.authors?.[0]?.name || '',
      fromEmail: post.authors?.[0]?.email || '',
      status,
      contentHtml: post.content?.html || undefined,
      contentText: post.content?.free?.web || undefined,
      scheduledAt,
      sentAt: status === 'SENT' && publishDate ? publishDate : undefined,
      metrics,
      metadata: {
        slug: post.slug,
        audienceId: post.audience,
        thumbnailUrl: post.thumbnail_url,
        webUrl: post.web_url,
        createdAt: post.created ? new Date(post.created * 1000).toISOString() : undefined,
      },
    };
  }

  private mapSegment(segment: any): PlatformList {
    return {
      externalId: segment.id,
      name: segment.name || '',
      memberCount: segment.subscriber_count || segment.count || 0,
      createdAt: segment.created_at ? new Date(segment.created_at * 1000) : undefined,
      updatedAt: segment.updated_at ? new Date(segment.updated_at * 1000) : undefined,
      metadata: {
        type: segment.type,
        status: segment.status,
        description: segment.description,
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
