import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Users, Handshake, ShoppingCart, ClipboardList,
  Truck, Search, Clock, X,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUIStore } from '@/stores/uiStore';
import { searchApi, type SearchResult } from '@/api/search';
import { cn } from '@/lib/utils';

const RECENT_SEARCHES_KEY = 'stockflow_recent_searches';
const MAX_RECENT = 5;

const categoryConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  products: { label: 'Товары', icon: <Package className="h-4 w-4" /> },
  customers: { label: 'Клиенты', icon: <Users className="h-4 w-4" /> },
  deals: { label: 'Сделки', icon: <Handshake className="h-4 w-4" /> },
  tasks: { label: 'Задачи', icon: <ClipboardList className="h-4 w-4" /> },
  suppliers: { label: 'Поставщики', icon: <Truck className="h-4 w-4" /> },
  orders: { label: 'Заказы', icon: <ShoppingCart className="h-4 w-4" /> },
};

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function CommandMenu() {
  const { commandMenuOpen, setCommandMenuOpen } = useUIStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Keyboard shortcut to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandMenuOpen(!commandMenuOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [commandMenuOpen, setCommandMenuOpen]);

  // Load recent searches when opened
  useEffect(() => {
    if (commandMenuOpen) {
      setRecentSearches(getRecentSearches());
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandMenuOpen]);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchApi.globalSearch(searchQuery.trim());
      const data = Array.isArray(response) ? response : response?.results || [];
      setResults(data);
      setSelectedIndex(0);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  // Group results by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Flat list for keyboard navigation
  const flatResults = Object.values(grouped).flat();

  const handleSelect = (result: SearchResult) => {
    saveRecentSearch(query);
    setCommandMenuOpen(false);
    navigate(result.link);
  };

  const handleRecentClick = (search: string) => {
    setQuery(search);
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        handleSelect(flatResults[selectedIndex]);
      }
    }
  };

  return (
    <Dialog open={commandMenuOpen} onOpenChange={setCommandMenuOpen}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center border-b border-border px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Поиск по товарам, клиентам, сделкам..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                Поиск...
              </div>
            )}

            {/* No results */}
            {!isLoading && query.trim() && flatResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                Нет результатов
              </div>
            )}

            {/* Results grouped by category */}
            {!isLoading && Object.entries(grouped).map(([category, items]) => {
              const config = categoryConfig[category] || { label: category, icon: <Package className="h-4 w-4" /> };
              return (
                <div key={category} className="mb-2">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {config.label}
                  </div>
                  {items.map((item) => {
                    const globalIdx = flatResults.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-md px-2 py-2 text-sm text-left transition-colors',
                          globalIdx === selectedIndex
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/50'
                        )}
                      >
                        <span className="shrink-0 text-muted-foreground">{config.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {/* Recent searches (when no query) */}
            {!query.trim() && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Недавние поиски
                  </span>
                  <button
                    onClick={clearRecent}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Очистить
                  </button>
                </div>
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleRecentClick(search)}
                    className="w-full flex items-center gap-3 rounded-md px-2 py-2 text-sm text-left hover:bg-accent/50"
                  >
                    <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state when no query and no recent searches */}
            {!query.trim() && recentSearches.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <p>Начните вводить для поиска</p>
                <p className="text-xs mt-1">Товары, клиенты, сделки, задачи...</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer with keyboard hints */}
        <div className="flex items-center gap-4 border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">↑↓</kbd>
            навигация
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">Enter</kbd>
            открыть
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px]">Esc</kbd>
            закрыть
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
