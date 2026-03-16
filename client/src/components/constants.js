export const PIPELINE_STAGES = [
  'New Lead (MQL)',
  'Contacted / Qualifying',
  'Appointment Scheduled',
  'Sales Qualified Lead (SQL)',
  'Proposal / Estimate Sent',
  'Decision Pending',
];

export const CLOSED_STAGES = ['Closed Won', 'Closed Lost'];

export const ALL_STAGES = [...PIPELINE_STAGES, ...CLOSED_STAGES];

export const INDUSTRIES = ['HVAC', 'Plumbing', 'Roofing', 'Electrical', 'Landscaping', 'Garage Doors', 'Lighting', 'Window Cleaning', 'Other Trades'];

export const SERVICE_AREAS = ['Local', 'Regional', 'National'];

export const LEAD_SOURCES = ['Referral', 'Google Ads', 'Organic Search', 'Event', 'Partner', 'Cold Outreach'];

export const CLIENT_STATUSES = ['Prospect', 'Active Client', 'Past Client', 'Partner'];

export const TIMELINES = ['ASAP', '1–3 Months', '3–6 Months', 'Exploring'];

export const LEAD_TEMPS = ['Hot', 'Warm', 'Cold'];

export const CONTACT_METHODS = ['Phone', 'Email', 'Text'];

export const tempColor = (temp) => {
  if (temp === 'Hot') return 'bg-red-500';
  if (temp === 'Warm') return 'bg-amber-400';
  return 'bg-blue-400';
};

export const tempBadge = (temp) => {
  if (temp === 'Hot') return 'bg-red-100 text-red-700';
  if (temp === 'Warm') return 'bg-amber-100 text-amber-700';
  return 'bg-blue-100 text-blue-700';
};

export const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val || 0);
};

export const daysSince = (dateStr) => {
  if (!dateStr) return 0;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};
