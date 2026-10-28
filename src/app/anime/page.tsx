'use client';
export const dynamic = 'force-dynamic';

import CategoryReviewsPage from '@/components/CategoryReviewsPage';

export default function AnimePage() {
  return (
    <CategoryReviewsPage
      apiPath="anime"
      label="anime"
      noun="anime"
      mineDescription="a collection of anime reviews written by you."
      allDescription="a collection of thoughts and ratings for anime series and films."
    />
  );
}
