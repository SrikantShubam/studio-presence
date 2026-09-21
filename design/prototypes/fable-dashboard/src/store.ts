import { useState, useCallback, useEffect } from 'react';
import { type Lead, leads as initialLeads } from './data';

type Theme = 'light' | 'dark' | 'system';
type Page = 'overview' | 'leads' | 'calculator' | 'qrcard' | 'analytics' | 'settings';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  theme: Theme;
  page: Page;
  leads: Lead[];
  selectedLead: Lead | null;
  drawerOpen: boolean;
  mobileMenuOpen: boolean;
  searchQuery: string;
  statusFilter: string;
  cityFilter: string | null;
  addLeadModalOpen: boolean;
  toasts: Toast[];
  sidebarCollapsed: boolean;
}

const initialState: AppState = {
  theme: 'light',
  page: 'overview',
  leads: initialLeads,
  selectedLead: null,
  drawerOpen: false,
  mobileMenuOpen: false,
  searchQuery: '',
  statusFilter: 'all',
  cityFilter: null,
  addLeadModalOpen: false,
  toasts: [],
  sidebarCollapsed: false,
};

// Global state singleton
let state = { ...initialState };
let listeners: Array<() => void> = [];

const notify = () => {
  listeners.forEach((listener) => listener());
};

export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    state = { ...state, theme };
    applyTheme(theme);
    notify();
  }, []);

  const setPage = useCallback((page: Page) => {
    state = { ...state, page, mobileMenuOpen: false };
    notify();
  }, []);

  const setSelectedLead = useCallback((lead: Lead | null) => {
    state = { ...state, selectedLead: lead, drawerOpen: lead !== null };
    notify();
  }, []);

  const closeDrawer = useCallback(() => {
    state = { ...state, selectedLead: null, drawerOpen: false };
    notify();
  }, []);

  const toggleMobileMenu = useCallback(() => {
    state = { ...state, mobileMenuOpen: !state.mobileMenuOpen };
    notify();
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    state = { ...state, searchQuery: query };
    notify();
  }, []);

  const setStatusFilter = useCallback((filter: string) => {
    state = { ...state, statusFilter: filter };
    notify();
  }, []);

  const setCityFilter = useCallback((city: string | null) => {
    state = { ...state, cityFilter: city };
    notify();
  }, []);

  const setAddLeadModalOpen = useCallback((open: boolean) => {
    state = { ...state, addLeadModalOpen: open };
    notify();
  }, []);

  const toggleSidebar = useCallback(() => {
    state = { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    notify();
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    state = {
      ...state,
      leads: state.leads.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      selectedLead: state.selectedLead?.id === id
        ? { ...state.selectedLead, ...updates }
        : state.selectedLead,
    };
    notify();
  }, []);

  const addLead = useCallback((lead: Omit<Lead, 'id'>) => {
    const newLead: Lead = {
      ...lead,
      id: String(Date.now()),
    };
    state = { ...state, leads: [newLead, ...state.leads], addLeadModalOpen: false };
    showToast('Lead added successfully', 'success');
    notify();
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = String(Date.now());
    state = { ...state, toasts: [...state.toasts, { id, message, type }] };
    notify();
    setTimeout(() => {
      state = { ...state, toasts: state.toasts.filter((t) => t.id !== id) };
      notify();
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    state = { ...state, toasts: state.toasts.filter((t) => t.id !== id) };
    notify();
  }, []);

  const getFilteredLeads = useCallback(() => {
    let filtered = state.leads;

    if (state.statusFilter !== 'all') {
      filtered = filtered.filter((l) => l.status === state.statusFilter);
    }

    if (state.cityFilter) {
      filtered = filtered.filter((l) =>
        l.city.toLowerCase().includes(state.cityFilter!.toLowerCase())
      );
    }

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.locality.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.projectType.toLowerCase().includes(q) ||
          l.notes.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, []);

  return {
    ...state,
    setTheme,
    setPage,
    setSelectedLead,
    closeDrawer,
    toggleMobileMenu,
    setSearchQuery,
    setStatusFilter,
    setCityFilter,
    setAddLeadModalOpen,
    toggleSidebar,
    updateLead,
    addLead,
    addToast,
    removeToast,
    getFilteredLeads,
  };
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

export function showToast(message: string, type: Toast['type'] = 'info') {
  const id = String(Date.now());
  state = { ...state, toasts: [...state.toasts, { id, message, type }] };
  notify();
  setTimeout(() => {
    state = { ...state, toasts: state.toasts.filter((t) => t.id !== id) };
    notify();
  }, 3000);
}