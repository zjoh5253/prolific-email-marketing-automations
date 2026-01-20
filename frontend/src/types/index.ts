// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Client types
export type EmailPlatform =
  | 'MAILCHIMP'
  | 'KLAVIYO'
  | 'HUBSPOT'
  | 'ACTIVECAMPAIGN'
  | 'CONSTANT_CONTACT'
  | 'BREVO';

export type ClientStatus = 'ACTIVE' | 'PENDING' | 'PAUSED' | 'DISCONNECTED';

export type SyncStatus = 'SYNCED' | 'SYNCING' | 'PARTIAL' | 'FAILED' | 'NEVER';

export interface Client {
  id: string;
  name: string;
  slug: string;
  platform: EmailPlatform;
  status: ClientStatus;
  syncStatus: SyncStatus;
  industry?: string;
  timezone: string;
  logoUrl?: string;
  defaultFromName?: string;
  defaultFromEmail?: string;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientWithStats extends Client {
  _count?: {
    campaigns: number;
    lists: number;
  };
}

// Campaign types
export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'CANCELLED'
  | 'ARCHIVED'
  | 'UNKNOWN';

export interface CampaignMetrics {
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

export interface Campaign {
  id: string;
  clientId: string;
  externalId: string;
  name: string;
  subjectLine?: string;
  previewText?: string;
  fromName?: string;
  fromEmail?: string;
  status: CampaignStatus;
  contentHtml?: string;
  contentText?: string;
  scheduledAt?: string;
  sentAt?: string;
  syncedAt?: string;
  metrics?: CampaignMetrics;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

// List types
export interface AudienceList {
  id: string;
  clientId: string;
  externalId: string;
  name: string;
  memberCount: number;
  unsubscribeCount: number;
  cleanedCount: number;
  avgOpenRate?: number;
  avgClickRate?: number;
  healthScore?: number;
  syncedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

// Alert types
export type AlertType =
  | 'SYNC_ERROR'
  | 'CREDENTIAL_ISSUE'
  | 'PERFORMANCE_ANOMALY'
  | 'SCHEDULE_CONFLICT'
  | 'APPROVAL_NEEDED'
  | 'CAMPAIGN_SENT'
  | 'LIST_HEALTH'
  | 'RATE_LIMIT'
  | 'SYSTEM';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Alert {
  id: string;
  clientId?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  isRead: boolean;
  isDismissed: boolean;
  resolvedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}

// Calendar event types
export interface CalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  start: Date;
  end: Date;
  status: CampaignStatus;
  clientId: string;
  clientName: string;
  clientSlug: string;
}

// Context snippet types
export type ContextType = 'BRAND_VOICE' | 'AUDIENCE' | 'PRODUCT' | 'COMPETITOR' | 'STYLE_GUIDE' | 'OTHER';

export interface ContextSnippet {
  id: string;
  clientId: string;
  type: ContextType;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface DashboardOverview {
  period: { start: string; end: string };
  clients: {
    total: number;
    active: number;
  };
  campaigns: {
    total: number;
    sent: number;
    scheduled: number;
  };
  alerts: {
    unread: number;
  };
}

export interface IndustryBenchmark {
  industry: string;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  unsubscribe_rate: number;
}
