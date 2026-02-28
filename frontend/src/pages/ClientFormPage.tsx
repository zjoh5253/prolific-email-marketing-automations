import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateClient } from '@/hooks/queries';
import { EmailPlatform } from '@/types';

const platforms: { value: EmailPlatform; label: string }[] = [
  { value: 'MAILCHIMP', label: 'Mailchimp' },
  { value: 'KLAVIYO', label: 'Klaviyo' },
  { value: 'HUBSPOT', label: 'HubSpot' },
  { value: 'ACTIVECAMPAIGN', label: 'ActiveCampaign' },
  { value: 'CONSTANT_CONTACT', label: 'Constant Contact' },
  { value: 'BREVO', label: 'Brevo' },
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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function ClientFormPage() {
  const navigate = useNavigate();
  const createClient = useCreateClient();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    platform: '' as EmailPlatform | '',
    industry: '',
    timezone: 'America/New_York',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase letters, numbers, and hyphens only';
    }

    if (!formData.platform) {
      newErrors.platform = 'Please select a platform';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const client = await createClient.mutateAsync({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        platform: formData.platform as EmailPlatform,
        industry: formData.industry.trim() || undefined,
        timezone: formData.timezone,
      });

      navigate(`/clients/${client.id}`);
    } catch {
      // Error is handled by the mutation's onError callback
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6">
        <div className="space-y-6">
          {/* Client Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
            >
              Client Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g., Acme Corporation"
              className={`w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? 'border-destructive' : ''
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium mb-2"
            >
              Slug <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g., acme-corporation"
              className={`w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.slug ? 'border-destructive' : ''
              }`}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              URL-friendly identifier. Auto-generated from name.
            </p>
            {errors.slug && (
              <p className="mt-1 text-sm text-destructive">{errors.slug}</p>
            )}
          </div>

          {/* Platform */}
          <div>
            <label
              htmlFor="platform"
              className="block text-sm font-medium mb-2"
            >
              Email Platform <span className="text-destructive">*</span>
            </label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className={`w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.platform ? 'border-destructive' : ''
              }`}
            >
              <option value="">Select a platform...</option>
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {errors.platform && (
              <p className="mt-1 text-sm text-destructive">{errors.platform}</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <label
              htmlFor="industry"
              className="block text-sm font-medium mb-2"
            >
              Industry
            </label>
            <input
              type="text"
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="e.g., E-commerce, Healthcare, Education"
              className="w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Optional. Used for benchmarking and AI context.
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label
              htmlFor="timezone"
              className="block text-sm font-medium mb-2"
            >
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
          <Link
            to="/clients"
            className="h-10 px-4 rounded-md border hover:bg-accent transition-colors inline-flex items-center justify-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createClient.isPending}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 inline-flex items-center justify-center"
          >
            {createClient.isPending ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
