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
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-black mb-1 truncate">{capitalizeTitle(review.title)}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-gray-500">
              {review.creator}, {review.year}
              {review.user?.username && (
                <span className="ml-2 text-xs text-black dark:text-white font-bold lowercase">by @<Link 
                  href={`/profile/${review.user.username}`} 
                  className="underline hover:text-blue-600"
                  >
                  {review.user.username}
                </Link></span>
              )}
            </p>
            <MediaTag category={review.category} />
          </div>
        </div>
        <span className="rating shrink-0 ml-2">{review.rating}/10</span>
      </div>
      <p className="text-gray-600 mb-4">
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
  );
} 