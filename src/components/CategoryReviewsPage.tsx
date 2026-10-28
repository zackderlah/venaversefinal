'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ReviewCardDisplay from '@/components/ReviewCardDisplay';
import SearchBar from '@/components/SearchBar';
import SortSelect from '@/components/SortSelect';
import PageHeader from '@/components/PageHeader';
import ReviewLink from '@/components/ReviewLink';
import { Review } from '@/types/review';

interface CategoryReviewsPageProps {
  /** Path segment under /api/reviews, e.g. "films". */
  apiPath: string;
  /** Display name, e.g. "film/tv". */
  label: string;
  /** Singular noun used in copy, e.g. "book". */
  noun: string;
  mineDescription: string;
  allDescription: string;
  defaultView?: 'all' | 'my';
}

export default function CategoryReviewsPage({
  apiPath,
  label,
  noun,
  mineDescription,
  allDescription,
  defaultView = 'my',
}: CategoryReviewsPageProps) {
  const { data: session, status } = useSession();
  const currentUser = session?.user;
  const authLoading = status === 'loading';
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'my'>(defaultView);

  useEffect(() => {
    fetch(`/api/reviews/${apiPath}`)
      .then(res => res.json())
      .then((data: Review[]) => {
        setAllReviews(data);
        setReviewsLoading(false);
      })
      .catch(error => {
        console.error(`Error fetching ${apiPath} reviews:`, error);
        setReviewsLoading(false);
      });
  }, [apiPath]);

  const filteredByViewMode = viewMode === 'my' && currentUser
    ? allReviews.filter(review => review.userId === Number(currentUser.id))
    : allReviews;

  const sortedAndFilteredReviews = filteredByViewMode
    .filter(r => r.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  useEffect(() => {
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [sortedAndFilteredReviews]);

  const description = viewMode === 'my'
    ? (currentUser ? mineDescription : `please log in to see your ${noun} reviews.`)
    : allDescription;

  return (
    <div>
      <PageHeader
        title={label}
        subtitle={viewMode === 'my' ? 'your reviews.' : 'reviews from everyone.'}
        description={description}
        actions={
          <div className="flex rounded-full border border-vv-line bg-vv-surface p-0.5" role="group" aria-label="whose reviews">
            <button type="button" className="vv-pill" aria-current={viewMode === 'my' ? 'page' : undefined} onClick={() => setViewMode('my')}>
              mine
            </button>
            <button type="button" className="vv-pill" aria-current={viewMode === 'all' ? 'page' : undefined} onClick={() => setViewMode('all')}>
              everyone
            </button>
          </div>
        }
      />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder={`filter ${label} by title...`} />
        </div>
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>

      <p className="vv-eyebrow mb-4">
        {sortedAndFilteredReviews.length} review{sortedAndFilteredReviews.length === 1 ? '' : 's'}
      </p>
      {authLoading || reviewsLoading ? (
        <div className="py-12 text-center text-vv-faint lowercase">loading...</div>
      ) : (
        <div className="space-y-4">
          {sortedAndFilteredReviews.length > 0 ? (
            sortedAndFilteredReviews.map((review) => (
              <ReviewLink key={review.id} review={review}>
                <ReviewCardDisplay review={review} />
              </ReviewLink>
            ))
          ) : (
            <p className="vv-panel px-6 py-12 text-center text-vv-faint lowercase">
              {viewMode === 'my' && !currentUser
                ? 'please log in to see your reviews.'
                : (viewMode === 'my' && currentUser ? `you haven't written any ${noun} reviews yet.` : `no ${noun} reviews found.`)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
