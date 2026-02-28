import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Settings, Mail, Users, BarChart } from 'lucide-react';
import { useClient, useTriggerSync, useTestConnection } from '@/hooks/queries';
import { cn, getStatusColor, getPlatformColor, formatDate, formatDateTime } from '@/lib/utils';

const platformLabels: Record<string, string> = {
  MAILCHIMP: 'Mailchimp',
  KLAVIYO: 'Klaviyo',
  HUBSPOT: 'HubSpot',
  ACTIVECAMPAIGN: 'ActiveCampaign',
  CONSTANT_CONTACT: 'Constant Contact',
  BREVO: 'Brevo',
  SERVICETITAN: 'ServiceTitan',
  BEEHIIV: 'Beehiiv',
};

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: client, isLoading } = useClient(id!);
  const triggerSync = useTriggerSync();
  const testConnection = useTestConnection();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-40 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Client not found</p>
        <Link to="/clients" className="text-primary hover:underline mt-2 inline-block">
          Back to clients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/clients"
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: getPlatformColor(client.platform) }}
          >
            {client.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <span
                className={cn(
                  'text-xs px-2 py-1 rounded-md font-medium',
                  getStatusColor(client.status)
                )}
              >
                {client.status}
              </span>
            </div>
            <p className="text-muted-foreground">{platformLabels[client.platform]}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => testConnection.mutate(id!)}
            disabled={testConnection.isPending}
            className="flex items-center gap-2 h-9 px-3 rounded-md border hover:bg-accent transition-colors disabled:opacity-50"
          >
            Test Connection
          </button>
          <button
            onClick={() => triggerSync.mutate(id!)}
            disabled={triggerSync.isPending}
            className="flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', triggerSync.isPending && 'animate-spin')} />
            Sync
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Mail className="h-4 w-4" />
            <span className="text-sm">Campaigns</span>
          </div>
          <p className="text-2xl font-bold">—</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">Lists</span>
          </div>
          <p className="text-2xl font-bold">—</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BarChart className="h-4 w-4" />
            <span className="text-sm">Avg Open Rate</span>
          </div>
          <p className="text-2xl font-bold">—%</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">Last Sync</span>
          </div>
          <p className="text-lg font-medium">
            {client.lastSyncAt ? formatDateTime(client.lastSyncAt) : 'Never'}
          </p>
        </div>
      </div>

      {/* Client Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Client Details</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Account Manager</p>
              <p className="font-medium">
                {client.accountManager
                  ? `${client.accountManager.firstName} ${client.accountManager.lastName}`
                  : 'Not assigned'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tier</p>
              <p className="font-medium">{client.tier || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact Email</p>
              <p className="font-medium">{client.contactEmail || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="font-medium">{client.industry || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Timezone</p>
              <p className="font-medium">{client.timezone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(client.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Platform Connection</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <p className="font-medium">{platformLabels[client.platform]}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sync Status</p>
              <span
                className={cn(
                  'inline-block text-xs px-2 py-1 rounded-md font-medium',
                  client.syncStatus === 'SYNCED'
                    ? 'bg-green-100 text-green-800'
                    : client.syncStatus === 'SYNCING'
                    ? 'bg-blue-100 text-blue-800'
                    : client.syncStatus === 'FAILED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                )}
              >
                {client.syncStatus}
              </span>
            </div>
            <div className="pt-4 border-t">
              <Link
                to={`/clients/${client.id}/settings`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Settings className="h-4 w-4" />
                Manage credentials
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns placeholder */}
      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Recent Campaigns</h2>
          <Link
            to={`/campaigns?clientId=${client.id}`}
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          No campaigns synced yet. Click "Sync" to fetch campaigns from {platformLabels[client.platform]}.
        </div>
      </div>
    </div>
  );
}
