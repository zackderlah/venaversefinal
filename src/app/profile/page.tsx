import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewCardDisplay from "@/components/ReviewCardDisplay";
import Link from "next/link";
import ProfileHeaderClient from "@/components/ProfileHeaderClient";
import ProfileCommentSection from '@/components/ProfileCommentSection';

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
        include: { user: { select: { id: true, username: true, profileImage: true } } },
      },
    },
  });

  console.log('ProfilePage user:', user);
  console.log('ProfilePage session:', session);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <ProfileHeaderClient user={user} session={session} isOwner={true} />

      {/* Profile Comments */}
      <div className="review-card">
        <h2 className="text-2xl font-black tracking-tight lowercase mb-2">profile comments</h2>
        {user ? (
          <ProfileCommentSection profileId={user.id} />
        ) : (
          <div className="text-gray-400 lowercase">user not found</div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="review-card">
        <h2 className="text-2xl font-black tracking-tight lowercase mb-2">recent activity</h2>
        <div className="grid gap-6">
          {user?.reviews.length ? (
            user.reviews.map((review: any) => (
              <Link key={review.id} href={`/reviews/${review.id}`} className="block">
                <ReviewCardDisplay
                  review={{
                    ...review,
                    category: review.category as import("@/types/review").ReviewCategory,
                    date: review.date.toISOString(),
                    imageUrl: review.imageUrl ?? undefined,
                  }}
                />
              </Link>
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