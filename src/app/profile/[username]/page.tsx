import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileHeaderClient from "@/components/ProfileHeaderClient";
import ReviewCardDisplay from "@/components/ReviewCardDisplay";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  const { username } = params;
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      reviews: {
        orderBy: { date: 'desc' },
        include: { user: { select: { id: true, username: true, profileImage: true } } },
      },
    },
  });
  if (!user) return notFound();

  let favoriteReview = null;
  if (user.favoriteReviewId) {
    favoriteReview = await prisma.review.findUnique({
      where: { id: user.favoriteReviewId },
      include: { user: { select: { id: true, username: true, profileImage: true } } },
    });
  }

  const isOwner = session?.user?.name === user.username;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <ProfileHeaderClient user={user} session={session} isOwner={isOwner} />

      {/* Favorite Review */}
      <div className="review-card">
        <h2 className="text-2xl font-black tracking-tight lowercase mb-2">favorite review</h2>
        {favoriteReview ? (
          <ReviewCardDisplay review={{
            ...favoriteReview,
            category: favoriteReview.category as import("@/types/review").ReviewCategory,
            date: favoriteReview.date.toISOString(),
            imageUrl: favoriteReview.imageUrl ?? undefined,
          }} />
        ) : (
          <p className="text-gray-400 lowercase">no favorite review selected yet</p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="review-card">
        <h2 className="text-2xl font-black tracking-tight lowercase mb-2">recent activity</h2>
        <div className="grid gap-6">
          {user.reviews.length ? (
            user.reviews.map((review: any) => (
              <ReviewCardDisplay
                key={review.id}
                review={{
                  ...review,
                  category: review.category as import("@/types/review").ReviewCategory,
                  date: review.date.toISOString(),
                  imageUrl: review.imageUrl ?? undefined,
                }}
              />
            ))
          ) : (
            <p className="text-gray-400 lowercase">no recent reviews</p>
          )}
        </div>
        <div className="mt-4 text-right">
          <Link href="/reviews" className="text-xs font-bold underline text-blue-600 dark:text-blue-400 lowercase">view all reviews</Link>
        </div>
      </div>
    </div>
  );
} 