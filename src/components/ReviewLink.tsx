'use client';

import { Review } from '@/types/review';
import Link from 'next/link';

interface ReviewLinkProps {
  review: Review;
  children: React.ReactNode;
}

export default function ReviewLink({ review, children }: ReviewLinkProps) {
  return (
    <Link href={`/reviews/${review.id}`} className="block">
      {children}
    </Link>
  );
} 