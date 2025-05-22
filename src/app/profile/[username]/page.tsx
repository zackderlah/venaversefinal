import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileHeaderClient from "@/components/ProfileHeaderClient";
import ReviewCardDisplay from "@/components/ReviewCardDisplay";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProfileCommentSection from '@/components/ProfileCommentSection';
import CurrentlyExperiencingSection from '@/components/CurrentlyExperiencingSection';

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  const { username } = params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      reviews: {
        orderBy: { date: 'desc' },
        include: {
          user: { select: { id: true, username: true, profileImage: true } },
          _count: { select: { comments: true } },
        },
      },
      currentlyExperiencing: {
        orderBy: { updatedAt: 'desc' },
      },
    },
  });
  if (!user) return notFound();

  // Fetch recent review comments made by the user
  const recentReviewComments = await prisma.comment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      review: { select: { id: true, title: true, category: true, user: { select: { username: true, profileImage: true } } } }
    },
    take: 10,
  });

  const isOwner = Number(session?.user?.id) === user.id;

  // Combine reviews and comments into a single feed, sorted by date
  const reviewFeed = user.reviews.map(r => ({
    type: 'review',
    id: r.id,
    date: r.date,
    review: r,
  }));
  const commentFeed = recentReviewComments.map(c => ({
    type: 'comment',
    id: c.id,
    date: c.createdAt,
    comment: c,
  }));
  const activityFeed = [...reviewFeed, ...commentFeed].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <ProfileHeaderClient user={user} session={session} isOwner={isOwner} />

      {/* Currently Experiencing */}
      <div className="review-card">
        <h2 className="text-2xl font-black tracking-tight lowercase mb-2">currently experiencing</h2>
        {user ? (
          <CurrentlyExperiencingSection profileId={user.id} />
        ) : (
          <div className="text-gray-400 lowercase">user not found</div>
        )}
      </div>

      {/* Profile Comments */}
      <div className="review-card">
        <h2 className="text-2xl font-black tracking-tight lowercase mb-2">profile comments</h2>
        <ProfileCommentSection profileId={user.id} />
      </div>

      {/* Recent Activity */}
      <div className="review-card">
        <h2 className="text-2xl font-black tracking-tight lowercase mb-2">recent activity</h2>
        <div className="grid gap-6">
          {activityFeed.length ? (
            activityFeed.map(item => (
              'review' in item ? (
                <Link key={`review-${item.id}`} href={`/reviews/${item.review.id}`} className="block">
                <ReviewCardDisplay
                  review={{
                      ...item.review,
                      commentCount: item.review._count?.comments ?? 0,
                      category: item.review.category as import("@/types/review").ReviewCategory,
                      date: item.review.date.toISOString(),
                      imageUrl: item.review.imageUrl ?? undefined,
                  }}
                />
              </Link>
              ) : 'comment' in item ? (
                <div key={`comment-${item.id}`} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="text-blue-600 font-bold lowercase">commented</span>
                      <span>on</span>
                      <Link href={`/reviews/${item.comment.review.id}`} className="underline hover:text-blue-600 font-bold">
                        {item.comment.review.title.charAt(0).toUpperCase() + item.comment.review.title.slice(1)}
                      </Link>
                      {item.comment.review.user && (
                        <span className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">by</span>
                          <Link href={`/profile/${item.comment.review.user.username}`} className="flex items-center gap-1">
                            <img
                              src={item.comment.review.user.profileImage || '/default-profile.png'}
                              alt={item.comment.review.user.username}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span className="text-xs text-gray-500">{item.comment.review.user.username}</span>
                          </Link>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 ml-auto">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-200 text-sm lowercase ml-2">{item.comment.text}</div>
                </div>
              ) : null
            ))
          ) : (
            <p className="text-gray-400 lowercase">no recent activity</p>
          )}
        </div>
        <div className="mt-4 text-right">
          {/* Removed 'view all reviews' link */}
        </div>
      </div>
    </div>
  );
} 