import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Checks, X } from '@phosphor-icons/react';
import { useAlerts, useMarkAlertRead, useDismissAlert, useMarkAllAlertsRead } from '@/hooks/queries';
import { cn, getSeverityColor, formatDateTime } from '@/lib/utils';
import { AlertType, AlertSeverity } from '@/types';

const typeLabels: Record<AlertType, string> = {
  SYNC_ERROR: 'Sync Error',
  CREDENTIAL_ISSUE: 'Credential Issue',
  PERFORMANCE_ANOMALY: 'Performance Anomaly',
  SCHEDULE_CONFLICT: 'Schedule Conflict',
  APPROVAL_NEEDED: 'Approval Needed',
  CAMPAIGN_SENT: 'Campaign Sent',
  LIST_HEALTH: 'List Health',
  RATE_LIMIT: 'Rate Limit',
  SYSTEM: 'System',
};

export function AlertsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [showRead, setShowRead] = useState(false);

  const { data, isLoading } = useAlerts({
    type: typeFilter as AlertType || undefined,
    severity: severityFilter as AlertSeverity || undefined,
    isRead: showRead ? undefined : false,
  });

  const markRead = useMarkAlertRead();
  const dismiss = useDismissAlert();
  const markAllRead = useMarkAllAlertsRead();

  const alerts = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">Monitor system notifications and issues</p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-2 h-9 px-3 rounded-md border hover:bg-accent transition-colors disabled:opacity-50"
          >
            <Checks className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Severities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>

        <label className="flex items-center gap-2 h-10 px-3 rounded-md border bg-background cursor-pointer">
          <input
            type="checkbox"
            checked={showRead}
            onChange={(e) => setShowRead(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Show read alerts</span>
        </label>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="h-6 w-16 bg-muted rounded" />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-muted rounded mb-2" />
                  <div className="h-4 w-full bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No alerts to show</p>
          <p className="text-sm text-muted-foreground">
            {showRead
              ? 'All caught up! No alerts match your filters.'
              : 'All caught up! No unread alerts.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'bg-card rounded-lg border p-4 transition-colors',
                !alert.isRead && 'border-l-4 border-l-primary'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap',
                      getSeverityColor(alert.severity)
                    )}
                  >
                    {alert.severity}
                  </span>
                  <div>
                    <h3 className="font-medium">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{typeLabels[alert.type]}</span>
                      <span>{formatDateTime(alert.createdAt)}</span>
                      {alert.client && (
                        <Link
                          to={`/clients/${alert.client.id}`}
                          className="text-primary hover:underline"
                        >
                          {alert.client.name}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!alert.isRead && (
                    <button
                      onClick={() => markRead.mutate(alert.id)}
                      disabled={markRead.isPending}
                      className="p-1.5 rounded-md hover:bg-accent transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => dismiss.mutate(alert.id)}
                    disabled={dismiss.isPending}
                    className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
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
