'use client';

import StarRatingDisplay from '@/components/StarRatingDisplay';
import {
  formatStarRatingString,
  isValidFiveStarRating,
  normalizeRatingFromStorage,
} from '@/lib/starRating';

const STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

type StarRatingInputProps = {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export default function StarRatingInput({ id = 'rating', value, onChange, disabled }: StarRatingInputProps) {
  const parsed = parseFloat(value);
  const display = Number.isFinite(parsed) ? normalizeRatingFromStorage(parsed) : 0;

  return (
    <div className="mt-1">
      <div className="relative inline-flex items-center" id={id}>
        <StarRatingDisplay value={display} starClassName="text-2xl md:text-3xl" />
        <div className="absolute inset-0 flex" role="group" aria-label="choose star rating">
          {STEPS.map((step) => (
            <button
              key={step}
              type="button"
              disabled={disabled}
              className="h-full min-h-[2.75rem] flex-1 cursor-pointer opacity-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed"
              aria-label={`${step} out of 5 stars`}
              onClick={() => onChange(formatStarRatingString(step))}
            />
          ))}
        </div>
      </div>
      {Number.isFinite(parsed) && isValidFiveStarRating(display) ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 lowercase" aria-live="polite">
          {formatStarRatingString(display)} / 5
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 lowercase">tap a star (halves count)</p>
      )}
    </div>
  );
}
