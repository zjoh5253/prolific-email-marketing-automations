import { z } from 'zod';

export const createOnboardingSubmissionSchema = z.object({
  // Step 1: Contact Info (required)
  firstName: z.string().min(1, 'First name is required').max(255),
  lastName: z.string().min(1, 'Last name is required').max(255),
  email: z.string().email('Invalid email address'),

  // Step 2: Content Questions (optional)
  companyName: z.string().max(255).optional(),
  fromFieldName: z.string().max(255).optional(),
  companyDescription: z.string().optional(),
  idealCustomer: z.string().optional(),
  coreProducts: z.string().optional(),
  peakSeasonPriorities: z.string().optional(),
  yearRoundOffers: z.string().optional(),
  businessStory: z.string().optional(),
  uniqueValue: z.string().optional(),
  productTransformation: z.string().optional(),

  // Step 3: Technical Setup (optional)
  domainHost: z.string().max(255).optional(),
  domainHostOther: z.string().max(255).optional(),
  hasDomainAccess: z.boolean().optional(),
  domainAccessContact: z.string().max(255).optional(),
  hasEmailPlatform: z.boolean().optional(),
  emailPlatform: z.string().max(255).optional(),
  emailPlatformOther: z.string().max(255).optional(),
  marketingEmail: z.string().email().optional().or(z.literal('')),
  hasEmailAdminAccess: z.boolean().optional(),
  emailAdminContact: z.string().max(255).optional(),

  // Step 5: Content Approval (optional)
  approverFirstName: z.string().max(255).optional(),
  approverLastName: z.string().max(255).optional(),
  approverEmail: z.string().email().optional().or(z.literal('')),
  approvalMethod: z.string().max(255).optional(),
  canSendWithoutApproval: z.boolean().optional(),
});

export const listOnboardingSubmissionsQuerySchema = z.object({
  status: z.enum(['SUBMITTED', 'REVIEWED', 'CONVERTED', 'ARCHIVED']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  sortBy: z.enum(['submittedAt', 'firstName', 'email', 'companyName']).default('submittedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const updateOnboardingStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'REVIEWED', 'CONVERTED', 'ARCHIVED']),
});

export const onboardingIdParamsSchema = z.object({
  id: z.string().uuid('Invalid submission ID'),
});

export type CreateOnboardingSubmissionInput = z.infer<typeof createOnboardingSubmissionSchema>;
export type ListOnboardingSubmissionsQuery = z.infer<typeof listOnboardingSubmissionsQuerySchema>;
export type UpdateOnboardingStatusInput = z.infer<typeof updateOnboardingStatusSchema>;
