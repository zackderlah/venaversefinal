import { useId } from 'react';
import { normalizeRatingFromStorage } from '@/lib/starRating';

/** Material-style 24×24 star; symmetric in viewBox for left-fraction clipping. */
const STAR_PATH =
  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

type StarRatingDisplayProps = {
  value: number;
  className?: string;
  starClassName?: string;
};

export default function StarRatingDisplay({
  value,
  className = '',
  starClassName = 'text-xl md:text-2xl',
}: StarRatingDisplayProps) {
  const v = normalizeRatingFromStorage(Number(value) || 0);
  const idBase = useId().replace(/:/g, '');

  return (
    <span
      className={`inline-flex items-center gap-0.5 leading-none ${className}`.trim()}
      role="img"
      aria-label={`${v} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, v - i));
        const clipW = 24 * fill;
        const gid = `${idBase}-g-${i}`;
        const cid = `${idBase}-c-${i}`;

        return (
          <span
            key={i}
            className={`relative inline-block shrink-0 font-black leading-none ${starClassName}`.trim()}
            aria-hidden
          >
            <svg
              viewBox="0 0 24 24"
              className="block h-[1em] w-[1em] overflow-visible"
              focusable="false"
            >
              <defs>
                <linearGradient id={gid} x1="0" y1="12" x2="24" y2="12" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="22%" stopColor="#a78bfa" />
                  <stop offset="44%" stopColor="#f472b6" />
                  <stop offset="66%" stopColor="#34d399" />
                  <stop offset="88%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
                <clipPath id={cid}>
                  <rect x="0" y="0" width={clipW} height="24" />
                </clipPath>
              </defs>
              <path
                d={STAR_PATH}
                className="fill-gray-400/20 dark:fill-gray-500/15"
              />
              {fill > 0 ? (
                <path d={STAR_PATH} fill={`url(#${gid})`} clipPath={`url(#${cid})`} />
              ) : null}
            </svg>
          </span>
        );
      })}
    </span>
  );
}
