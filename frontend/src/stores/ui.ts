import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  selectedClientIds: string[];
  setSelectedClientIds: (ids: string[]) => void;
  toggleClientSelection: (id: string) => void;
  clearClientSelection: () => void;

  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      selectedClientIds: [],
      setSelectedClientIds: (ids) => set({ selectedClientIds: ids }),
      toggleClientSelection: (id) =>
        set((state) => ({
          selectedClientIds: state.selectedClientIds.includes(id)
            ? state.selectedClientIds.filter((cid) => cid !== id)
            : [...state.selectedClientIds, id],
        })),
      clearClientSelection: () => set({ selectedClientIds: [] }),

      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
