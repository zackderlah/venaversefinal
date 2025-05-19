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
        include: { user: { select: { id: true, username: true, profileImage: true } } },
      },
      currentlyExperiencing: {
        orderBy: { updatedAt: 'desc' },
      },
    },
  });
  if (!user) return notFound();

  const isOwner = Number(session?.user?.id) === user.id;

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
          {user.reviews.length ? (
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
          {/* Removed 'view all reviews' link */}
        </div>
      </div>
    </div>
  );
} 