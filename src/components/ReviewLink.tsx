'use client';

import { Review } from '@/types/review';
import Link from 'next/link';

interface ReviewLinkProps {
  review: Review;
  children: React.ReactNode;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function ReviewLink({ review, children }: ReviewLinkProps) {
  const slug = `${review.id}-${slugify(review.title)}-by-${slugify(review.user?.username || '')}`;
  return (
    <Link href={`/reviews/${slug}`} className="block">
      {children}
    </Link>
  );
} 