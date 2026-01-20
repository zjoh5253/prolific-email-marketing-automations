import mailchimp from '@mailchimp/mailchimp_marketing';
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

// Mailchimp status mappings
const MAILCHIMP_STATUS_MAP: Record<string, string> = {
  save: 'DRAFT',
  paused: 'DRAFT',
  schedule: 'SCHEDULED',
  sending: 'SENDING',
  sent: 'SENT',
  canceled: 'CANCELLED',
  archived: 'ARCHIVED',
};

const INTERNAL_STATUS_MAP: Record<string, string> = {
  DRAFT: 'save',
  SCHEDULED: 'schedule',
  SENT: 'sent',
  CANCELLED: 'canceled',
  ARCHIVED: 'archived',
};

export class MailchimpAdapter extends EmailPlatformAdapter {
  private client: typeof mailchimp;

  constructor(clientId: string, credentials: PlatformCredentials) {
    super(clientId, credentials, 'Mailchimp');

    // Extract data center from API key (format: key-dc1)
    const apiKey = credentials.apiKey || '';
    const dataCenter = credentials.dataCenter || apiKey.split('-').pop() || 'us1';

    this.client = mailchimp;
    this.client.setConfig({
      apiKey,
      server: dataCenter,
    });
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const response = await this.client.ping.get();

      if (response.health_status === 'Everything\'s Chimpy!') {
        // Get account info
        const account = await this.client.root.getRoot() as any;

        return {
          success: true,
          message: 'Successfully connected to Mailchimp',
          accountInfo: {
            id: account.account_id,
            name: account.account_name,
            email: account.email,
            plan: account.pricing_plan_type,
          },
        };
      }

      return {
        success: false,
        message: 'Mailchimp health check failed',
      };
    } catch (error) {
      this.log('error', 'Connection test failed', { error: this.extractErrorMessage(error) });
      return {
        success: false,
        message: 'Failed to connect to Mailchimp',
        error: this.extractErrorMessage(error),
      };
    }
  }

  async getCampaigns(options?: PaginationOptions): Promise<PaginatedResult<PlatformCampaign>> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 50;
      const offset = (page - 1) * limit;

      const queryParams: any = {
        count: limit,
        offset,
        sort_field: 'send_time',
        sort_dir: 'DESC',
      };

      if (options?.since) {
        queryParams.since_send_time = options.since.toISOString();
      }

      if (options?.status && options.status.length > 0) {
        queryParams.status = options.status.map(s => INTERNAL_STATUS_MAP[s] || s).join(',');
      }

      const response = await this.client.campaigns.list(queryParams) as any;

      const campaigns: PlatformCampaign[] = response.campaigns.map((c: any) => this.mapCampaign(c));

      return {
        items: campaigns,
        total: response.total_items,
        page,
        limit,
        hasMore: offset + campaigns.length < response.total_items,
      };
    } catch (error) {
      this.handleApiError(error, 'getCampaigns');
    }
  }

  async getCampaign(externalId: string): Promise<PlatformCampaign | null> {
    try {
      const campaign = await this.client.campaigns.get(externalId) as any;
      return this.mapCampaign(campaign);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      this.handleApiError(error, 'getCampaign');
    }
  }

  async createCampaign(input: CreateCampaignInput): Promise<PlatformCampaign> {
    try {
      // Create campaign
      const campaign = await this.client.campaigns.create({
        type: 'regular',
        recipients: {
          list_id: input.listId,
        },
        settings: {
          subject_line: input.subjectLine,
          preview_text: input.previewText || '',
          title: input.name,
          from_name: input.fromName,
          reply_to: input.fromEmail,
        },
      }) as any;

      // Set campaign content
      await this.client.campaigns.setContent(campaign.id, {
        html: input.contentHtml,
        plain_text: input.contentText,
      });

      // Fetch full campaign data
      const fullCampaign = await this.client.campaigns.get(campaign.id) as any;
      return this.mapCampaign(fullCampaign);
    } catch (error) {
      this.handleApiError(error, 'createCampaign');
    }
  }

  async updateCampaign(externalId: string, updates: UpdateCampaignInput): Promise<PlatformCampaign> {
    try {
      const updateData: any = {
        settings: {},
      };

      if (updates.name) updateData.settings.title = updates.name;
      if (updates.subjectLine) updateData.settings.subject_line = updates.subjectLine;
      if (updates.previewText) updateData.settings.preview_text = updates.previewText;
      if (updates.fromName) updateData.settings.from_name = updates.fromName;
      if (updates.fromEmail) updateData.settings.reply_to = updates.fromEmail;

      await this.client.campaigns.update(externalId, updateData);

      // Update content if provided
      if (updates.contentHtml) {
        await this.client.campaigns.setContent(externalId, {
          html: updates.contentHtml,
          plain_text: updates.contentText,
        });
      }

      const campaign = await this.client.campaigns.get(externalId) as any;
      return this.mapCampaign(campaign);
    } catch (error) {
      this.handleApiError(error, 'updateCampaign');
    }
  }

  async scheduleCampaign(externalId: string, scheduledAt: Date): Promise<void> {
    try {
      await this.client.campaigns.schedule(externalId, {
        schedule_time: scheduledAt.toISOString(),
      });
      this.log('info', 'Campaign scheduled', { externalId, scheduledAt });
    } catch (error) {
      this.handleApiError(error, 'scheduleCampaign');
    }
  }

  async sendCampaign(externalId: string): Promise<void> {
    try {
      await this.client.campaigns.send(externalId);
      this.log('info', 'Campaign sent', { externalId });
    } catch (error) {
      this.handleApiError(error, 'sendCampaign');
    }
  }

  async getCampaignMetrics(externalId: string): Promise<PlatformMetrics> {
    try {
      const report = await this.client.reports.getCampaignReport(externalId) as any;

      return {
        sent: report.emails_sent || 0,
        delivered: report.emails_sent - (report.bounces?.hard_bounces || 0) - (report.bounces?.soft_bounces || 0),
        uniqueOpens: report.opens?.unique_opens || 0,
        totalOpens: report.opens?.opens_total || 0,
        uniqueClicks: report.clicks?.unique_clicks || 0,
        totalClicks: report.clicks?.clicks_total || 0,
        bounces: (report.bounces?.hard_bounces || 0) + (report.bounces?.soft_bounces || 0),
        unsubscribes: report.unsubscribed || 0,
        complaints: report.abuse_reports || 0,
        openRate: report.opens?.open_rate || 0,
        clickRate: report.clicks?.click_rate || 0,
        bounceRate: report.bounces ?
          ((report.bounces.hard_bounces + report.bounces.soft_bounces) / report.emails_sent) : 0,
        unsubscribeRate: report.emails_sent ? (report.unsubscribed / report.emails_sent) : 0,
      };
    } catch (error: any) {
      // Reports may not exist for unsent campaigns
      if (error.status === 404) {
        return this.emptyMetrics();
      }
      this.handleApiError(error, 'getCampaignMetrics');
    }
  }

  async getLists(): Promise<PlatformList[]> {
    try {
      const response = await this.client.lists.getAllLists({
        count: 1000,
        sort_field: 'date_created',
        sort_dir: 'DESC',
      }) as any;

      return response.lists.map((list: any) => this.mapList(list));
    } catch (error) {
      this.handleApiError(error, 'getLists');
    }
  }

  async getList(externalId: string): Promise<PlatformList | null> {
    try {
      const list = await this.client.lists.getList(externalId) as any;
      return this.mapList(list);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      this.handleApiError(error, 'getList');
    }
  }

  protected normalizeCampaignStatus(platformStatus: string): string {
    return MAILCHIMP_STATUS_MAP[platformStatus] || 'UNKNOWN';
  }

  protected mapCampaignStatus(internalStatus: string): string {
    return INTERNAL_STATUS_MAP[internalStatus] || 'save';
  }

  private mapCampaign(mc: any): PlatformCampaign {
    return {
      externalId: mc.id,
      name: mc.settings?.title || mc.campaign_title || '',
      subjectLine: mc.settings?.subject_line || '',
      previewText: mc.settings?.preview_text || '',
      fromName: mc.settings?.from_name || '',
      fromEmail: mc.settings?.reply_to || '',
      status: this.normalizeCampaignStatus(mc.status),
      contentHtml: mc.content?.html || undefined,
      contentText: mc.content?.plain_text || undefined,
      listId: mc.recipients?.list_id,
      listName: mc.recipients?.list_name,
      scheduledAt: mc.send_time ? new Date(mc.send_time) : undefined,
      sentAt: mc.status === 'sent' && mc.send_time ? new Date(mc.send_time) : undefined,
      metadata: {
        webId: mc.web_id,
        archiveUrl: mc.archive_url,
        longArchiveUrl: mc.long_archive_url,
        createTime: mc.create_time,
        contentType: mc.content_type,
      },
    };
  }

  private mapList(list: any): PlatformList {
    return {
      externalId: list.id,
      name: list.name,
      memberCount: list.stats?.member_count || 0,
      unsubscribeCount: list.stats?.unsubscribe_count || 0,
      cleanedCount: list.stats?.cleaned_count || 0,
      createdAt: list.date_created ? new Date(list.date_created) : undefined,
      stats: {
        openRate: list.stats?.open_rate || 0,
        clickRate: list.stats?.click_rate || 0,
      },
      metadata: {
        webId: list.web_id,
        permission_reminder: list.permission_reminder,
        visibility: list.visibility,
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
