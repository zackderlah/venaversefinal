'use client';
export const dynamic = 'force-dynamic';

import CategoryReviewsPage from '@/components/CategoryReviewsPage';

export default function MusicPage() {
  return (
    <CategoryReviewsPage
      apiPath="music"
      label="music"
      noun="music"
      mineDescription="a collection of music reviews written by you."
      allDescription="a collection of thoughts and ratings for music."
    />
  );
}
