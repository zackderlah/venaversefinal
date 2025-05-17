import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewCardDisplay from "@/components/ReviewCardDisplay";
import Link from "next/link";
import ProfileHeaderClient from "@/components/ProfileHeaderClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    include: {
      reviews: {
        take: 5,
        orderBy: { date: 'desc' },
        include: { user: true },
      },
    },
  });

  console.log('ProfilePage user:', user);
  console.log('ProfilePage session:', session);

  let favoriteReview = null;
  if (user?.favoriteReviewId) {
    favoriteReview = await prisma.review.findUnique({
      where: { id: user.favoriteReviewId },
      include: { user: true },
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <ProfileHeaderClient user={user} session={session} />

      {/* Favorite Review */}
      <div className="review-card">
        <h2 className="text-2xl font-black tracking-tight lowercase mb-2">favorite review</h2>
        {favoriteReview ? (
          <ReviewCardDisplay review={{
            ...favoriteReview,
            category: favoriteReview.category,
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
          {user?.reviews.length ? (
            user.reviews.map((review: any) => (
              <ReviewCardDisplay
                key={review.id}
                review={{
                  ...review,
                  category: review.category,
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