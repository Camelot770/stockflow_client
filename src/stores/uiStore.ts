import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  theme: 'dark' | 'light';
  commandMenuOpen: boolean;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleCommandMenu: () => void;
  setCommandMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
  commandMenuOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    set({ theme });
  },

  toggleCommandMenu: () => set((s) => ({ commandMenuOpen: !s.commandMenuOpen })),

  setCommandMenuOpen: (commandMenuOpen) => set({ commandMenuOpen }),
}));
