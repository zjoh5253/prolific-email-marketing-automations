export {
  createPlatformAdapter,
  isPlatformSupported,
  isPlatformImplemented,
  getSupportedPlatforms,
  getRequiredCredentials,
  EmailPlatformAdapter,
  type SupportedPlatform,
} from './factory.js';

export type {
  PlatformCredentials,
  ConnectionTestResult,
  PlatformCampaign,
  PlatformList,
  PlatformMetrics,
  CreateCampaignInput,
  UpdateCampaignInput,
  PaginationOptions,
  PaginatedResult,
} from './types.js';
