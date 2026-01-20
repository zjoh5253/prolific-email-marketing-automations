// Platform adapter types

export interface PlatformCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  serverId?: string;
  dataCenter?: string;
  accountId?: string;
  [key: string]: string | undefined;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  accountInfo?: {
    id: string;
    name: string;
    email?: string;
    plan?: string;
  };
  error?: string;
}

export interface PlatformCampaign {
  externalId: string;
  name: string;
  subjectLine?: string;
  previewText?: string;
  fromName?: string;
  fromEmail?: string;
  status: string;
  contentHtml?: string;
  contentText?: string;
  listId?: string;
  listName?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  metrics?: PlatformMetrics;
  metadata?: Record<string, any>;
}

export interface PlatformMetrics {
  sent: number;
  delivered: number;
  uniqueOpens: number;
  totalOpens: number;
  uniqueClicks: number;
  totalClicks: number;
  bounces: number;
  unsubscribes: number;
  complaints: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

export interface PlatformList {
  externalId: string;
  name: string;
  memberCount: number;
  unsubscribeCount?: number;
  cleanedCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  stats?: {
    openRate?: number;
    clickRate?: number;
  };
  metadata?: Record<string, any>;
}

export interface CreateCampaignInput {
  name: string;
  subjectLine: string;
  previewText?: string;
  fromName: string;
  fromEmail: string;
  listId: string;
  contentHtml: string;
  contentText?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCampaignInput {
  name?: string;
  subjectLine?: string;
  previewText?: string;
  fromName?: string;
  fromEmail?: string;
  contentHtml?: string;
  contentText?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  since?: Date;
  status?: string[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
