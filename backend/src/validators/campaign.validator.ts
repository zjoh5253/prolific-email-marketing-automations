import { z } from 'zod';

export const campaignIdParamsSchema = z.object({
  id: z.string().uuid('Invalid campaign ID'),
});

export const listCampaignsQuerySchema = z.object({
  clientId: z.string().uuid().optional(),
  clientIds: z.string().transform((s) => s.split(',')).optional(),
  status: z.enum(['IDEA', 'DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED', 'ARCHIVED']).optional(),
  approvalStatus: z.enum(['PENDING', 'INTERNAL_APPROVED', 'CLIENT_APPROVED', 'REJECTED', 'CHANGES_REQUESTED']).optional(),
  search: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  sortBy: z.enum(['name', 'createdAt', 'scheduledAt', 'sentAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createCampaignSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  name: z.string().min(1, 'Name is required').max(255),
  subjectLine: z.string().max(255).optional(),
  previewText: z.string().max(255).optional(),
  fromName: z.string().max(100).optional(),
  fromEmail: z.string().email().optional(),
  bodyCopyHtml: z.string().optional(),
  bodyCopyPlain: z.string().optional(),
  status: z.enum(['IDEA', 'DRAFT', 'IN_REVIEW']).default('DRAFT'),
  scheduledAt: z.coerce.date().optional(),
  listIds: z.array(z.string().uuid()).optional(),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  subjectLine: z.string().max(255).optional(),
  previewText: z.string().max(255).optional(),
  fromName: z.string().max(100).optional(),
  fromEmail: z.string().email().optional(),
  bodyCopyHtml: z.string().optional(),
  bodyCopyPlain: z.string().optional(),
  status: z.enum(['IDEA', 'DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PAUSED', 'ARCHIVED']).optional(),
  scheduledAt: z.coerce.date().nullable().optional(),
  listIds: z.array(z.string().uuid()).optional(),
});

export const scheduleCampaignSchema = z.object({
  scheduledAt: z.coerce.date().refine(
    (date) => date > new Date(),
    'Scheduled date must be in the future'
  ),
});

export const approveCampaignSchema = z.object({
  comment: z.string().max(1000).optional(),
});

export type CampaignIdParams = z.infer<typeof campaignIdParamsSchema>;
export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type ScheduleCampaignInput = z.infer<typeof scheduleCampaignSchema>;
export type ApproveCampaignInput = z.infer<typeof approveCampaignSchema>;
