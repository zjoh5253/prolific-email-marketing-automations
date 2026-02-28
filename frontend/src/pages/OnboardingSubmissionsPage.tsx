import { useState } from 'react';
import {
  Search,
  ChevronLeft,
  Loader2,
  Eye,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useOnboardingSubmissions,
  useOnboardingSubmission,
  useUpdateOnboardingStatus,
} from '@/hooks/queries/useOnboarding';
import type { OnboardingStatus, OnboardingSubmission } from '@/types';

const STATUS_OPTIONS: { value: OnboardingStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const STATUS_COLORS: Record<OnboardingStatus, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  REVIEWED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  CONVERTED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

function StatusBadge({ status }: { status: OnboardingStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        STATUS_COLORS[status]
      )}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function SubmissionDetail({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const { data: submission, isLoading } = useOnboardingSubmission(id);
  const updateStatus = useUpdateOnboardingStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12 text-muted-foreground">Submission not found.</div>
    );
  }

  const handleStatusUpdate = (status: OnboardingStatus) => {
    updateStatus.mutate({ id, status });
  };

  const fieldSection = (label: string, value: string | boolean | null | undefined) => {
    if (value === null || value === undefined || value === '') return null;
    const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    return (
      <div>
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="text-sm mt-0.5 whitespace-pre-wrap">{display}</dd>
      </div>
    );
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to submissions
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            {submission.firstName} {submission.lastName}
          </h2>
          <p className="text-sm text-muted-foreground">{submission.email}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      {/* Status Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        {submission.status !== 'REVIEWED' && (
          <button
            onClick={() => handleStatusUpdate('REVIEWED')}
            disabled={updateStatus.isPending}
            className="h-8 px-3 rounded-md border border-input bg-background text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
          >
            Mark Reviewed
          </button>
        )}
        {submission.status !== 'CONVERTED' && (
          <button
            onClick={() => handleStatusUpdate('CONVERTED')}
            disabled={updateStatus.isPending}
            className="h-8 px-3 rounded-md border border-input bg-background text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
          >
            Mark Converted
          </button>
        )}
        {submission.status !== 'ARCHIVED' && (
          <button
            onClick={() => handleStatusUpdate('ARCHIVED')}
            disabled={updateStatus.isPending}
            className="h-8 px-3 rounded-md border border-input bg-background text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
          >
            Archive
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Contact Info */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-medium mb-3">Contact Information</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fieldSection('First Name', submission.firstName)}
            {fieldSection('Last Name', submission.lastName)}
            {fieldSection('Email', submission.email)}
          </dl>
        </div>

        {/* Content */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-medium mb-3">Content</h3>
          <dl className="space-y-3">
            {fieldSection('Company Name', submission.companyName)}
            {fieldSection('From Field Name', submission.fromFieldName)}
            {fieldSection('Company Description', submission.companyDescription)}
            {fieldSection('Ideal Customer', submission.idealCustomer)}
            {fieldSection('Core Products', submission.coreProducts)}
            {fieldSection('Peak Season Priorities', submission.peakSeasonPriorities)}
            {fieldSection('Year-Round Offers', submission.yearRoundOffers)}
            {fieldSection('Business Story', submission.businessStory)}
            {fieldSection('Unique Value', submission.uniqueValue)}
            {fieldSection('Product Transformation', submission.productTransformation)}
          </dl>
        </div>

        {/* Technical Setup */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-medium mb-3">Technical Setup</h3>
          <dl className="space-y-3">
            {fieldSection(
              'Domain Host',
              submission.domainHost === 'Other'
                ? `Other: ${submission.domainHostOther || 'Not specified'}`
                : submission.domainHost
            )}
            {fieldSection('Has Domain Access', submission.hasDomainAccess)}
            {fieldSection('Domain Access Contact', submission.domainAccessContact)}
            {fieldSection('Has Email Platform', submission.hasEmailPlatform)}
            {fieldSection(
              'Email Platform',
              submission.emailPlatform === 'Other'
                ? `Other: ${submission.emailPlatformOther || 'Not specified'}`
                : submission.emailPlatform
            )}
            {fieldSection('Marketing Email', submission.marketingEmail)}
            {fieldSection('Has Email Admin Access', submission.hasEmailAdminAccess)}
            {fieldSection('Email Admin Contact', submission.emailAdminContact)}
          </dl>
        </div>

        {/* Content Approval */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-medium mb-3">Content Approval</h3>
          <dl className="space-y-3">
            {fieldSection('Approver First Name', submission.approverFirstName)}
            {fieldSection('Approver Last Name', submission.approverLastName)}
            {fieldSection('Approver Email', submission.approverEmail)}
            {fieldSection('Approval Method', submission.approvalMethod)}
            {fieldSection('Can Send Without Approval', submission.canSendWithoutApproval)}
          </dl>
        </div>

        {/* Meta */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-medium mb-3">Metadata</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fieldSection('Submitted At', new Date(submission.submittedAt).toLocaleString())}
            {fieldSection('IP Address', submission.ipAddress)}
            {fieldSection('User Agent', submission.userAgent)}
            {submission.convertedClient &&
              fieldSection(
                'Converted Client',
                `${submission.convertedClient.name} (${submission.convertedClient.slug})`
              )}
          </dl>
        </div>
      </div>
    </div>
  );
}

export function OnboardingSubmissionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OnboardingStatus | ''>('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useOnboardingSubmissions({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    limit: 25,
  });

  const submissions = data?.data || [];
  const pagination = data?.pagination;

  if (selectedId) {
    return (
      <div className="p-6">
        <SubmissionDetail id={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Onboarding Submissions</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage client onboarding form submissions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or company..."
            className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as OnboardingStatus | '');
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search || statusFilter
            ? 'No submissions match your filters.'
            : 'No onboarding submissions yet.'}
        </div>
      ) : (
        <>
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                      Name
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                      Email
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                      Company
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                      Submitted
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub: OnboardingSubmission) => (
                    <tr
                      key={sub.id}
                      className="border-b last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedId(sub.id)}
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {sub.firstName} {sub.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{sub.email}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {sub.companyName || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(sub.id);
                          }}
                          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * (pagination.limit) + 1}–
                {Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-3 rounded-md border border-input bg-background text-xs font-medium hover:bg-accent disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="h-8 px-3 rounded-md border border-input bg-background text-xs font-medium hover:bg-accent disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
