import { notFound } from 'next/navigation';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

interface ReviewPageProps {
  params: { id: string };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const reviewId = parseInt(params.id);
  if (isNaN(reviewId)) return notFound();

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { user: { select: { username: true, id: true } } },
  });

  if (!review) return notFound();

  return (
    <div className="max-w-xl mx-auto mt-16 border-2 border-black dark:border-white p-8 bg-white dark:bg-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h1 className="text-3xl font-black mb-2 lowercase">{review.title}</h1>
      <div className="mb-4 text-gray-500 text-sm">
        {review.creator}, {review.year}
        {review.user?.username && (
          <span className="ml-2 text-xs text-black dark:text-white font-bold lowercase">
            by @{review.user.username}
          </span>
        )}
      </div>
      <div className="mb-4">
        <span className="rating text-2xl font-black">{review.rating}/10</span>
      </div>
      <div className="mb-6 text-gray-600 dark:text-gray-300">
        {review.review}
      </div>
      <div className="review-date text-sm text-gray-500 dark:text-gray-400">
        Reviewed on {new Date(review.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
    </div>
  );
} 