import { z } from 'zod';

export const clientIdParamsSchema = z.object({
  id: z.string().uuid('Invalid client ID'),
});

export const listClientsQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'CHURNED', 'ONBOARDING']).optional(),
  platform: z.enum(['MAILCHIMP', 'KLAVIYO', 'HUBSPOT', 'ACTIVECAMPAIGN', 'CONSTANTCONTACT', 'BREVO', 'SERVICETITAN', 'BEEHIIV', 'OTHER']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  sortBy: z.enum(['name', 'createdAt', 'lastSyncAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  platform: z.enum(['MAILCHIMP', 'KLAVIYO', 'HUBSPOT', 'ACTIVECAMPAIGN', 'CONSTANTCONTACT', 'BREVO', 'SERVICETITAN', 'BEEHIIV', 'OTHER']),
  industry: z.string().max(100).optional(),
  timezone: z.string().default('America/New_York'),
  credentials: z.record(z.string()).optional(),
  contextMarkdown: z.string().optional(),
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
  credentials: z.record(z.string()).optional(),
  contextMarkdown: z.string().optional(),
});

export type ClientIdParams = z.infer<typeof clientIdParamsSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
