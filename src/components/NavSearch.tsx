'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const RESULT_LIMIT = 6;

const CATEGORY_LABELS: Record<string, { label: string; dot: string }> = {
  'film-tv': { label: 'film/tv', dot: 'bg-blue-500' },
  film: { label: 'film/tv', dot: 'bg-blue-500' },
  music: { label: 'music', dot: 'bg-purple-500' },
  anime: { label: 'anime', dot: 'bg-red-500' },
  books: { label: 'books', dot: 'bg-green-500' },
  games: { label: 'games', dot: 'bg-cyan-500' },
  other: { label: 'other', dot: 'bg-yellow-500' },
};

interface SearchResult {
  id: number | string;
  title: string;
  category: string;
  creator?: string;
  year?: number | string;
  user?: { username?: string } | null;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Same URL shape as ReviewLink.
function reviewHref(r: SearchResult) {
  return `/reviews/${r.id}-${slugify(r.title)}-by-${slugify(r.user?.username || '')}`;
}

function SearchIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.2-5.2M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
    </svg>
  );
}

interface NavSearchProps {
  inputRef?: React.RefObject<HTMLInputElement>;
  /** Compact pill for the navbar, or a full-width field for the mobile row. */
  variant?: 'compact' | 'full';
  onNavigate?: () => void;
  onEscape?: () => void;
}

export default function NavSearch({ inputRef, variant = 'compact', onNavigate, onEscape }: NavSearchProps) {
  const router = useRouter();
  const listId = useId();
  const containerRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const trimmed = query.trim();

  // Debounced live search; stale requests are aborted.
  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/reviews/search?q=${encodeURIComponent(trimmed)}&limit=${RESULT_LIMIT}`, { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          setResults(data.reviews || []);
          setActive(-1);
          setLoading(false);
        })
        .catch(err => {
          if (err.name !== 'AbortError') setLoading(false);
        });
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const finish = () => {
    setOpen(false);
    setQuery('');
    inputRef?.current?.blur();
    onNavigate?.();
  };

  const goToAll = () => {
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    finish();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && results[active]) {
      router.push(reviewHref(results[active]));
      finish();
    } else {
      goToAll();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(i => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      if (open && trimmed) {
        setOpen(false);
      } else {
        e.currentTarget.blur();
        onEscape?.();
      }
    }
  };

  const showPanel = open && trimmed.length > 0;
  const isFull = variant === 'full';

  return (
    <form ref={containerRef} onSubmit={handleSubmit} role="search" className={`relative ${isFull ? 'flex-1' : ''}`}>
      <label
        className={`flex items-center gap-2 rounded-full border bg-vv-surface text-vv-faint transition-colors focus-within:border-vv-strong hover:border-vv-strong ${
          isFull ? 'h-10 px-4' : 'h-8 pl-3 pr-3 text-[13px]'
        } ${showPanel ? 'border-vv-strong' : 'border-vv-line'}`}
      >
        <SearchIcon className={isFull ? 'h-4 w-4 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={isFull ? 'search reviews' : 'search'}
          aria-label="search reviews"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          className={`bg-transparent lowercase text-vv-fg placeholder:text-vv-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden ${
            isFull ? 'w-full text-[16px]' : 'w-28'
          }`}
        />
      </label>

      {showPanel && (
        <div
          className={`vv-panel absolute z-50 mt-2 overflow-hidden p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)] ${
            isFull ? 'left-0 right-0' : 'right-0 w-[22rem]'
          }`}
        >
          <ul id={listId} role="listbox" aria-label="search results">
            {results.map((r, i) => {
              const cat = CATEGORY_LABELS[r.category] ?? { label: r.category, dot: 'bg-gray-500' };
              const meta = [r.creator, r.year].filter(Boolean).join(', ');
              return (
                <li key={r.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={reviewHref(r)}
                    onClick={finish}
                    onMouseEnter={() => setActive(i)}
                    className={`block rounded-xl px-3.5 py-2.5 transition-colors ${i === active ? 'bg-vv-raised' : ''}`}
                  >
                    <span className="vv-eyebrow flex items-center gap-1.5 !text-[10px]">
                      <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} aria-hidden="true" />
                      {cat.label}
                    </span>
                    <span className="mt-1 block truncate text-[14px] font-medium text-vv-fg">{r.title}</span>
                    <span className="mt-0.5 block truncate text-[13px] text-vv-muted">
                      {meta}
                      {r.user?.username ? <span className="text-vv-faint"> · by {r.user.username}</span> : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {results.length === 0 && (
            <p className="px-3.5 py-3 text-[13px] lowercase text-vv-faint">
              {loading ? 'searching…' : `no reviews match “${trimmed}”`}
            </p>
          )}

          {results.length > 0 && (
            <button
              type="button"
              onClick={goToAll}
              className="mt-1 flex w-full items-center justify-between rounded-xl border-t border-vv-line px-3.5 py-2.5 text-left text-[13px] lowercase text-vv-muted transition-colors hover:bg-vv-raised hover:text-vv-fg"
            >
              <span className="truncate">see all results for “{trimmed}”</span>
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      )}
    </form>
  );
}
