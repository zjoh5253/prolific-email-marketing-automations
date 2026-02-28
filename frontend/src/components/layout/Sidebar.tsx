import { Link, useLocation } from 'react-router-dom';
import {
  SquaresFour,
  UsersThree,
  EnvelopeSimple,
  CalendarBlank,
  Bell,
  GearSix,
  ClipboardText,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: SquaresFour },
  { name: 'Clients', href: '/clients', icon: UsersThree },
  { name: 'Campaigns', href: '/campaigns', icon: EnvelopeSimple },
  { name: 'Calendar', href: '/calendar', icon: CalendarBlank },
  { name: 'Onboarding Form Submissions', href: '/onboarding-submissions', icon: ClipboardText },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Settings', href: '/settings', icon: GearSix },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!sidebarCollapsed && (
          <Link to="/dashboard" className="flex items-center">
            <img src="/logo.png" alt="Prolific" className="h-8" />
          </Link>
        )}
        {sidebarCollapsed && (
          <Link to="/dashboard" className="mx-auto">
            <img src="/logo-icon.png" alt="Prolific" className="h-8 w-8" />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <CaretRight className="h-5 w-5" />
          ) : (
            <CaretLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
