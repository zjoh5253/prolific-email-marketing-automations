import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MagnifyingGlass, DotsThree, ArrowsClockwise, ArrowSquareOut, SquaresFour, List } from '@phosphor-icons/react';
import { useClients, useAccountManagers, useTriggerSync } from '@/hooks/queries';
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

function getInitialViewMode(): 'grid' | 'table' {
  try {
    const stored = localStorage.getItem('clients-view-mode');
    if (stored === 'grid' || stored === 'table') return stored;
  } catch {}
  return 'table';
}

export function ClientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [managerFilter, setManagerFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(getInitialViewMode);

  const { data, isLoading } = useClients({
    search: search || undefined,
    status: statusFilter || undefined,
    platform: platformFilter || undefined,
    accountManagerId: managerFilter || undefined,
  });

  const { data: managers } = useAccountManagers();
  const triggerSync = useTriggerSync();

  const clients = data?.data || [];

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    try {
      localStorage.setItem('clients-view-mode', mode);
    } catch {}
  };

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
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
          <option value="ONBOARDING">Onboarding</option>
          <option value="PAUSED">Paused</option>
          <option value="CHURNED">Churned</option>
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

        <select
          value={managerFilter}
          onChange={(e) => setManagerFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Managers</option>
          {managers?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div className="flex items-center rounded-md border border-input">
          <button
            onClick={() => handleViewModeChange('grid')}
            className={cn(
              'p-2 rounded-l-md transition-colors',
              viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
            title="Grid view"
          >
            <SquaresFour className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleViewModeChange('table')}
            className={cn(
              'p-2 rounded-r-md transition-colors',
              viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
            title="Table view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="h-6 w-16 rounded-md bg-muted" />
                </div>
                <div className="h-5 w-32 bg-muted rounded mb-2" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border p-8 animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          </div>
        )
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
      ) : viewMode === 'grid' ? (
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
      ) : (
        <ClientsTable
          clients={clients}
          onSync={(id) => triggerSync.mutate(id)}
          isSyncing={triggerSync.isPending}
        />
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

function ClientsTable({
  clients,
  onSync,
  isSyncing,
}: {
  clients: ClientWithStats[];
  onSync: (id: string) => void;
  isSyncing: boolean;
}) {
  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Account Manager</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Platform</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tier</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Campaigns</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Lists</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Last Sync</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b last:border-0 hover:bg-muted/50">
              <td className="px-4 py-3">
                <Link to={`/clients/${client.id}`} className="flex items-center gap-3 group">
                  <div
                    className="h-8 w-8 rounded-md flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: getPlatformColor(client.platform) }}
                  >
                    {client.name[0]}
                  </div>
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {client.name}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-sm">
                {client.accountManager
                  ? `${client.accountManager.firstName} ${client.accountManager.lastName}`
                  : <span className="text-muted-foreground">--</span>}
              </td>
              <td className="px-4 py-3 text-sm">
                {platformLabels[client.platform] || client.platform}
              </td>
              <td className="px-4 py-3 text-sm">
                {client.tier || <span className="text-muted-foreground">--</span>}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-md font-medium',
                    getStatusColor(client.status)
                  )}
                >
                  {client.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">{client._count?.campaigns || 0}</td>
              <td className="px-4 py-3 text-sm">{client._count?.lists || 0}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {client.lastSyncAt ? formatDate(client.lastSyncAt) : 'Never'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onSync(client.id)}
                    disabled={isSyncing}
                    className="p-1.5 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
                    title="Sync now"
                  >
                    <ArrowsClockwise className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
                  </button>
                  <Link
                    to={`/clients/${client.id}`}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View
                    <ArrowSquareOut className="h-3 w-3" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
              <DotsThree className="h-4 w-4 text-muted-foreground" />
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
                    <ArrowSquareOut className="h-4 w-4" />
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
                    <ArrowsClockwise className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
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

        {client.accountManager && (
          <p className="text-xs text-muted-foreground mt-1">
            {client.accountManager.firstName} {client.accountManager.lastName}
          </p>
        )}

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
