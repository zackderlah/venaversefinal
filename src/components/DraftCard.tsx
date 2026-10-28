'use client';

import Link from 'next/link';
import DraftDeleteButton from '@/components/DraftDeleteButton';
import StarRatingDisplay from '@/components/StarRatingDisplay';
import { isValidFiveStarRating } from '@/lib/starRating';

export type DraftCardData = {
  id: number;
  title: string;
  category: string;
  creator: string;
  year: string;
  rating: string;
  reviewPreview: string;
  imageUrl: string | null;
  updatedAt: string;
};

export default function DraftCard({ draft }: { draft: DraftCardData }) {
  const title = draft.title.trim() || 'untitled draft';
  const updated = new Date(draft.updatedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="review-card review-card-item flex flex-col h-full overflow-hidden p-0 !gap-0">
      <Link
        href={`/create-post?draft=${draft.id}`}
        className="flex flex-col flex-1 min-h-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-[#0A0A0A]"
      >
        <div className="relative w-full aspect-[3/4] bg-vv-raised shrink-0">
          {draft.imageUrl ? (
            <img src={draft.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs lowercase px-2 text-center">
              no cover
            </div>
          )}
        </div>
        <div className="p-3 md:p-4 flex flex-col flex-1 min-h-0 border-t border-vv-line">
          <h2 className="line-clamp-2 text-sm font-semibold leading-tight lowercase text-vv-fg md:text-base">{title}</h2>
          <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 lowercase mt-1 truncate">
            {draft.category}
            {draft.creator ? ` · ${draft.creator}` : ''}
            {draft.year ? ` · ${draft.year}` : ''}
            {draft.rating.trim() !== '' ? (
              <>
                {' · '}
                {isValidFiveStarRating(parseFloat(draft.rating)) ? (
                  <StarRatingDisplay
                    value={parseFloat(draft.rating)}
                    className="inline-flex align-middle"
                    starClassName="text-[10px] md:text-xs"
                  />
                ) : (
                  draft.rating
                )}
              </>
            ) : null}
          </p>
          {draft.reviewPreview ? (
            <p className="text-[11px] md:text-xs text-gray-600 dark:text-gray-300 lowercase mt-2 line-clamp-3 flex-1">
              {draft.reviewPreview}
            </p>
          ) : null}
          <time
            dateTime={draft.updatedAt}
            className="text-[10px] md:text-xs text-gray-400 mt-2 lowercase"
          >
            updated {updated}
          </time>
        </div>
      </Link>
      <div className="flex justify-end px-3 py-2 border-t border-vv-line">
        <DraftDeleteButton draftId={draft.id} />
      </div>
    </article>
  );
}
