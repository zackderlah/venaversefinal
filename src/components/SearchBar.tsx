'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface SearchBarProps {
  onClose?: () => void;
  isMobile?: boolean;
  // For local filtering (controlled input)
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ 
  onClose, 
  isMobile = false,
  value: controlledValue,
  onChange,
  placeholder = 'search reviews...'
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
  
  // Use controlled value if provided, otherwise use internal state
  const isControlled = controlledValue !== undefined && onChange !== undefined;
  const displayValue = isControlled ? controlledValue : query;

  useEffect(() => {
    if (isMobile && isFocused) {
      inputRef.current?.focus();
    }
  }, [isMobile, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isControlled) {
      onChange!(newValue);
    } else {
      setQuery(newValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only navigate to search page if not controlled (local filtering)
    if (!isControlled && displayValue.trim()) {
      if (isNative) {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      }
      router.push(`/search?q=${encodeURIComponent(displayValue.trim())}`);
      if (onClose) onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="vv-input w-full !rounded-full px-4 py-2 pr-10 text-sm lowercase"
        />
        {!isControlled && (
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-vv-faint hover:text-vv-fg"
            aria-label="Search"
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        )}
      </div>
    </form>
  );
}
