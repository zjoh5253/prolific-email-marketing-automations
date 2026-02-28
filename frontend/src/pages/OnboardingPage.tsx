import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { onboardingApi } from '@/api/onboarding';
import { cn } from '@/lib/utils';

const onboardingSchema = z.object({
  // Step 1
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  // Step 2
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
  // Step 3
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
  // Step 5
  approverFirstName: z.string().optional(),
  approverLastName: z.string().optional(),
  approverEmail: z.string().email().optional().or(z.literal('')),
  approvalMethod: z.string().optional(),
  canSendWithoutApproval: z.boolean().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const STEPS = [
  { number: 1, label: 'Contact Info' },
  { number: 2, label: 'Content' },
  { number: 3, label: 'Technical Setup' },
  { number: 4, label: 'Important Notice' },
  { number: 5, label: 'Content Approval' },
];

const STEP_FIELDS: Record<number, (keyof OnboardingFormData)[]> = {
  1: ['firstName', 'lastName', 'email'],
  2: [
    'companyName', 'fromFieldName', 'companyDescription', 'idealCustomer',
    'coreProducts', 'peakSeasonPriorities', 'yearRoundOffers', 'businessStory',
    'uniqueValue', 'productTransformation',
  ],
  3: [
    'domainHost', 'domainHostOther', 'hasDomainAccess', 'domainAccessContact',
    'hasEmailPlatform', 'emailPlatform', 'emailPlatformOther', 'marketingEmail',
    'hasEmailAdminAccess', 'emailAdminContact',
  ],
  4: [], // Display only
  5: [
    'approverFirstName', 'approverLastName', 'approverEmail',
    'approvalMethod', 'canSendWithoutApproval',
  ],
};

const DOMAIN_HOSTS = ['GoDaddy', 'Namecheap', 'Google Domains', 'Cloudflare', 'Bluehost', 'HostGator', 'Other'];

const inputClass =
  'w-full h-10 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';
const textareaClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-y';
const labelClass = 'block text-sm font-medium mb-1.5';
const errorClass = 'text-destructive text-sm mt-1';

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      hasDomainAccess: undefined,
      hasEmailPlatform: undefined,
      hasEmailAdminAccess: undefined,
      canSendWithoutApproval: undefined,
    },
  });

  const watchDomainHost = watch('domainHost');
  const watchHasDomainAccess = watch('hasDomainAccess');
  const watchHasEmailPlatform = watch('hasEmailPlatform');
  const watchEmailPlatform = watch('emailPlatform');
  const watchHasEmailAdminAccess = watch('hasEmailAdminAccess');

  const goNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setCurrentStep((s) => Math.min(s + 1, 5));
  };

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      // Clean empty strings to undefined
      const cleaned = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
      );
      await onboardingApi.submit(cleaned as OnboardingFormData);
      setIsSubmitted(true);
    } catch {
      // Error handled by API interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isSubmitted) return;
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [isSubmitted]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-3xl text-center mb-6">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
          <p className="text-muted-foreground">
            Your information has been submitted successfully. Please sign up for a strategy call below.
          </p>
        </div>
        <div className="w-full max-w-3xl bg-card rounded-lg shadow-lg border overflow-hidden">
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/zac-prolificbranddesign/30min"
            style={{ minWidth: '320px', height: '700px' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">P</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Client Onboarding</h1>
          <p className="text-muted-foreground mt-1">
            Complete the form below to get started with Prolific
          </p>
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
          <div className="bg-card rounded-lg shadow-lg p-6 sm:p-8 border">
            {/* Step 1: Contact Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>
                      First Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      {...register('firstName')}
                      className={inputClass}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className={errorClass}>{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClass}>
                      Last Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      {...register('lastName')}
                      className={inputClass}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className={errorClass}>{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={inputClass}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className={errorClass}>{errors.email.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Content Questions */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">For Content</h2>
                <div>
                  <label htmlFor="companyName" className={labelClass}>
                    What is the name of your company?
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
                    How would you describe your company in 2-3 sentences?
                  </label>
                  <textarea
                    id="companyDescription"
                    {...register('companyDescription')}
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label htmlFor="idealCustomer" className={labelClass}>
                    Who is your ideal customer? Describe their demographics, interests, and pain
                    points.
                  </label>
                  <textarea
                    id="idealCustomer"
                    {...register('idealCustomer')}
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label htmlFor="coreProducts" className={labelClass}>
                    What are your core products or services, and what makes them unique?
                  </label>
                  <textarea
                    id="coreProducts"
                    {...register('coreProducts')}
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label htmlFor="peakSeasonPriorities" className={labelClass}>
                    What are your peak season priorities and promotional calendar highlights?
                  </label>
                  <textarea
                    id="peakSeasonPriorities"
                    {...register('peakSeasonPriorities')}
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label htmlFor="yearRoundOffers" className={labelClass}>
                    What offers, discounts, or incentives do you run year-round?
                  </label>
                  <textarea
                    id="yearRoundOffers"
                    {...register('yearRoundOffers')}
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label htmlFor="businessStory" className={labelClass}>
                    What is the story behind your business? How did it start?
                  </label>
                  <textarea
                    id="businessStory"
                    {...register('businessStory')}
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label htmlFor="uniqueValue" className={labelClass}>
                    What makes your brand different from competitors?
                  </label>
                  <textarea
                    id="uniqueValue"
                    {...register('uniqueValue')}
                    className={textareaClass}
                  />
                </div>
                <div>
                  <label htmlFor="productTransformation" className={labelClass}>
                    How does your product or service transform your customer's life or business?
                  </label>
                  <textarea
                    id="productTransformation"
                    {...register('productTransformation')}
                    className={textareaClass}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Technical Setup */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">For Technical Setup</h2>

                {/* Domain Host */}
                <div>
                  <label className={labelClass}>
                    Where is your domain registered / hosted?
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
                    Do you have access to your domain registrar / admin panel?
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
                    Do you currently have an email marketing platform?
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
                          What email address do you send marketing emails from?
                        </label>
                        <input
                          id="marketingEmail"
                          type="email"
                          {...register('marketingEmail')}
                          className={cn(inputClass, 'mt-1')}
                          placeholder="marketing@yourcompany.com"
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
                      Do you have admin access to your email platform?
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

            {/* Step 4: Important Notice */}
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
                        During your onboarding call, we will need access to your{' '}
                        <strong>domain registrar</strong> (e.g., GoDaddy, Namecheap) and your{' '}
                        <strong>email marketing platform admin panel</strong> to properly configure
                        email authentication (SPF, DKIM, DMARC) and set up your account.
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Please make sure you have your login credentials ready, or have the
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

            {/* Step 5: Content Approval */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">For Content Approval</h2>
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
                    How would you like to approve email content?
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
                    Can we send emails without prior approval if you do not respond within 48 hours?
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

                <div className="rounded-lg border border-muted bg-muted/50 p-4 mt-6">
                  <p className="text-sm text-muted-foreground">
                    By submitting this form, you acknowledge that the information provided is
                    accurate and that you authorize Prolific to use this information to set up
                    and manage your email marketing campaigns.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
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
                <div />
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
                  disabled={isSubmitting}
                  className="flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
