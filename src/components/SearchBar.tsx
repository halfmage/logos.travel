'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Building2, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchItem {
  type: 'logo' | 'tag';
  title: string;
  url: string;
  id?: string;
}

interface SearchData {
  logos: SearchItem[];
  tags: SearchItem[];
}

export default function SearchBar() {
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search data from window object (set by Base layout)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__SEARCH_DATA__) {
      setSearchData((window as any).__SEARCH_DATA__);
    } else {
      // Fallback to API if window data not available
      fetch('/api/search.json')
        .then(res => res.json())
        .then(data => setSearchData(data))
        .catch(console.error);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter results based on query
  const getFilteredResults = (): SearchItem[] => {
    if (!searchData || !query.trim()) return [];
    
    const lowerQuery = query.toLowerCase().trim();
    const results: SearchItem[] = [];

    // Search logos
    searchData.logos.forEach(logo => {
      if (logo.title.toLowerCase().includes(lowerQuery)) {
        results.push(logo);
      }
    });

    // Search tags
    searchData.tags.forEach(tag => {
      if (tag.title.toLowerCase().includes(lowerQuery)) {
        results.push(tag);
      }
    });

    // Limit results
    return results.slice(0, 8);
  };

  const filteredResults = getFilteredResults();

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredResults.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        // If no dropdown is open, try to navigate to first match
        const firstResult = filteredResults[0];
        if (firstResult) {
          window.location.href = firstResult.url;
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          window.location.href = filteredResults[selectedIndex].url;
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (item: SearchItem) => {
    window.location.href = item.url;
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search companies or tags..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Search companies or tags"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="search-results"
        />
      </div>

      {isOpen && query.trim() && filteredResults.length > 0 && (
        <div 
          id="search-results"
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[300px] overflow-auto"
          role="listbox"
        >
          {filteredResults.map((item, index) => (
            <button
              key={`${item.type}-${item.url}`}
              onClick={() => handleSelect(item)}
              role="option"
              aria-selected={index === selectedIndex}
              className={cn(
                'w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-accent transition-colors',
                index === selectedIndex && 'bg-accent'
              )}
            >
              {item.type === 'logo' ? (
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              ) : (
                <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              )}
              <span className="flex-1 truncate">{item.title}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {item.type === 'logo' ? 'Company' : 'Tag'}
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() && filteredResults.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-4 text-sm text-muted-foreground text-center">
          No results found
        </div>
      )}
    </div>
  );
}

