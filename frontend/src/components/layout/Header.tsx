import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useUnreadAlerts } from '@/hooks/queries';
import { cn, getInitials, getSeverityColor } from '@/lib/utils';
import { authApi } from '@/api';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data: alertsData } = useUnreadAlerts();

  const [showAlerts, setShowAlerts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore error
    }
    logout();
    navigate('/login');
  };

  const unreadCount = alertsData?.count || 0;

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients, campaigns..."
            className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Alerts */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-2 rounded-md hover:bg-accent transition-colors"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showAlerts && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAlerts(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border bg-popover p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => navigate('/alerts')}
                      className="text-sm text-primary hover:underline"
                    >
                      View all
                    </button>
                  )}
                </div>

                {alertsData?.alerts && alertsData.alerts.length > 0 ? (
                  <ul className="space-y-2 max-h-64 overflow-y-auto">
                    {alertsData.alerts.slice(0, 5).map((alert) => (
                      <li
                        key={alert.id}
                        className="p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setShowAlerts(false);
                          navigate('/alerts');
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={cn(
                              'text-xs px-1.5 py-0.5 rounded-md font-medium',
                              getSeverityColor(alert.severity)
                            )}
                          >
                            {alert.severity}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {alert.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No new notifications
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-accent transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
              </span>
            </div>
            <span className="text-sm font-medium">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border bg-popover py-1 shadow-lg">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role.toLowerCase()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                >
                  <User className="h-4 w-4" />
                  Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
