import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DraftCard from '@/components/DraftCard';
import { draftReviewPreview } from '@/lib/draftPreview';

export const dynamic = 'force-dynamic';

export default async function DraftsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login?redirect=/drafts');
  }

  const userId = Number(session.user.id);
  const drafts = await prisma.reviewDraft.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  const cards = drafts.map((d) => ({
    id: d.id,
    title: d.title,
    category: d.category,
    creator: d.creator,
    year: d.year,
    rating: d.rating,
    reviewPreview: draftReviewPreview(d.review || ''),
    imageUrl: d.imageUrl,
    updatedAt: d.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-4xl px-2 sm:px-4 py-6 md:max-w-layout md:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <h1 className="text-2xl md:text-3xl font-black lowercase">drafts</h1>
        <Link
          href="/create-post"
          className="shrink-0 py-2 px-3 text-sm font-bold lowercase border-2 border-black dark:border-white bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          new post
        </Link>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 lowercase mb-6">
        only you can see these — {cards.length} saved
      </p>

      {cards.length === 0 ? (
        <div className="review-card text-center py-12 px-4">
          <p className="text-gray-500 dark:text-gray-400 lowercase mb-4">
            no drafts yet — save from the create post screen anytime
          </p>
          <Link
            href="/create-post"
            className="inline-block py-2 px-4 font-bold lowercase border-2 border-black dark:border-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            create post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {cards.map((draft) => (
            <DraftCard key={draft.id} draft={draft} />
          ))}
        </div>
      )}
    </div>
  );
}
