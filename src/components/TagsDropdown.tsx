import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagWithCount {
  tag: string;
  count: number;
  url: string;
}

interface TagsDropdownProps {
  tags: TagWithCount[];
  totalLogos: number;
}

export default function TagsDropdown({ tags, totalLogos }: TagsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        Tags
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-md shadow-lg max-h-[400px] overflow-hidden z-50"
          onMouseLeave={() => setIsOpen(false)}
          role="menu"
        >
          <div className="py-1">
            <a
              href="/tags/"
              className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center justify-between"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              <span>All</span>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                {totalLogos}
              </span>
            </a>
            <div className="border-t border-border my-1" />
            {tags.map(({ tag, count, url }) => (
              <a
                key={tag}
                href={url}
                className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center justify-between"
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                <span className="truncate">{tag}</span>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded ml-2 flex-shrink-0">
                  {count}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

