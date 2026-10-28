'use client';

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const OPTIONS = [
  { value: 'date-desc', label: 'newest' },
  { value: 'date-asc', label: 'oldest' },
  { value: 'rating-desc', label: 'highest rated' },
  { value: 'rating-asc', label: 'lowest rated' },
];

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label="sort reviews">
      {OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className="vv-pill"
          aria-current={value === option.value ? 'page' : undefined}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
