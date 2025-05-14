'use client';

import { Review } from '@/types/review';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ReviewLinkProps {
  review: Review;
  children: React.ReactNode;
}

export default function ReviewLink({ review, children }: ReviewLinkProps) {
  const categoryPath = review.category === 'film' ? 'films' : 
                      review.category === 'album' ? 'albums' :
                      review.category === 'anime' ? 'anime' : 'manga';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `/${categoryPath}#review-${review.id}`;
    window.location.href = url;
  };

  return (
    <a 
      href={`/${categoryPath}#review-${review.id}`}
      onClick={handleClick}
      className="block"
    >
      {children}
    </a>
  );
} 