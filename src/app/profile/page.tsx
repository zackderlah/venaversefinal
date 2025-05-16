import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import { prisma } from "@/lib/prisma";
import ReviewCardDisplay from "@/components/ReviewCardDisplay";
import Link from "next/link";

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
      <div className="review-card flex flex-col md:flex-row items-center gap-8 mb-4">
        <ProfileImageUpload />
        <div className="flex-1 w-full">
          <h1 className="text-4xl font-black tracking-tight lowercase mb-2">{session.user?.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-300 text-sm mb-2 lowercase">
            <span>member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</span>
            <span>•</span>
            <span>{user?.reviews.length || 0} reviews</span>
          </div>
          <div className="text-gray-600 dark:text-gray-300 text-base lowercase">{session.user?.email}</div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="review-card">
        <h2 className="text-2xl font-black tracking-tight lowercase mb-2">about</h2>
        <p className="text-gray-600 dark:text-gray-300 text-base lowercase">
          {user?.bio || "no bio yet. click edit to add one!"}
        </p>
      </div>

      {/* Favorite Review */}
      <div className="review-card">
        <h2 className="text-2xl font-black tracking-tight lowercase mb-2">favorite review</h2>
        {favoriteReview ? (
          <ReviewCardDisplay review={favoriteReview} />
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
              <ReviewCardDisplay key={review.id} review={review} />
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