import { Link } from 'react-router-dom';
import { Users, Mail, Calendar, Bell, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useOverview } from '@/hooks/queries';
import { useUnreadAlerts } from '@/hooks/queries';
import { cn, formatNumber, getSeverityColor } from '@/lib/utils';

export function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useOverview();
  const { data: alertsData } = useUnreadAlerts();

  const stats = [
    {
      name: 'Total Clients',
      value: overview?.clients.total || 0,
      change: overview?.clients.active || 0,
      changeLabel: 'active',
      icon: Users,
      href: '/clients',
      color: 'bg-blue-500',
    },
    {
      name: 'Campaigns Sent',
      value: overview?.campaigns.sent || 0,
      change: overview?.campaigns.scheduled || 0,
      changeLabel: 'scheduled',
      icon: Mail,
      href: '/campaigns',
      color: 'bg-green-500',
    },
    {
      name: 'Scheduled',
      value: overview?.campaigns.scheduled || 0,
      change: null,
      changeLabel: 'upcoming',
      icon: Calendar,
      href: '/calendar',
      color: 'bg-purple-500',
    },
    {
      name: 'Alerts',
      value: alertsData?.count || 0,
      change: null,
      changeLabel: 'unread',
      icon: Bell,
      href: '/alerts',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your email marketing operations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center',
                  stat.color
                )}
              >
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{stat.name}</p>
              <p className="text-2xl font-bold">
                {overviewLoading ? '—' : formatNumber(stat.value)}
              </p>
              {stat.change !== null && (
                <p className="text-sm text-muted-foreground">
                  {stat.change} {stat.changeLabel}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Recent Alerts</h2>
            <Link
              to="/alerts"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="p-4">
            {alertsData?.alerts && alertsData.alerts.length > 0 ? (
              <ul className="space-y-3">
                {alertsData.alerts.slice(0, 5).map((alert) => (
                  <li
                    key={alert.id}
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-accent"
                  >
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-md font-medium mt-0.5',
                        getSeverityColor(alert.severity)
                      )}
                    >
                      {alert.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {alert.message}
                      </p>
                      {alert.client && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.client.name}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No alerts to show
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Quick Actions</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <Link
              to="/clients"
              className="p-4 rounded-lg border hover:bg-accent transition-colors text-center"
            >
              <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Add Client</p>
            </Link>
            <Link
              to="/campaigns"
              className="p-4 rounded-lg border hover:bg-accent transition-colors text-center"
            >
              <Mail className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">View Campaigns</p>
            </Link>
            <Link
              to="/calendar"
              className="p-4 rounded-lg border hover:bg-accent transition-colors text-center"
            >
              <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Schedule</p>
            </Link>
            <Link
              to="/alerts"
              className="p-4 rounded-lg border hover:bg-accent transition-colors text-center"
            >
              <Bell className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">View Alerts</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Performance Summary (Last 30 Days)</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Campaigns Sent</p>
              <p className="text-2xl font-bold">{overview?.campaigns.sent || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold">{overview?.clients.total || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Clients</p>
              <p className="text-2xl font-bold">{overview?.clients.active || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold">{overview?.campaigns.scheduled || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
