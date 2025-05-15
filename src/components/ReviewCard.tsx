import { Review } from '@/types/review';
import MediaTag from './MediaTag';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

interface ReviewCardProps {
  review: Review;
}

interface AuthenticatedUser {
  id: number;
  username: string;
  // other fields if returned by /api/auth/me
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const { user: currentAuthenticatedUser } = useAuth();

  // categoryPath is not used in this version of the card, but kept for potential future use or consistency
  // const categoryPath = review.category === 'film' ? 'films' :
  //                     review.category === 'music' ? 'music' :
  //                     review.category === 'anime' ? 'anime' : 'books';

  const canEdit = currentAuthenticatedUser && review.userId === currentAuthenticatedUser.id;

  const handleDelete = async () => {
    if (window.confirm('are you sure you want to delete this review? this action cannot be undone.')) {
      try {
        const res = await fetch(`/api/reviews/${review.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          // alert('Review deleted successfully');
          window.location.reload(); // Reload the page to reflect changes
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
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-black mb-1 truncate">{review.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-gray-500">
              {review.creator}, {review.year}
              {review.user?.username && (
                <span className="ml-2 text-xs text-black dark:text-white font-bold lowercase">by @<Link 
                  href={`/profile/${review.user.username}`} 
                  className="underline hover:text-blue-600"
                  onClick={(e) => e.stopPropagation()}
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
        {review.review}
      </p>
      <div className="review-date">
        Reviewed on {new Date(review.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
      {canEdit && (
        <div className="mt-2 flex space-x-3">
          <Link 
            href={`/reviews/${review.id}/edit`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs lowercase font-semibold text-blue-600 hover:underline"
          >
            edit review
          </Link>
          <button 
            onClick={(e) => { 
              e.stopPropagation();
              handleDelete(); 
            }}
            className="text-xs lowercase font-semibold text-red-600 hover:underline"
          >
            delete
          </button>
        </div>
      )}
    </div>
  );
} 