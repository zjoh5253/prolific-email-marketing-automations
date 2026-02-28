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
 * Beehiiv adapter - Stub implementation
 * TODO: Implement full Beehiiv API integration
 * Credentials: API key — apiKey via Authorization: Bearer {apiKey}
 */
export class BeehiivAdapter extends EmailPlatformAdapter {
  constructor(clientId: string, credentials: PlatformCredentials) {
    super(clientId, credentials, 'Beehiiv');
  }

  async testConnection(): Promise<ConnectionTestResult> {
    throw new PlatformError('Beehiiv', 'testConnection', 'Beehiiv adapter not yet implemented');
  }

  async getCampaigns(_options?: PaginationOptions): Promise<PaginatedResult<PlatformCampaign>> {
    throw new PlatformError('Beehiiv', 'getCampaigns', 'Beehiiv adapter not yet implemented');
  }

  async getCampaign(_externalId: string): Promise<PlatformCampaign | null> {
    throw new PlatformError('Beehiiv', 'getCampaign', 'Beehiiv adapter not yet implemented');
  }

  async createCampaign(_input: CreateCampaignInput): Promise<PlatformCampaign> {
    throw new PlatformError('Beehiiv', 'createCampaign', 'Beehiiv adapter not yet implemented');
  }

  async updateCampaign(_externalId: string, _updates: UpdateCampaignInput): Promise<PlatformCampaign> {
    throw new PlatformError('Beehiiv', 'updateCampaign', 'Beehiiv adapter not yet implemented');
  }

  async scheduleCampaign(_externalId: string, _scheduledAt: Date): Promise<void> {
    throw new PlatformError('Beehiiv', 'scheduleCampaign', 'Beehiiv adapter not yet implemented');
  }

  async sendCampaign(_externalId: string): Promise<void> {
    throw new PlatformError('Beehiiv', 'sendCampaign', 'Beehiiv adapter not yet implemented');
  }

  async getCampaignMetrics(_externalId: string): Promise<PlatformMetrics> {
    throw new PlatformError('Beehiiv', 'getCampaignMetrics', 'Beehiiv adapter not yet implemented');
  }

  async getLists(): Promise<PlatformList[]> {
    throw new PlatformError('Beehiiv', 'getLists', 'Beehiiv adapter not yet implemented');
  }

  async getList(_externalId: string): Promise<PlatformList | null> {
    throw new PlatformError('Beehiiv', 'getList', 'Beehiiv adapter not yet implemented');
  }

  protected normalizeCampaignStatus(platformStatus: string): string {
    // TODO: Map Beehiiv statuses
    return platformStatus.toUpperCase();
  }

  protected mapCampaignStatus(internalStatus: string): string {
    // TODO: Map internal statuses to Beehiiv
    return internalStatus.toLowerCase();
  }
}
