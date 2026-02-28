import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateClient, useAccountManagers } from '@/hooks/queries';
import { EmailPlatform } from '@/types';
import { cn } from '@/lib/utils';

// ── Schema ──────────────────────────────────────────────────────────

const clientWizardSchema = z.object({
  // Step 1: Client Setup
  name: z.string().min(1, 'Name is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  platform: z.string().min(1, 'Please select a platform'),
  industry: z.string().optional(),
  timezone: z.string().default('America/New_York'),
  accountManagerId: z.string().optional(),
  tier: z.string().optional(),
  // Step 2: Contact & Content
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  companyName: z.string().optional(),
  fromFieldName: z.string().optional(),
  companyDescription: z.string().optional(),
  idealCustomer: z.string().optional(),
  coreProducts: z.string().optional(),
  peakSeasonPriorities: z.string().optional(),
  yearRoundOffers: z.string().optional(),
  businessStory: z.string().optional(),
  uniqueValue: z.string().optional(),
  productTransformation: z.string().optional(),
  // Step 3: Technical Setup
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
  // Step 5: Content Approval
  approverFirstName: z.string().optional(),
  approverLastName: z.string().optional(),
  approverEmail: z.string().email().optional().or(z.literal('')),
  approvalMethod: z.string().optional(),
  canSendWithoutApproval: z.boolean().optional(),
});

type WizardFormData = z.infer<typeof clientWizardSchema>;

// ── Constants ───────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: 'Client Setup' },
  { number: 2, label: 'Contact & Content' },
  { number: 3, label: 'Technical Setup' },
  { number: 4, label: 'Important Notice' },
  { number: 5, label: 'Content Approval' },
];

const STEP_FIELDS: Record<number, (keyof WizardFormData)[]> = {
  1: ['name', 'slug', 'platform', 'industry', 'timezone', 'accountManagerId', 'tier'],
  2: [
    'contactFirstName', 'contactLastName', 'contactEmail',
    'companyName', 'fromFieldName', 'companyDescription', 'idealCustomer',
    'coreProducts', 'peakSeasonPriorities', 'yearRoundOffers', 'businessStory',
    'uniqueValue', 'productTransformation',
  ],
  3: [
    'domainHost', 'domainHostOther', 'hasDomainAccess', 'domainAccessContact',
    'hasEmailPlatform', 'emailPlatform', 'emailPlatformOther', 'marketingEmail',
    'hasEmailAdminAccess', 'emailAdminContact',
  ],
  4: [],
  5: [
    'approverFirstName', 'approverLastName', 'approverEmail',
    'approvalMethod', 'canSendWithoutApproval',
  ],
};

const platforms: { value: EmailPlatform; label: string }[] = [
  { value: 'MAILCHIMP', label: 'Mailchimp' },
  { value: 'KLAVIYO', label: 'Klaviyo' },
  { value: 'HUBSPOT', label: 'HubSpot' },
  { value: 'ACTIVECAMPAIGN', label: 'ActiveCampaign' },
  { value: 'CONSTANT_CONTACT', label: 'Constant Contact' },
  { value: 'BREVO', label: 'Brevo' },
  { value: 'SERVICETITAN', label: 'ServiceTitan' },
  { value: 'BEEHIIV', label: 'Beehiiv' },
];

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
  'UTC',
];

