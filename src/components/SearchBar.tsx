'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Enable the global "/" shortcut to focus this input. */
  shortcut?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search games…',
  className,
  shortcut = false,
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el as HTMLElement | null)?.isContentEditable;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shortcut]);

  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search games"
        className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-20 text-base text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          shortcut && (
            <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-xs text-muted-foreground sm:inline-block">
              /
            </kbd>
          )
        )}
      </div>
    </div>
  );
}
