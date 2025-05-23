import { Review } from '@/types/review';
import MediaTag from './MediaTag';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { htmlToText } from 'html-to-text';

function capitalizeTitle(title: string) {
  return title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function truncateReview(review: string, maxLength: number = 500) {
  if (review.length <= maxLength) return review;
  return review.slice(0, maxLength) + '...';
}

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const { data: session, status } = useSession();
  const currentAuthenticatedUser = session?.user;
  const authLoading = status === 'loading';
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // categoryPath is not used in this version of the card, but kept for potential future use or consistency
  // const categoryPath = review.category === 'film' ? 'films' :
  //                     review.category === 'music' ? 'music' :
  //                     review.category === 'anime' ? 'anime' : 'books';

  const canEdit = !authLoading && currentAuthenticatedUser && (String(review.userId) === String(currentAuthenticatedUser.id) || currentAuthenticatedUser.isAdmin);
  if (!authLoading && !currentAuthenticatedUser) {
    console.warn('No authenticated user found in session. Edit/delete buttons will not show.');
  }

  console.log('[ReviewCard debug]', {
    reviewUserId: review.userId,
    currentAuthenticatedUserId: currentAuthenticatedUser?.id,
    authLoading,
    session
  });

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'DELETE',
      });
      setShowDeleteModal(false);
      setDeleting(false);
      if (res.ok) {
        window.location.href = '/';
      } else {
        const errorData = await res.json();
        alert(`Failed to delete review: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setShowDeleteModal(false);
      setDeleting(false);
      alert('An error occurred while deleting the review.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Helper to get a plain text preview from HTML
  function getPreview(html: string, maxLength: number = 400) {
    const text = htmlToText(html, { wordwrap: false, selectors: [{ selector: 'a', options: { ignoreHref: true } }] });
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  return (
    <div
      id={`review-${review.id}`}
      className="review-card cursor-pointer"
      onClick={() => router.push(`/reviews/${review.id}`)}
    >
      <div className="flex flex-row gap-4 items-start">
        {review.imageUrl && (
          <div className="relative w-16 h-24 flex-shrink-0">
            <Image
              src={review.imageUrl}
              alt={`Cover for ${review.title}`}
              fill
              className="object-cover rounded-lg"
              sizes="64px"
              unoptimized
            />
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col justify-start">
          <div className="flex justify-between items-start gap-4 mb-1">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-black mb-1 truncate">
                <Link href={`/reviews/${review.id}`} onClick={e => e.stopPropagation()}>{capitalizeTitle(review.title)}</Link>
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500">
                  {review.creator}, {review.year}
                </span>
                <MediaTag category={review.category} />
                {review.user?.username ? (
                  <span className="text-xs text-black dark:text-white font-bold lowercase flex items-center gap-1">
                    <Link href={`/profile/${review.user.username}`} className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
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
                      <span className="ml-1 hover:text-blue-600">{review.user.username}</span>
                    </Link>
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="rating shrink-0 ml-2">{review.rating}/10</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 mt-4 prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 prose-p:my-4">
        {getPreview(review.review, 400)}
        {htmlToText(review.review, { wordwrap: false }).length > 400 && (
          <Link href={`/reviews/${review.id}`} className="text-blue-600 hover:underline ml-1">Read more</Link>
        )}
      </div>
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
            onClick={e => { e.stopPropagation(); e.preventDefault(); router.push(`/reviews/${review.id}/edit`); }}
            className="text-xs lowercase font-semibold text-blue-600 hover:underline"
          >
            edit review
          </Link>
          <button 
            onClick={e => { e.stopPropagation(); e.preventDefault(); handleDelete(); }}
            className="text-xs lowercase font-semibold text-red-600 hover:underline"
          >
            delete
          </button>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-[#18181b] rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
            <div className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100 lowercase">delete review?</div>
            <div className="mb-6 text-gray-600 dark:text-gray-300 text-sm">Are you sure you want to delete this review? This action cannot be undone.</div>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-1 rounded text-xs font-bold lowercase border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                disabled={deleting}
              >
                {deleting ? 'deleting...' : 'delete'}
              </button>
              <button
                onClick={cancelDelete}
                className="px-4 py-1 rounded text-xs font-bold lowercase border-2 border-gray-400 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                disabled={deleting}
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 