const DOMAIN_HOSTS = [
  'GoDaddy',
  'Namecheap',
  'Google Domains',
  'Cloudflare',
  'Bluehost',
  'HostGator',
  'Other',
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ── Styles ──────────────────────────────────────────────────────────

const inputClass =
  'w-full h-10 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';
const textareaClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-y';
const labelClass = 'block text-sm font-medium mb-1.5';
const errorClass = 'text-destructive text-sm mt-1';

// ── Component ───────────────────────────────────────────────────────

export function ClientFormPage() {
  const navigate = useNavigate();
  const createClient = useCreateClient();
  const { data: managers } = useAccountManagers();
  const [currentStep, setCurrentStep] = useState(1);
  const [linkCopied, setLinkCopied] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WizardFormData>({
    resolver: zodResolver(clientWizardSchema),
    defaultValues: {
      timezone: 'America/New_York',
      hasDomainAccess: undefined,
      hasEmailPlatform: undefined,
      hasEmailAdminAccess: undefined,
      canSendWithoutApproval: undefined,
    },
  });

  const watchName = watch('name');
  const watchDomainHost = watch('domainHost');
  const watchHasDomainAccess = watch('hasDomainAccess');
  const watchHasEmailPlatform = watch('hasEmailPlatform');
  const watchEmailPlatform = watch('emailPlatform');
  const watchHasEmailAdminAccess = watch('hasEmailAdminAccess');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name, { shouldValidate: false });
    setValue('slug', generateSlug(name), { shouldValidate: false });
  };

  const goNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setCurrentStep((s) => Math.min(s + 1, 5));
  };

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const copyOnboardingLink = async () => {
    const url = `${window.location.origin}/onboard`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast.success('Onboarding link copied to clipboard');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const onSubmit = async (data: WizardFormData) => {
    // Clean empty strings to undefined
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
    );

    try {
      const client = await createClient.mutateAsync({
        name: cleaned.name as string,
        slug: cleaned.slug as string,
        platform: cleaned.platform as EmailPlatform,
        industry: cleaned.industry as string | undefined,
        timezone: (cleaned.timezone as string) || 'America/New_York',
        accountManagerId: cleaned.accountManagerId as string | undefined,
        tier: cleaned.tier as string | undefined,
        // Onboarding fields
        contactFirstName: cleaned.contactFirstName as string | undefined,
        contactLastName: cleaned.contactLastName as string | undefined,
        contactEmail: cleaned.contactEmail as string | undefined,
        fromFieldName: cleaned.fromFieldName as string | undefined,
        companyDescription: cleaned.companyDescription as string | undefined,
        idealCustomer: cleaned.idealCustomer as string | undefined,
        coreProducts: cleaned.coreProducts as string | undefined,
        peakSeasonPriorities: cleaned.peakSeasonPriorities as string | undefined,
        yearRoundOffers: cleaned.yearRoundOffers as string | undefined,
        businessStory: cleaned.businessStory as string | undefined,
        uniqueValue: cleaned.uniqueValue as string | undefined,
        productTransformation: cleaned.productTransformation as string | undefined,
        domainHost: cleaned.domainHost as string | undefined,
        domainHostOther: cleaned.domainHostOther as string | undefined,
        hasDomainAccess: cleaned.hasDomainAccess as boolean | undefined,
        domainAccessContact: cleaned.domainAccessContact as string | undefined,
        hasEmailPlatform: cleaned.hasEmailPlatform as boolean | undefined,
        emailPlatform: cleaned.emailPlatform as string | undefined,
        emailPlatformOther: cleaned.emailPlatformOther as string | undefined,
        marketingEmail: cleaned.marketingEmail as string | undefined,
        hasEmailAdminAccess: cleaned.hasEmailAdminAccess as boolean | undefined,
        emailAdminContact: cleaned.emailAdminContact as string | undefined,
        approverFirstName: cleaned.approverFirstName as string | undefined,
        approverLastName: cleaned.approverLastName as string | undefined,
        approverEmail: cleaned.approverEmail as string | undefined,
        approvalMethod: cleaned.approvalMethod as string | undefined,
        canSendWithoutApproval: cleaned.canSendWithoutApproval as boolean | undefined,
      });

      navigate(`/clients/${client.id}`);
    } catch {
      // Error handled by mutation's onError callback
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/clients"
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add New Client</h1>
            <p className="text-muted-foreground">
              Set up a new email marketing client
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={copyOnboardingLink}
          className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors"
        >
          {linkCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {linkCopied ? 'Copied!' : 'Copy Onboarding Link'}
        </button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors',
                    currentStep === step.number
                      ? 'border-primary bg-primary text-primary-foreground'
                      : currentStep > step.number
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {currentStep > step.number ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1 hidden sm:block',
                    currentStep >= step.number
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    currentStep > step.number ? 'bg-primary' : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-card rounded-lg border p-6 sm:p-8">
          {/* ── Step 1: Client Setup ── */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Client Setup</h2>

              {/* Client Name */}
              <div>
                <label htmlFor="name" className={labelClass}>
                  Client Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={watchName || ''}
                  onChange={handleNameChange}
                  placeholder="e.g., Acme Corporation"
                  className={cn(inputClass, errors.name && 'border-destructive')}
                />
                {errors.name && (
                  <p className={errorClass}>{errors.name.message}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className={labelClass}>
                  Slug <span className="text-destructive">*</span>
                </label>
                <input
                  id="slug"
                  type="text"
                  {...register('slug')}
                  placeholder="e.g., acme-corporation"
                  className={cn(inputClass, errors.slug && 'border-destructive')}
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  URL-friendly identifier. Auto-generated from name.
                </p>
                {errors.slug && (
                  <p className={errorClass}>{errors.slug.message}</p>
                )}
              </div>

              {/* Platform */}
              <div>
                <label htmlFor="platform" className={labelClass}>
                  Email Platform <span className="text-destructive">*</span>
                </label>
                <select
                  id="platform"
                  {...register('platform')}
                  className={cn(inputClass, errors.platform && 'border-destructive')}
                >
                  <option value="">Select a platform...</option>
                  {platforms.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                {errors.platform && (
                  <p className={errorClass}>{errors.platform.message}</p>
                )}
              </div>

              {/* Industry */}
              <div>
                <label htmlFor="industry" className={labelClass}>
                  Industry
                </label>
                <input
                  id="industry"
                  type="text"
                  {...register('industry')}
                  placeholder="e.g., E-commerce, Healthcare, Education"
                  className={inputClass}
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Optional. Used for benchmarking and AI context.
                </p>
              </div>

              {/* Timezone */}
              <div>
                <label htmlFor="timezone" className={labelClass}>
                  Timezone
                </label>
                <select
                  id="timezone"
                  {...register('timezone')}
                  className={inputClass}
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-muted-foreground">
                  Used for scheduling and reporting.
                </p>
              </div>

              {/* Account Manager */}
              <div>
                <label htmlFor="accountManagerId" className={labelClass}>
                  Account Manager
                </label>
                <select
                  id="accountManagerId"
                  {...register('accountManagerId')}
                  className={inputClass}
                >
                  <option value="">Select a manager...</option>
                  {managers?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tier */}
              <div>
                <label htmlFor="tier" className={labelClass}>
                  Tier
                </label>
                <select
                  id="tier"
                  {...register('tier')}
                  className={inputClass}
                >
                  <option value="">Select a tier...</option>
                  <option value="Tier 1">Tier 1</option>
                  <option value="Tier 2">Tier 2</option>
                  <option value="Tier 3">Tier 3</option>
                </select>
              </div>
            </div>
          )}

          {/* ── Step 2: Contact & Content ── */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Contact & Content</h2>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactFirstName" className={labelClass}>
                    Contact First Name
                  </label>
                  <input
                    id="contactFirstName"
                    type="text"
                    {...register('contactFirstName')}
                    className={inputClass}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="contactLastName" className={labelClass}>
                    Contact Last Name
                  </label>
                  <input
                    id="contactLastName"
                    type="text"
                    {...register('contactLastName')}
                    className={inputClass}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contactEmail" className={labelClass}>
                  Contact Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  {...register('contactEmail')}
                  className={inputClass}
                  placeholder="john@example.com"
                />
                {errors.contactEmail && (
                  <p className={errorClass}>{errors.contactEmail.message}</p>
                )}
              </div>

              <hr className="my-4" />

              {/* Content Questions */}
              <div>
                <label htmlFor="companyName" className={labelClass}>
                  What is the name of the company?
                </label>
                <input
                  id="companyName"
                  type="text"
                  {...register('companyName')}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="fromFieldName" className={labelClass}>
                  What name should appear in the "From" field of emails?
                </label>
                <input
                  id="fromFieldName"
                  type="text"
                  {...register('fromFieldName')}
                  className={inputClass}
                  placeholder='e.g., "John from Acme" or "Acme Team"'
                />
              </div>
              <div>
                <label htmlFor="companyDescription" className={labelClass}>
                  How would you describe the company in 2-3 sentences?
                </label>
                <textarea
                  id="companyDescription"
                  {...register('companyDescription')}
                  className={textareaClass}
                />
              </div>
              <div>
                <label htmlFor="idealCustomer" className={labelClass}>
                  Who is the ideal customer? Describe their demographics, interests, and pain points.
                </label>
                <textarea
                  id="idealCustomer"
                  {...register('idealCustomer')}
                  className={textareaClass}
                />
              </div>
              <div>
                <label htmlFor="coreProducts" className={labelClass}>
                  What are the core products or services, and what makes them unique?
                </label>
                <textarea
                  id="coreProducts"
                  {...register('coreProducts')}
                  className={textareaClass}
                />
              </div>
              <div>
                <label htmlFor="peakSeasonPriorities" className={labelClass}>
                  What are the peak season priorities and promotional calendar highlights?
                </label>
                <textarea
                  id="peakSeasonPriorities"
                  {...register('peakSeasonPriorities')}
                  className={textareaClass}
                />
              </div>
              <div>
                <label htmlFor="yearRoundOffers" className={labelClass}>
                  What offers, discounts, or incentives run year-round?
                </label>
                <textarea
                  id="yearRoundOffers"
                  {...register('yearRoundOffers')}
                  className={textareaClass}
                />
              </div>
              <div>
                <label htmlFor="businessStory" className={labelClass}>
                  What is the story behind the business? How did it start?
                </label>
                <textarea
                  id="businessStory"
                  {...register('businessStory')}
                  className={textareaClass}
                />
              </div>
              <div>
                <label htmlFor="uniqueValue" className={labelClass}>
                  What makes the brand different from competitors?
                </label>
                <textarea
                  id="uniqueValue"
                  {...register('uniqueValue')}
                  className={textareaClass}
                />
              </div>
              <div>
                <label htmlFor="productTransformation" className={labelClass}>
                  How does the product or service transform the customer's life or business?
                </label>
                <textarea
                  id="productTransformation"
                  {...register('productTransformation')}
                  className={textareaClass}
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Technical Setup ── */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Technical Setup</h2>

              {/* Domain Host */}
              <div>
                <label className={labelClass}>
                  Where is the domain registered / hosted?
                </label>
                <div className="space-y-2 mt-1">
                  {DOMAIN_HOSTS.map((host) => (
                    <label key={host} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={host}
                        checked={watchDomainHost === host}
                        onChange={() => setValue('domainHost', host)}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm">{host}</span>
                    </label>
                  ))}
                </div>
                {watchDomainHost === 'Other' && (
                  <input
                    type="text"
                    {...register('domainHostOther')}
                    className={cn(inputClass, 'mt-2')}
                    placeholder="Please specify"
                  />
                )}
              </div>

              {/* Domain Access */}
              <div>
                <label className={labelClass}>
                  Does the client have access to their domain registrar / admin panel?
                </label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={watchHasDomainAccess === true}
                      onChange={() => setValue('hasDomainAccess', true)}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={watchHasDomainAccess === false}
                      onChange={() => setValue('hasDomainAccess', false)}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
                {watchHasDomainAccess === false && (
                  <div className="mt-2">
                    <label htmlFor="domainAccessContact" className="text-sm text-muted-foreground">
                      Who should we contact for domain access?
                    </label>
                    <input
                      id="domainAccessContact"
                      type="text"
                      {...register('domainAccessContact')}
                      className={cn(inputClass, 'mt-1')}
                      placeholder="Name and email or phone"
                    />
                  </div>
                )}
              </div>

              {/* Email Platform */}
              <div>
                <label className={labelClass}>
                  Does the client currently have an email marketing platform?
                </label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={watchHasEmailPlatform === true}
                      onChange={() => setValue('hasEmailPlatform', true)}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={watchHasEmailPlatform === false}
                      onChange={() => setValue('hasEmailPlatform', false)}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
                {watchHasEmailPlatform === true && (
                  <div className="mt-2 space-y-3">
                    <div>
                      <label htmlFor="emailPlatform" className="text-sm text-muted-foreground">
                        Which platform?
                      </label>
                      <select
                        id="emailPlatform"
                        value={watchEmailPlatform || ''}
                        onChange={(e) => setValue('emailPlatform', e.target.value)}
                        className={cn(inputClass, 'mt-1')}
                      >
                        <option value="">Select a platform</option>
                        <option value="Mailchimp">Mailchimp</option>
                        <option value="Klaviyo">Klaviyo</option>
                        <option value="HubSpot">HubSpot</option>
                        <option value="ActiveCampaign">ActiveCampaign</option>
                        <option value="Constant Contact">Constant Contact</option>
                        <option value="Brevo">Brevo</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {watchEmailPlatform === 'Other' && (
                      <input
                        type="text"
                        {...register('emailPlatformOther')}
                        className={inputClass}
                        placeholder="Please specify"
                      />
                    )}
                    <div>
                      <label htmlFor="marketingEmail" className="text-sm text-muted-foreground">
                        What email address do they send marketing emails from?
                      </label>
                      <input
                        id="marketingEmail"
                        type="email"
                        {...register('marketingEmail')}
                        className={cn(inputClass, 'mt-1')}
                        placeholder="marketing@company.com"
                      />
                      {errors.marketingEmail && (
                        <p className={errorClass}>{errors.marketingEmail.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Email Admin Access */}
              {watchHasEmailPlatform === true && (
                <div>
                  <label className={labelClass}>
                    Does the client have admin access to their email platform?
                  </label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={watchHasEmailAdminAccess === true}
                        onChange={() => setValue('hasEmailAdminAccess', true)}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={watchHasEmailAdminAccess === false}
                        onChange={() => setValue('hasEmailAdminAccess', false)}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                  {watchHasEmailAdminAccess === false && (
                    <div className="mt-2">
                      <label
                        htmlFor="emailAdminContact"
                        className="text-sm text-muted-foreground"
                      >
                        Who should we contact for email platform access?
                      </label>
                      <input
                        id="emailAdminContact"
                        type="text"
                        {...register('emailAdminContact')}
                        className={cn(inputClass, 'mt-1')}
                        placeholder="Name and email or phone"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Important Notice ── */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Important Notice</h2>
              <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-6">
                <div className="flex gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Access Required for Onboarding Call
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      During the onboarding call, we will need access to the client's{' '}
                      <strong>domain registrar</strong> (e.g., GoDaddy, Namecheap) and their{' '}
                      <strong>email marketing platform admin panel</strong> to properly configure
                      email authentication (SPF, DKIM, DMARC) and set up the account.
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Make sure the client has their login credentials ready, or has the
                      appropriate person available during the call who can provide access.
                    </p>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Without this access, we will not be able to complete the technical setup
                      during the call.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Content Approval ── */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Content Approval</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Who will be reviewing and approving email content before it is sent?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="approverFirstName" className={labelClass}>
                    Approver First Name
                  </label>
                  <input
                    id="approverFirstName"
                    type="text"
                    {...register('approverFirstName')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="approverLastName" className={labelClass}>
                    Approver Last Name
                  </label>
                  <input
                    id="approverLastName"
                    type="text"
                    {...register('approverLastName')}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="approverEmail" className={labelClass}>
                  Approver Email
                </label>
                <input
                  id="approverEmail"
                  type="email"
                  {...register('approverEmail')}
                  className={inputClass}
                  placeholder="approver@company.com"
                />
                {errors.approverEmail && (
                  <p className={errorClass}>{errors.approverEmail.message}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  How would they like to approve email content?
                </label>
                <div className="space-y-2 mt-1">
                  {[
                    'Review each email before sending',
                    'Review a weekly batch',
                    'Trust Prolific to send on your behalf',
                  ].map((method) => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={method}
                        {...register('approvalMethod')}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Can we send emails without prior approval if they do not respond within 48 hours?
                </label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={watch('canSendWithoutApproval') === true}
                      onChange={() => setValue('canSendWithoutApproval', true)}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={watch('canSendWithoutApproval') === false}
                      onChange={() => setValue('canSendWithoutApproval', false)}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <Link
                to="/clients"
                className="flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </Link>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={createClient.isPending}
                className="flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createClient.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Client
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
