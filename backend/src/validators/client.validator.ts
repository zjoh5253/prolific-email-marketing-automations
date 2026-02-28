import { z } from 'zod';

export const clientIdParamsSchema = z.object({
  id: z.string().uuid('Invalid client ID'),
});

export const listClientsQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'CHURNED', 'ONBOARDING']).optional(),
  platform: z.enum(['MAILCHIMP', 'KLAVIYO', 'HUBSPOT', 'ACTIVECAMPAIGN', 'CONSTANTCONTACT', 'BREVO', 'SERVICETITAN', 'BEEHIIV', 'OTHER']).optional(),
  accountManagerId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  sortBy: z.enum(['name', 'createdAt', 'lastSyncAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

const onboardingFields = {
  // Contact
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  // Content
  fromFieldName: z.string().optional(),
  companyDescription: z.string().optional(),
  idealCustomer: z.string().optional(),
  coreProducts: z.string().optional(),
  peakSeasonPriorities: z.string().optional(),
  yearRoundOffers: z.string().optional(),
  businessStory: z.string().optional(),
  uniqueValue: z.string().optional(),
  productTransformation: z.string().optional(),
  // Technical Setup
  domainHost: z.string().optional(),
  domainHostOther: z.string().optional(),
  hasDomainAccess: z.boolean().optional(),
  domainAccessContact: z.string().optional(),
  hasEmailPlatform: z.boolean().optional(),
  emailPlatform: z.string().optional(),
  emailPlatformOther: z.string().optional(),
  marketingEmail: z.string().email().optional().or(z.literal('')),
  hasEmailAdminAccess: z.boolean().optional(),
  emailAdminContact: z.string().optional(),
  // Content Approval
  approverFirstName: z.string().optional(),
  approverLastName: z.string().optional(),
  approverEmail: z.string().email().optional().or(z.literal('')),
  approvalMethod: z.string().optional(),
  canSendWithoutApproval: z.boolean().optional(),
};

export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  platform: z.enum(['MAILCHIMP', 'KLAVIYO', 'HUBSPOT', 'ACTIVECAMPAIGN', 'CONSTANTCONTACT', 'BREVO', 'SERVICETITAN', 'BEEHIIV', 'OTHER']),
  industry: z.string().max(100).optional(),
  timezone: z.string().default('America/New_York'),
  accountManagerId: z.string().uuid().optional().nullable(),
  tier: z.string().max(50).optional().nullable(),
  credentials: z.record(z.string()).optional(),
  contextMarkdown: z.string().optional(),
  ...onboardingFields,
});

export const updateClientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  platform: z.enum(['MAILCHIMP', 'KLAVIYO', 'HUBSPOT', 'ACTIVECAMPAIGN', 'CONSTANTCONTACT', 'BREVO', 'SERVICETITAN', 'BEEHIIV', 'OTHER']).optional(),
  industry: z.string().max(100).optional(),
  timezone: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'CHURNED', 'ONBOARDING']).optional(),
  accountManagerId: z.string().uuid().optional().nullable(),
  tier: z.string().max(50).optional().nullable(),
  credentials: z.record(z.string()).optional(),
  contextMarkdown: z.string().optional(),
  ...onboardingFields,
});

export type ClientIdParams = z.infer<typeof clientIdParamsSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
