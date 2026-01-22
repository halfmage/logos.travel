import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTag } from '@/utils/tags';

interface TagWithCount {
  tag: string;
  count: number;
  url: string;
}

interface MobileMenuProps {
  tags: TagWithCount[];
  totalLogos: number;
}

export default function MobileMenu({ tags, totalLogos }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(73);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get header height dynamically
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="md:hidden relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20"
          style={{ top: `${headerHeight}px` }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menu */}
      <div
        className={cn(
          'fixed left-0 right-0 bg-popover border-b border-border shadow-lg z-30 transition-all duration-300 ease-in-out overflow-y-auto',
          isOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-full max-h-0 pointer-events-none'
        )}
        style={{ 
          top: `${headerHeight}px`,
          maxHeight: isOpen ? `calc(100vh - ${headerHeight}px)` : '0'
        }}
      >
        <nav className="max-w-5xl mx-auto px-4 py-4">
          <ul className="flex flex-col gap-2">
            <li>
              <a
                href="/"
                className="block px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/logos/"
                className="block px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Logos
              </a>
            </li>
            <li>
              <div className="px-4 py-3">
                <div className="text-sm font-medium text-muted-foreground mb-2">Tags</div>
                <div className="space-y-1">
                  <a
                    href="/tags/"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors flex items-center justify-between"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>All</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                      {totalLogos}
                    </span>
                  </a>
                  {tags.map(({ tag, count, url }) => (
                    <a
                      key={tag}
                      href={url}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors flex items-center justify-between"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="truncate">{formatTag(tag)}</span>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded ml-2 flex-shrink-0">
                        {count}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

