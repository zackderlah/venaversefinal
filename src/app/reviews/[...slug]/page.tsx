"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { PrismaClient } from '@prisma/client';
import CommentSection from '@/components/CommentSection';
import Image from 'next/image';
import MediaTag from '@/components/MediaTag';
import ReviewActionsClient from '@/components/ReviewActionsClient';

function capitalizeTitle(title: string) {
  return title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

const prisma = new PrismaClient();

export default function ReviewPage() {
  const params = useParams();
  // params.slug is an array, e.g. ['123-the-godfather-by-johnny']
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const id = slug.split('-')[0]; // get the numeric ID
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    if (id) fetchReview();
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-gray-500 lowercase">loading...</div>;
  if (!review) return <div className="text-center mt-20 text-red-600 lowercase">review not found</div>;

  const canEdit = !authLoading && currentUser && review.userId === currentUser.id;

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
        router.push('/');
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

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(review.title + ' ' + review.creator)}`;

  return (
    <div className="flex min-h-screen w-full p-0 m-0 justify-center">
      <div className="w-full max-w-4xl border-2 border-black dark:border-white p-8 bg-white dark:bg-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {review.imageUrl && (
            <div className="flex-shrink-0 w-32 h-48 mx-auto md:mx-0 md:mb-0 mb-6 relative">
              <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer">
                <Image
                  src={review.imageUrl}
                  alt={`Cover for ${review.title}`}
                  fill
                  className="object-cover rounded-lg"
                  sizes="128px"
                  unoptimized
                />
              </a>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-black">
                <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {capitalizeTitle(review.title)}
                </a>
              </h1>
              <span className="rating text-4xl font-black ml-4">{review.rating}/10</span>
            </div>
            <div className="mb-2 text-gray-500 text-sm">
              {review.creator}, {review.year}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <MediaTag category={review.category} />
              {review.user?.username && (
                <span className="text-xs text-black dark:text-white font-bold lowercase flex items-center gap-1">
                  <span
                    className="cursor-pointer flex items-center gap-1"
                    onClick={e => {
                      e.stopPropagation();
                      router.push(`/profile/${review.user.username}`);
                    }}
                  >
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
                  </span>
                </span>
              )}
            </div>
            <div className="mb-6 text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none prose-p:my-4">
              <div dangerouslySetInnerHTML={{ __html: review.review }} />
            </div>
            <div className="review-date text-sm text-gray-500 dark:text-gray-400 mb-4">
              Reviewed on {new Date(review.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <ReviewActionsClient review={review} />
          </div>
        </div>
        <CommentSection reviewId={review.id} />
      </div>
    </div>
  );
} 