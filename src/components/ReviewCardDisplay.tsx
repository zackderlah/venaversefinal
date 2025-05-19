"use client";

import { Review } from '@/types/review';
import MediaTag from './MediaTag';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ReviewCardDisplayProps {
  review: Review;
}

export default function ReviewCardDisplay({ review }: ReviewCardDisplayProps) {
  const { data: session, status } = useSession();
  const currentAuthenticatedUser = session?.user;
  const authLoading = status === 'loading';
  const router = useRouter();

  function capitalizeTitle(title: string) {
    return title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  function truncateReview(review: string, maxLength: number = 500) {
    if (review.length <= maxLength) return review;
    return review.slice(0, maxLength) + '...';
  }

  const canEdit = !authLoading && currentAuthenticatedUser && review.userId === Number(currentAuthenticatedUser.id);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('are you sure you want to delete this review? this action cannot be undone.')) {
      try {
        const res = await fetch(`/api/reviews/${review.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          window.location.reload();
        } else {
          const errorData = await res.json();
          alert(`Failed to delete review: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('An error occurred while deleting the review.');
      }
    }
  };

  return (
    <div id={`review-${review.id}`} className="review-card">
      <div className="flex flex-row gap-4 items-start">
        {review.imageUrl && (
          <div className="relative w-16 h-24 flex-shrink-0">
            <img
              src={review.imageUrl}
              alt={`Cover for ${review.title}`}
              className="object-cover rounded-lg w-full h-full"
            />
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col justify-start">
          <h3 className="text-xl font-black mb-1 truncate">{capitalizeTitle(review.title)}</h3>
          <div className="text-sm text-gray-500 mb-1">
            {review.creator}, {review.year}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <MediaTag category={review.category} />
            {review.user?.username && (
              <Link href={`/profile/${review.user.username}`} className="flex items-center gap-1">
                {review.user.profileImage ? (
                  <img
                    src={review.user.profileImage}
                    alt={review.user.username}
                    className="w-6 h-6 rounded-full object-cover border border-black dark:border-white"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 font-bold">
                    {review.user.username[0].toUpperCase()}
                  </span>
                )}
                <span className="underline hover:text-blue-600 text-xs text-black dark:text-white font-bold lowercase">{review.user.username}</span>
              </Link>
            )}
          </div>
          <p className="text-gray-600 mb-2 mt-2">
            {truncateReview(review.review)}
          </p>
          <div className="review-date">
            Reviewed on {new Date(review.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          {typeof review.commentCount === 'number' && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l.8-4A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              {review.commentCount} comment{review.commentCount === 1 ? '' : 's'}
            </div>
          )}
          {canEdit && (
            <div className="mt-2 flex space-x-3">
              <Link 
                href={`/reviews/${review.id}/edit`}
                onClick={e => e.stopPropagation()}
                className="text-xs lowercase font-semibold text-blue-600 hover:underline"
              >
                edit review
              </Link>
              <button 
                onClick={handleDelete}
                className="text-xs lowercase font-semibold text-red-600 hover:underline"
              >
                delete
              </button>
            </div>
          )}
        </div>
        <span className="rating shrink-0 ml-2 text-3xl font-extrabold mt-1">{review.rating}/10</span>
      </div>
    </div>
  );
} 