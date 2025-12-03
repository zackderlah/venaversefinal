import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewCardDisplay from "@/components/ReviewCardDisplay";
import Link from "next/link";
import ProfileHeaderClient from "@/components/ProfileHeaderClient";
import ProfileCommentSection from '@/components/ProfileCommentSection';
import CurrentlyExperiencingSection from '@/components/CurrentlyExperiencingSection';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
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

  console.log('ProfilePage user:', user);
  console.log('ProfilePage session:', session);

  if (!user) return notFound();

  // Fetch recent review comments made by the user
  const recentReviewComments = await prisma.comment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      review: { 
        select: { 
          id: true, 
          title: true, 
          category: true,
          user: { select: { username: true, profileImage: true } }
        } 
      }
    },
    take: 10,
  });

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
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8 space-y-4 md:space-y-8">
      {/* Profile Header */}
      <ProfileHeaderClient user={user} session={session} isOwner={true} />

      {/* Currently Experiencing */}
      <div className="review-card">
        <h2 className="text-xl md:text-2xl font-black tracking-tight lowercase mb-2">currently experiencing</h2>
        <CurrentlyExperiencingSection profileId={user.id} />
      </div>

      {/* Profile Comments */}
      <div className="review-card">
        <h2 className="text-xl md:text-2xl font-black tracking-tight lowercase mb-2">profile comments</h2>
        <ProfileCommentSection profileId={user.id} />
      </div>

      {/* Recent Activity */}
      <div className="review-card overflow-hidden">
        <h2 className="text-xl md:text-2xl font-black tracking-tight lowercase mb-2">recent activity</h2>
        <div className="grid gap-2 md:gap-6 w-full">
          {activityFeed.length ? (
            activityFeed.map(item => (
              'review' in item ? (
                <Link key={`review-${item.id}`} href={`/reviews/${item.review.id}`} className="block w-full overflow-hidden">
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
                <div key={`comment-${item.id}`} className="border-b border-gray-200 dark:border-gray-700 pb-2 md:pb-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0 mb-1">
                    <div className="flex flex-wrap items-center gap-1 text-[10px] md:text-xs text-gray-500">
                      <span className="text-blue-600 font-bold lowercase">commented</span>
                      <span>on</span>
                      <Link href={`/reviews/${item.comment.review.id}`} className="underline hover:text-blue-600 font-bold truncate max-w-[120px] md:max-w-none">
                        {item.comment.review.title.charAt(0).toUpperCase() + item.comment.review.title.slice(1)}
                      </Link>
                      {item.comment.review.user && (
                        <span className="flex items-center gap-1">
                          <span className="text-[10px] md:text-xs text-gray-500">by</span>
                          <Link href={`/profile/${item.comment.review.user.username}`} className="flex items-center gap-1">
                            <img
                              src={item.comment.review.user.profileImage || '/default-profile.png'}
                              alt={item.comment.review.user.username}
                              className="w-3 h-3 md:w-4 md:h-4 rounded-full object-cover"
                            />
                            <span className="text-[10px] md:text-xs text-gray-500">{item.comment.review.user.username}</span>
                          </Link>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] md:text-xs text-gray-400">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-200 text-xs md:text-sm lowercase ml-0 md:ml-2 max-h-[2.5em] md:max-h-none overflow-hidden md:overflow-visible">{item.comment.text}</div>
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