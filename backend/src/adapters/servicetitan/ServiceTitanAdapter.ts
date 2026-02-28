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

/**
 * ServiceTitan adapter - Stub implementation
 * TODO: Implement full ServiceTitan API integration
 * Credentials: OAuth-based — clientId, clientSecret, accessToken
 */
export class ServiceTitanAdapter extends EmailPlatformAdapter {
  constructor(clientId: string, credentials: PlatformCredentials) {
    super(clientId, credentials, 'ServiceTitan');
  }

  async testConnection(): Promise<ConnectionTestResult> {
    throw new PlatformError('ServiceTitan', 'testConnection', 'ServiceTitan adapter not yet implemented');
  }

  async getCampaigns(_options?: PaginationOptions): Promise<PaginatedResult<PlatformCampaign>> {
    throw new PlatformError('ServiceTitan', 'getCampaigns', 'ServiceTitan adapter not yet implemented');
  }

  async getCampaign(_externalId: string): Promise<PlatformCampaign | null> {
    throw new PlatformError('ServiceTitan', 'getCampaign', 'ServiceTitan adapter not yet implemented');
  }

  async createCampaign(_input: CreateCampaignInput): Promise<PlatformCampaign> {
    throw new PlatformError('ServiceTitan', 'createCampaign', 'ServiceTitan adapter not yet implemented');
  }

  async updateCampaign(_externalId: string, _updates: UpdateCampaignInput): Promise<PlatformCampaign> {
    throw new PlatformError('ServiceTitan', 'updateCampaign', 'ServiceTitan adapter not yet implemented');
  }

  async scheduleCampaign(_externalId: string, _scheduledAt: Date): Promise<void> {
    throw new PlatformError('ServiceTitan', 'scheduleCampaign', 'ServiceTitan adapter not yet implemented');
  }

  async sendCampaign(_externalId: string): Promise<void> {
    throw new PlatformError('ServiceTitan', 'sendCampaign', 'ServiceTitan adapter not yet implemented');
  }

  async getCampaignMetrics(_externalId: string): Promise<PlatformMetrics> {
    throw new PlatformError('ServiceTitan', 'getCampaignMetrics', 'ServiceTitan adapter not yet implemented');
  }

  async getLists(): Promise<PlatformList[]> {
    throw new PlatformError('ServiceTitan', 'getLists', 'ServiceTitan adapter not yet implemented');
  }

  async getList(_externalId: string): Promise<PlatformList | null> {
    throw new PlatformError('ServiceTitan', 'getList', 'ServiceTitan adapter not yet implemented');
  }

  protected normalizeCampaignStatus(platformStatus: string): string {
    // TODO: Map ServiceTitan statuses
    return platformStatus.toUpperCase();
  }

  protected mapCampaignStatus(internalStatus: string): string {
    // TODO: Map internal statuses to ServiceTitan
    return internalStatus.toLowerCase();
  }
}
