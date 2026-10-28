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
        <h2 className="text-xl font-semibold tracking-tight lowercase">draft posts</h2>
        <Link
          href="/drafts"
          className="vv-btn shrink-0"
        >
          grid view
        </Link>
      </div>
      <p className="vv-eyebrow mb-4">only you can see these</p>
      <ul className="space-y-2">
        {drafts.map((d) => (
          <li
            key={d.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-vv-line pb-2 last:border-0 last:pb-0"
          >
            <Link
              href={`/create-post?draft=${d.id}`}
              className="truncate font-medium lowercase text-vv-fg hover:opacity-70"
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
          className="vv-btn"
        >
          create new post
        </Link>
      </div>
    </div>
  );
}
