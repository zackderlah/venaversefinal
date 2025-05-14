'use client';

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex gap-4 items-center text-sm">
      <button
        onClick={() => onChange('date-desc')}
        className={`px-3 py-1 border-2 transition-colors ${
          value === 'date-desc'
            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
            : 'border-black bg-white hover:bg-gray-50 dark:border-white dark:bg-[#0A0A0A] dark:hover:bg-gray-900'
        }`}
      >
        newest
      </button>
      <button
        onClick={() => onChange('date-asc')}
        className={`px-3 py-1 border-2 transition-colors ${
          value === 'date-asc'
            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
            : 'border-black bg-white hover:bg-gray-50 dark:border-white dark:bg-[#0A0A0A] dark:hover:bg-gray-900'
        }`}
      >
        oldest
      </button>
      <button
        onClick={() => onChange('rating-desc')}
        className={`px-3 py-1 border-2 transition-colors ${
          value === 'rating-desc'
            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
            : 'border-black bg-white hover:bg-gray-50 dark:border-white dark:bg-[#0A0A0A] dark:hover:bg-gray-900'
        }`}
      >
        highest rated
      </button>
      <button
        onClick={() => onChange('rating-asc')}
        className={`px-3 py-1 border-2 transition-colors ${
          value === 'rating-asc'
            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
            : 'border-black bg-white hover:bg-gray-50 dark:border-white dark:bg-[#0A0A0A] dark:hover:bg-gray-900'
        }`}
      >
        lowest rated
      </button>
    </div>
  );
} 