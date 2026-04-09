import Link from 'next/link';
import DraftDeleteButton from '@/components/DraftDeleteButton';

export type ProfileDraftSummary = {
  id: number;
  title: string;
  category: string;
  updatedAt: Date;
};

export default function ProfileDraftsSection({ drafts }: { drafts: ProfileDraftSummary[] }) {
  if (!drafts.length) return null;

  return (
    <div className="review-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <h2 className="text-xl md:text-2xl font-black tracking-tight lowercase">draft posts</h2>
        <Link
          href="/drafts"
          className="text-xs md:text-sm font-bold lowercase text-blue-600 dark:text-blue-400 hover:underline shrink-0"
        >
          grid view
        </Link>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 lowercase mb-3">only you can see these</p>
      <ul className="space-y-2">
        {drafts.map((d) => (
          <li
            key={d.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0"
          >
            <Link
              href={`/create-post?draft=${d.id}`}
              className="font-bold lowercase text-blue-600 dark:text-blue-400 hover:underline truncate"
            >
              {d.title.trim() || 'untitled draft'}
              <span className="font-normal text-gray-500 dark:text-gray-400 ml-2">· {d.category}</span>
            </Link>
            <div className="flex items-center gap-3 text-[10px] md:text-xs text-gray-400 shrink-0">
              <span>
                {new Date(d.updatedAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <DraftDeleteButton draftId={d.id} />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <Link
          href="/create-post"
          className="text-sm lowercase text-gray-600 dark:text-gray-300 underline hover:text-blue-600 dark:hover:text-blue-400"
        >
          create new post
        </Link>
      </div>
    </div>
  );
}
