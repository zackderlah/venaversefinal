"use client";

import { Review } from '@/types/review';
import MediaTag from './MediaTag';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { htmlToText } from 'html-to-text';

interface ReviewCardDisplayProps {
  review: Review;
}

export default function ReviewCardDisplay({ review }: ReviewCardDisplayProps) {
  const { data: session, status } = useSession();
  const currentAuthenticatedUser = session?.user;
  const authLoading = status === 'loading';
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  function capitalizeTitle(title: string) {
    return title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  function truncateReview(review: string, maxLength: number = 500) {
    if (review.length <= maxLength) return review;
    return review.slice(0, maxLength) + '...';
  }

  // Helper to get a plain text preview from HTML
  function getPreview(html: string, maxLength: number = 500) {
    const text = htmlToText(html, { wordwrap: false, selectors: [{ selector: 'a', options: { ignoreHref: true } }] });
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  const canEdit = !authLoading && currentAuthenticatedUser && (String(review.userId) === String(currentAuthenticatedUser.id) || currentAuthenticatedUser.isAdmin);
  if (!authLoading && !currentAuthenticatedUser) {
    console.warn('No authenticated user found in session. Edit/delete buttons will not show.');
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div
      id={`review-${review.id}`}
      className="review-card review-card-item cursor-pointer overflow-hidden w-full max-w-full"
      onClick={() => router.push(`/reviews/${review.id}`)}
    >
      <div className="flex flex-col md:flex-row gap-4 items-start w-full max-w-full">
        <div className="flex flex-row gap-3 md:gap-4 items-start w-full md:w-auto min-w-0 max-w-full">
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
          <div className="flex-1 min-w-0 flex flex-col justify-start overflow-hidden">
            <div className="flex items-start justify-between gap-2 mb-1 min-w-0 w-full">
              <h3 className="text-lg md:text-xl font-black truncate flex-1 min-w-0">
                <Link href={`/reviews/${review.id}`} onClick={e => e.stopPropagation()}>{capitalizeTitle(review.title)}</Link>
              </h3>
              <span className="rating shrink-0 text-xl md:text-3xl font-extrabold md:hidden ml-2">{review.rating}/10</span>
            </div>
            <span className="text-xs md:text-sm text-gray-500 mb-1 truncate">
              {review.creator}, {review.year} <MediaTag category={review.category} />
            </span>
            {review.user?.username && (
              <div className="mb-2">
                <Link href={`/profile/${review.user.username}`} className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
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
                  <span className="hover:text-blue-600 dark:hover:text-blue-600 text-xs text-black dark:text-white font-bold lowercase ml-0.5">{review.user.username}</span>
                </Link>
              </div>
            )}
            <div className="mb-4 text-gray-700 dark:text-gray-300 overflow-hidden">
              <p className="text-xs md:text-sm leading-relaxed break-words whitespace-normal">
                {isMobile ? getPreview(review.review, 200) : getPreview(review.review, 500)}
                {htmlToText(review.review, { wordwrap: false }).length > (isMobile ? 200 : 500) && (
                  <Link href={`/reviews/${review.id}`} className="text-blue-600 hover:underline ml-1">Read more</Link>
                )}
              </p>
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
              <div className="mt-2 flex flex-col gap-[5px]">
                <Link 
                  href={`/reviews/${review.id}/edit`}
                  onClick={e => { e.stopPropagation(); e.preventDefault(); router.push(`/reviews/${review.id}/edit`); }}
                  className="text-xs lowercase font-semibold text-blue-600 hover:underline"
                >
                  edit review
                </Link>
                <button 
                  onClick={e => { e.stopPropagation(); e.preventDefault(); handleDelete(e); }}
                  className="text-xs lowercase font-semibold text-red-600 hover:underline self-start"
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
        </div>
        <span className="rating shrink-0 ml-2 text-2xl md:text-3xl font-extrabold mt-1 hidden md:block">{review.rating}/10</span>
      </div>
    </div>
  );
} 