import { EmailPlatformAdapter } from './base/EmailPlatformAdapter.js';
import { MailchimpAdapter } from './mailchimp/MailchimpAdapter.js';
import { KlaviyoAdapter } from './klaviyo/KlaviyoAdapter.js';
import { ServiceTitanAdapter } from './servicetitan/ServiceTitanAdapter.js';
import { BeehiivAdapter } from './beehiiv/BeehiivAdapter.js';
import { PlatformCredentials } from './types.js';
import { ValidationError } from '../utils/errors.js';

export type SupportedPlatform =
  | 'MAILCHIMP'
  | 'KLAVIYO'
  | 'HUBSPOT'
  | 'ACTIVECAMPAIGN'
  | 'CONSTANT_CONTACT'
  | 'BREVO'
  | 'SERVICETITAN'
  | 'BEEHIIV';

/**
 * Factory to create platform-specific adapters
 */
export function createPlatformAdapter(
  clientId: string,
  platform: SupportedPlatform | string,
  credentials: PlatformCredentials
): EmailPlatformAdapter {
  switch (platform.toUpperCase()) {
    case 'MAILCHIMP':
      return new MailchimpAdapter(clientId, credentials);

    case 'KLAVIYO':
      return new KlaviyoAdapter(clientId, credentials);

    case 'HUBSPOT':
      // TODO: Implement HubSpotAdapter
      throw new ValidationError(`HubSpot adapter not yet implemented`);

    case 'ACTIVECAMPAIGN':
      // TODO: Implement ActiveCampaignAdapter
      throw new ValidationError(`ActiveCampaign adapter not yet implemented`);

    case 'CONSTANT_CONTACT':
      // TODO: Implement ConstantContactAdapter
      throw new ValidationError(`Constant Contact adapter not yet implemented`);

    case 'BREVO':
      // TODO: Implement BrevoAdapter
      throw new ValidationError(`Brevo adapter not yet implemented`);

    case 'SERVICETITAN':
      return new ServiceTitanAdapter(clientId, credentials);

    case 'BEEHIIV':
      return new BeehiivAdapter(clientId, credentials);

    default:
      throw new ValidationError(`Unsupported email platform: ${platform}`);
  }
}

/**
 * Check if a platform is supported
 */
export function isPlatformSupported(platform: string): boolean {
  const supported = [
    'MAILCHIMP',
    'KLAVIYO',
    'HUBSPOT',
    'ACTIVECAMPAIGN',
    'CONSTANT_CONTACT',
    'BREVO',
    'SERVICETITAN',
    'BEEHIIV',
  ];
  return supported.includes(platform.toUpperCase());
}

/**
 * Check if a platform adapter is fully implemented
 */
export function isPlatformImplemented(platform: string): boolean {
  const implemented = ['MAILCHIMP'];
  return implemented.includes(platform.toUpperCase());
}

/**
 * Get list of all supported platforms
 */
export function getSupportedPlatforms(): SupportedPlatform[] {
  return [
    'MAILCHIMP',
    'KLAVIYO',
    'HUBSPOT',
    'ACTIVECAMPAIGN',
    'CONSTANT_CONTACT',
    'BREVO',
    'SERVICETITAN',
    'BEEHIIV',
  ];
}

/**
 * Get required credential fields for a platform
 */
export function getRequiredCredentials(platform: string): string[] {
  switch (platform.toUpperCase()) {
    case 'MAILCHIMP':
      return ['apiKey'];

    case 'KLAVIYO':
      return ['apiKey'];

    case 'HUBSPOT':
      return ['accessToken'];

    case 'ACTIVECAMPAIGN':
      return ['apiKey', 'accountUrl'];

    case 'CONSTANT_CONTACT':
      return ['accessToken', 'refreshToken'];

    case 'BREVO':
      return ['apiKey'];

    case 'SERVICETITAN':
      return ['clientId', 'clientSecret', 'accessToken'];

    case 'BEEHIIV':
      return ['apiKey'];

    default:
      return [];
  }
}

export { EmailPlatformAdapter } from './base/EmailPlatformAdapter.js';
export * from './types.js';
