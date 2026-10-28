"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import CommentSection from '@/components/CommentSection';
import Image from 'next/image';
import MediaTag from '@/components/MediaTag';
import ReviewActionsClient from '@/components/ReviewActionsClient';
import ShareButton from '@/components/ShareButton';
import StarRatingDisplay from '@/components/StarRatingDisplay';
import FrameRule from '@/components/FrameRule';

function capitalizeTitle(title: string) {
  return title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export default function ReviewPage() {
  const params = useParams();
  // params.slug is an array, e.g. ['123-the-godfather-by-johnny']
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const id = slug?.split('-')[0]; // get the numeric ID
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

  if (loading) return <div className="py-20 text-center text-vv-faint lowercase">loading...</div>;
  if (!review) return <div className="py-20 text-center text-vv-muted lowercase">review not found</div>;

  const canEdit = !authLoading && currentUser && review.userId === Number(currentUser.id);

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

  const reviewedOn = new Date(review.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article>
      <header className="flex flex-col gap-8 pb-10 md:flex-row md:items-start md:pb-12">
        {review.imageUrl && (
          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mx-auto h-48 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-vv-line md:mx-0 md:h-60 md:w-40"
          >
            <Image
              src={review.imageUrl}
              alt={`Cover for ${review.title}`}
              fill
              className="object-cover"
              sizes="160px"
              unoptimized
            />
          </a>
        )}
        <div className="min-w-0 flex-1">
          <p className="vv-eyebrow mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <MediaTag category={review.category} />
            <span aria-hidden="true">·</span>
            <span>{reviewedOn}</span>
          </p>
          <h1 className="text-[2rem] font-bold leading-[1.08] tracking-[-0.035em] md:text-[2.75rem]">
            <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer" className="text-vv-fg hover:opacity-80">
              {capitalizeTitle(review.title)}
            </a>
            <br />
            <span className="text-vv-faint">{review.creator}, {review.year}</span>
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <StarRatingDisplay value={review.rating} starClassName="text-3xl font-black" />
            {review.user?.username && (
              <Link
                href={`/profile/${review.user.username}`}
                className="inline-flex items-center gap-2 rounded-full border border-vv-line bg-vv-surface py-1 pl-1 pr-3 text-[13px] lowercase text-vv-muted transition-colors hover:border-vv-strong hover:text-vv-fg"
              >
                {review.user.profileImage ? (
                  <img
                    src={review.user.profileImage}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-vv-raised text-xs font-bold text-vv-muted">
                    {review.user.username[0].toUpperCase()}
                  </span>
                )}
                {review.user.username}
              </Link>
            )}
          </div>
        </div>
      </header>

      <FrameRule className="-mx-5 mb-10 md:-mx-8 md:mb-12" />

      <div className="mx-auto max-w-2xl">
        <div className="prose prose-neutral max-w-none text-[16px] leading-relaxed text-vv-muted dark:prose-invert prose-p:my-4 prose-headings:text-vv-fg prose-a:text-vv-fg">
          <div dangerouslySetInnerHTML={{ __html: review.review }} />
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ShareButton
            title={review.title}
            url={`/reviews/${review.id}`}
            text={`Check out this ${review.category} review: ${review.title} by ${review.creator}`}
          />
          <ReviewActionsClient review={review} />
        </div>
      </div>

      <FrameRule className="-mx-5 my-10 md:-mx-8 md:my-12" />

      <div className="mx-auto max-w-2xl">
        <CommentSection reviewId={review.id} />
      </div>
    </article>
  );
}
