import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, RefreshCw, ExternalLink } from 'lucide-react';
import { useClients, useTriggerSync } from '@/hooks/queries';
import { cn, getStatusColor, getPlatformColor, formatDate } from '@/lib/utils';
import { ClientWithStats, EmailPlatform } from '@/types';

const platformLabels: Record<EmailPlatform, string> = {
  MAILCHIMP: 'Mailchimp',
  KLAVIYO: 'Klaviyo',
  HUBSPOT: 'HubSpot',
  ACTIVECAMPAIGN: 'ActiveCampaign',
  CONSTANT_CONTACT: 'Constant Contact',
  BREVO: 'Brevo',
  SERVICETITAN: 'ServiceTitan',
  BEEHIIV: 'Beehiiv',
};

export function ClientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('');

  const { data, isLoading } = useClients({
    search: search || undefined,
    status: statusFilter || undefined,
    platform: platformFilter || undefined,
  });

  const triggerSync = useTriggerSync();

  const clients = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your email marketing clients</p>
        </div>
        <Link
          to="/clients/new"
          className="flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients..."
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
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="PAUSED">Paused</option>
          <option value="DISCONNECTED">Disconnected</option>
        </select>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Platforms</option>
          {Object.entries(platformLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-card rounded-lg border p-6 animate-pulse"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="h-6 w-16 rounded-md bg-muted" />
              </div>
              <div className="h-5 w-32 bg-muted rounded mb-2" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <p className="text-muted-foreground mb-4">No clients found</p>
          <Link
            to="/clients/new"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add your first client
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onSync={() => triggerSync.mutate(client.id)}
              isSyncing={triggerSync.isPending}
            />
          ))}
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

function ClientCard({
  client,
  onSync,
  isSyncing,
}: {
  client: ClientWithStats;
  onSync: () => void;
  isSyncing: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: getPlatformColor(client.platform) }}
        >
          {client.name[0]}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-xs px-2 py-1 rounded-md font-medium',
              getStatusColor(client.status)
            )}
          >
            {client.status}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md hover:bg-accent"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-50 w-48 rounded-md border bg-popover py-1 shadow-lg">
                  <Link
                    to={`/clients/${client.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Details
                  </Link>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onSync();
                    }}
                    disabled={isSyncing}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
                  >
                    <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
                    Sync Now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Link to={`/clients/${client.id}`} className="block group">
        <h3 className="font-semibold group-hover:text-primary transition-colors">
          {client.name}
        </h3>
        <p className="text-sm text-muted-foreground">{platformLabels[client.platform]}</p>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{client._count?.campaigns || 0} campaigns</span>
          <span>{client._count?.lists || 0} lists</span>
        </div>

        {client.lastSyncAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Last synced: {formatDate(client.lastSyncAt)}
          </p>
        )}
      </Link>
    </div>
  );
}
