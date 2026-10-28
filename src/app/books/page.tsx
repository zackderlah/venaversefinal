'use client';
export const dynamic = 'force-dynamic';

import CategoryReviewsPage from '@/components/CategoryReviewsPage';

export default function BooksPage() {
  return (
    <CategoryReviewsPage
      apiPath="books"
      label="books"
      noun="book"
      mineDescription="a collection of book reviews written by you."
      allDescription="a collection of thoughts and ratings for books."
    />
  );
}
