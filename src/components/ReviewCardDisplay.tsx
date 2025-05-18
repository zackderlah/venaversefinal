import { Review } from '@/types/review';
import MediaTag from './MediaTag';
import Link from 'next/link';

interface ReviewCardDisplayProps {
  review: Review;
}

export default function ReviewCardDisplay({ review }: ReviewCardDisplayProps) {
  function capitalizeTitle(title: string) {
    return title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  function truncateReview(review: string, maxLength: number = 500) {
    if (review.length <= maxLength) return review;
    return review.slice(0, maxLength) + '...';
  }
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
        </div>
        <span className="rating shrink-0 ml-2 text-3xl font-extrabold mt-1">{review.rating}/10</span>
      </div>
    </div>
  );
} 