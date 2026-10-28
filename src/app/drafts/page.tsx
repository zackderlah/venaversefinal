import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DraftCard from '@/components/DraftCard';
import PageHeader from '@/components/PageHeader';
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
    <div>
      <PageHeader
        title="drafts"
        subtitle="only you can see these."
        description={`${cards.length} saved`}
        actions={<Link href="/create-post" className="vv-btn vv-btn-solid">new post</Link>}
      />

      {cards.length === 0 ? (
        <div className="vv-panel px-4 py-12 text-center">
          <p className="mb-6 text-vv-faint lowercase">
            no drafts yet — save from the create post screen anytime
          </p>
          <Link
            href="/create-post"
            className="vv-btn"
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
