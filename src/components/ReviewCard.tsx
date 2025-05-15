import { Review } from '@/types/review';
import MediaTag from './MediaTag';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const categoryPath = review.category === 'film' ? 'films' : 
                      review.category === 'album' ? 'music' :
                      review.category === 'anime' ? 'anime' : 'manga';

  return (
    <div id={`review-${review.id}`} className="review-card">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-black mb-1 truncate">{review.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-gray-500">{review.creator}, {review.year}</p>
            <MediaTag category={review.category} />
          </div>
        </div>
        <span className="rating shrink-0 ml-2">{review.rating}/10</span>
      </div>
      <p className="text-gray-600 mb-4">
        {review.review}
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