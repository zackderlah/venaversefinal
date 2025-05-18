"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { PrismaClient } from '@prisma/client';
import CommentSection from '@/components/CommentSection';
import Image from 'next/image';

function capitalizeTitle(title: string) {
  return title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

const prisma = new PrismaClient();

export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReview() {
      setLoading(true);
      const res = await fetch(`/api/reviews/${id}`);
      if (res.ok) {
        setReview(await res.json());
      } else {
        setReview(null);
      }
      setLoading(false);
    }
    fetchReview();
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-gray-500 lowercase">loading...</div>;
  if (!review) return <div className="text-center mt-20 text-red-600 lowercase">review not found</div>;

  const canEdit = !authLoading && currentUser && review.userId === currentUser.id;

  const handleDelete = async () => {
    if (window.confirm('are you sure you want to delete this review? this action cannot be undone.')) {
      try {
        const res = await fetch(`/api/reviews/${review.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          router.push('/');
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
    <div className="flex min-h-screen w-full p-0 m-0 justify-center">
      <div className="w-full max-w-4xl border-2 border-black dark:border-white p-8 bg-white dark:bg-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {review.imageUrl && (
            <div className="flex-shrink-0 w-32 h-48 mx-auto md:mx-0 md:mb-0 mb-6 relative">
              <Image
                src={review.imageUrl}
                alt={`Cover for ${review.title}`}
                fill
                className="object-cover rounded-lg"
                sizes="128px"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-black mb-2">{capitalizeTitle(review.title)}</h1>
            <div className="mb-4 text-gray-500 text-sm">
              {review.creator}, {review.year}
              {review.user?.username && (
                <span className="ml-2 text-xs text-black dark:text-white font-bold lowercase">
                  by @<Link href={`/profile/${review.user.username}`} className="underline hover:text-blue-600">{review.user.username}</Link>
                </span>
              )}
            </div>
            <div className="mb-4">
              <span className="rating text-2xl font-black">{review.rating}/10</span>
            </div>
            <div className="mb-6 text-gray-600 dark:text-gray-300">
              {review.review}
            </div>
            <div className="review-date text-sm text-gray-500 dark:text-gray-400 mb-4">
              Reviewed on {new Date(review.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            {canEdit && (
              <div className="mt-2 flex space-x-3">
                <Link 
                  href={`/reviews/${review.id}/edit`}
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
        </div>
        <CommentSection reviewId={review.id} />
      </div>
    </div>
  );
} 