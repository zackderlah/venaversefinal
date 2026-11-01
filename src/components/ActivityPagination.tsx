import Link from 'next/link';

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '…', total];
  if (current >= total - 2) return [1, '…', total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

/** Server-rendered page links; the page lives in `?activity=` and the hash keeps the scroll position. */
export default function ActivityPagination({
  current,
  total,
  basePath,
}: {
  current: number;
  total: number;
  basePath: string;
}) {
  if (total <= 1) return null;
  const href = (page: number) => `${basePath}?activity=${page}#recent-activity`;

  return (
    <nav className="mt-6 flex items-center justify-center gap-1" aria-label="activity pages">
      {current > 1 ? (
        <Link href={href(current - 1)} className="vv-icon-btn" aria-label="previous page">←</Link>
      ) : (
        <span className="vv-icon-btn opacity-40" aria-hidden="true">←</span>
      )}
      {pageNumbers(current, total).map((page, i) =>
        page === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-vv-faint">…</span>
        ) : (
          <Link
            key={page}
            href={href(page)}
           
            className="vv-pill min-w-[32px] justify-center"
            aria-current={page === current ? 'page' : undefined}
          >
            {page}
          </Link>
        ),
      )}
      {current < total ? (
        <Link href={href(current + 1)} className="vv-icon-btn" aria-label="next page">→</Link>
      ) : (
        <span className="vv-icon-btn opacity-40" aria-hidden="true">→</span>
      )}
    </nav>
  );
}
