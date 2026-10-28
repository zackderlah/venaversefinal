'use client';

import CategoryReviewsPage from '@/components/CategoryReviewsPage';

export default function OtherPage() {
  return (
    <CategoryReviewsPage
      apiPath="other"
      label="other"
      noun="other"
      mineDescription="a collection of other reviews written by you."
      allDescription="a collection of thoughts and ratings for other things i've experienced."
      defaultView="all"
    />
  );
}
