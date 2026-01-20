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
import { PlatformError, RateLimitError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export abstract class EmailPlatformAdapter {
  protected credentials: PlatformCredentials;
  protected clientId: string;
  protected platformName: string;

  constructor(clientId: string, credentials: PlatformCredentials, platformName: string) {
    this.clientId = clientId;
    this.credentials = credentials;
    this.platformName = platformName;
  }

  /**
   * Test the connection to the email platform
   */
  abstract testConnection(): Promise<ConnectionTestResult>;

  /**
   * Get all campaigns with optional filtering/pagination
   */
  abstract getCampaigns(options?: PaginationOptions): Promise<PaginatedResult<PlatformCampaign>>;

  /**
   * Get a single campaign by its external ID
   */
  abstract getCampaign(externalId: string): Promise<PlatformCampaign | null>;

  /**
   * Create a new campaign
   */
  abstract createCampaign(campaign: CreateCampaignInput): Promise<PlatformCampaign>;

  /**
   * Update an existing campaign
   */
  abstract updateCampaign(externalId: string, updates: UpdateCampaignInput): Promise<PlatformCampaign>;

  /**
   * Schedule a campaign for sending
   */
  abstract scheduleCampaign(externalId: string, scheduledAt: Date): Promise<void>;

  /**
   * Send a campaign immediately
   */
  abstract sendCampaign(externalId: string): Promise<void>;

  /**
   * Get campaign metrics/statistics
   */
  abstract getCampaignMetrics(externalId: string): Promise<PlatformMetrics>;

  /**
   * Get all audience lists
   */
  abstract getLists(): Promise<PlatformList[]>;

  /**
   * Get a single list by its external ID
   */
  abstract getList(externalId: string): Promise<PlatformList | null>;

  /**
   * Helper to log platform operations
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, any>) {
    const logData = {
      platform: this.platformName,
      clientId: this.clientId,
      ...data,
    };
    logger[level](logData, message);
  }

  /**
   * Helper to handle API errors consistently
   */
  protected handleApiError(error: any, operation: string): never {
    const isRateLimit = this.isRateLimitError(error);
    const errorMessage = this.extractErrorMessage(error);

    this.log('error', `${operation} failed`, {
      operation,
      error: errorMessage,
      isRateLimit,
    });

    if (isRateLimit) {
      const retryAfter = this.extractRetryAfter(error);
      throw new RateLimitError(this.platformName, retryAfter);
    }

    throw new PlatformError(this.platformName, operation, errorMessage);
  }

  /**
   * Check if an error is a rate limit error
   */
  protected isRateLimitError(error: any): boolean {
    if (error.response?.status === 429) return true;
    if (error.status === 429) return true;
    return false;
  }

  /**
   * Extract error message from various error formats
   */
  protected extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.response?.data?.detail) return error.response.data.detail;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.error) return error.response.data.error;
    return 'Unknown error';
  }

  /**
   * Extract retry-after value from rate limit response
   */
  protected extractRetryAfter(error: any): number | undefined {
    const retryAfter = error.response?.headers?.['retry-after'];
    if (retryAfter) {
      return parseInt(retryAfter, 10);
    }
    return undefined;
  }

  /**
   * Normalize campaign status from platform-specific to internal format
   */
  protected abstract normalizeCampaignStatus(platformStatus: string): string;

  /**
   * Map internal campaign status to platform-specific format
   */
  protected abstract mapCampaignStatus(internalStatus: string): string;
}
