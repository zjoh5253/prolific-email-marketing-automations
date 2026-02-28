import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlass, EnvelopeSimple, ArrowSquareOut } from '@phosphor-icons/react';
import { useCampaigns } from '@/hooks/queries';
import { cn, getStatusColor, formatDateTime } from '@/lib/utils';
import { CampaignStatus } from '@/types';

const statusLabels: Record<CampaignStatus, string> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  SCHEDULED: 'Scheduled',
  SENDING: 'Sending',
  SENT: 'Sent',
  CANCELLED: 'Cancelled',
  ARCHIVED: 'Archived',
  UNKNOWN: 'Unknown',
};

export function CampaignsPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
  const clientIdFilter = searchParams.get('clientId') || undefined;

  const { data, isLoading } = useCampaigns({
    search: search || undefined,
    status: statusFilter ? (statusFilter as CampaignStatus) : undefined,
    clientId: clientIdFilter,
  });

  const campaigns = data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <p className="text-muted-foreground">View and manage email campaigns across all clients</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-muted rounded mb-2" />
                  <div className="h-4 w-32 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <EnvelopeSimple className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No campaigns found</p>
          <p className="text-sm text-muted-foreground">
            Campaigns will appear here once they are synced from your email platforms.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Campaign
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Metrics
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      {campaign.subjectLine && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {campaign.subjectLine}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {campaign.client ? (
                      <Link
                        to={`/clients/${campaign.client.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {campaign.client.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded-md font-medium',
                        getStatusColor(campaign.status)
                      )}
                    >
                      {statusLabels[campaign.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {campaign.sentAt ? (
                      <div className="text-sm">
                        <p>Sent</p>
                        <p className="text-muted-foreground">{formatDateTime(campaign.sentAt)}</p>
                      </div>
                    ) : campaign.scheduledAt ? (
                      <div className="text-sm">
                        <p>Scheduled</p>
                        <p className="text-muted-foreground">
                          {formatDateTime(campaign.scheduledAt)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {campaign.metrics ? (
                      <div className="text-sm">
                        <p>
                          {campaign.metrics.openRate.toFixed(1)}% open •{' '}
                          {campaign.metrics.clickRate.toFixed(1)}% click
                        </p>
                        <p className="text-muted-foreground">
                          {campaign.metrics.sent.toLocaleString()} sent
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      View
                      <ArrowSquareOut className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: data.pagination.totalPages }, (_, i) => (
            <button
              key={i}
              className={cn(
                'h-8 w-8 rounded-md text-sm font-medium',
                data.pagination.page === i + 1
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
