import { useState } from 'react';
import { User, Bell, ShieldCheck, Palette } from '@phosphor-icons/react';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const user = useAuthStore((state) => state.user);
  const { theme, setTheme } = useUIStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <nav className="w-48 shrink-0">
          <ul className="space-y-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-card rounded-lg border p-6 space-y-6">
              <h2 className="text-lg font-semibold">Profile Settings</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1.5">First Name</label>
                  <input
                    type="text"
                    defaultValue={user?.firstName}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Last Name</label>
                  <input
                    type="text"
                    defaultValue={user?.lastName}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="w-full h-10 rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Contact an admin to change your email address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Role</label>
                <input
                  type="text"
                  value={user?.role || ''}
                  disabled
                  className="w-full h-10 rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground capitalize"
                />
              </div>

              <button className="h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-card rounded-lg border p-6 space-y-6">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent/50">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded" />
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent/50">
                  <div>
                    <p className="font-medium">Sync Errors</p>
                    <p className="text-sm text-muted-foreground">
                      Notify when campaigns fail to sync
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded" />
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent/50">
                  <div>
                    <p className="font-medium">Credential Issues</p>
                    <p className="text-sm text-muted-foreground">
                      Notify when API credentials expire or fail
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded" />
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent/50">
                  <div>
                    <p className="font-medium">Approval Requests</p>
                    <p className="text-sm text-muted-foreground">
                      Notify when campaigns need approval
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded" />
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-accent/50">
                  <div>
                    <p className="font-medium">Campaign Sent</p>
                    <p className="text-sm text-muted-foreground">
                      Notify when campaigns are sent successfully
                    </p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 rounded" />
                </label>
              </div>

              <button className="h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-card rounded-lg border p-6 space-y-6">
              <h2 className="text-lg font-semibold">Security Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Current Password</label>
                  <input
                    type="password"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">New Password</label>
                  <input
                    type="password"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>

              <button className="h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                Update Password
              </button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-card rounded-lg border p-6 space-y-6">
              <h2 className="text-lg font-semibold">Appearance</h2>

              <div>
                <label className="block text-sm font-medium mb-3">Theme</label>
                <div className="flex gap-3">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        'flex-1 py-3 px-4 rounded-lg border text-sm font-medium capitalize transition-colors',
                        theme === t
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'hover:bg-accent'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
