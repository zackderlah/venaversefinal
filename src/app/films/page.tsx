'use client';
export const dynamic = 'force-dynamic';

import CategoryReviewsPage from '@/components/CategoryReviewsPage';

export default function FilmsPage() {
  return (
    <CategoryReviewsPage
      apiPath="films"
      label="film/tv"
      noun="film/tv"
      mineDescription="a collection of film and tv reviews written by you."
      allDescription="a collection of thoughts and ratings for films and tv watched."
    />
  );
}
