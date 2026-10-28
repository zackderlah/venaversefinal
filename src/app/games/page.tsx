'use client';
export const dynamic = 'force-dynamic';

import CategoryReviewsPage from '@/components/CategoryReviewsPage';

export default function GamesPage() {
  return (
    <CategoryReviewsPage
      apiPath="games"
      label="games"
      noun="game"
      mineDescription="a collection of game reviews written by you."
      allDescription="a collection of thoughts and ratings for games."
    />
  );
}
