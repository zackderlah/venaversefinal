'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ReviewCardDisplay from '@/components/ReviewCardDisplay'
import SearchBar from '@/components/SearchBar'
import SortSelect from '@/components/SortSelect'
import { Review } from '@/types/review'
import ReviewLink from '@/components/ReviewLink'

export default function OtherPage() {
  const { data: session, status } = useSession();
  const currentUser = session?.user;
  const authLoading = status === 'loading';
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [allOtherReviews, setAllOtherReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'my'>('my');
  
  useEffect(() => {
    fetch('/api/reviews/other')
      .then(res => res.json())
      .then((data: Review[]) => {
        setAllOtherReviews(data);
        setReviewsLoading(false);
      });
  }, []);

  const filteredByViewMode = viewMode === 'my' && currentUser
    ? allOtherReviews.filter(review => review.userId === Number(currentUser.id))
    : allOtherReviews;

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

  return (
    <div className="space-y-12">
      <section>
        <div className="flex space-x-6 border-b-2 border-black dark:border-white pb-3 mb-6">
          <h2 
            className={`text-3xl font-black lowercase cursor-pointer ${viewMode === 'my' ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
            onClick={() => setViewMode('my')}
          >
            my other reviews
          </h2>
          <h2 
            className={`text-3xl font-black lowercase cursor-pointer ${viewMode === 'all' ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
            onClick={() => setViewMode('all')}
          >
            all other reviews
          </h2>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg lowercase">
          {viewMode === 'my' 
            ? (currentUser ? `a collection of other reviews written by you.` : `please log in to see your other reviews.`)
            : `a collection of thoughts and ratings for other things i've experienced.`}
        </p>

        <div className="space-y-8">
          <SearchBar value={search} onChange={setSearch} placeholder="search other reviews by title..." />
          <div className="border-t-2 border-b-2 border-black dark:border-white py-4">
            <SortSelect value={sortBy} onChange={setSortBy} />
          </div>
        </div>
      </section>

      <section>
        {authLoading || reviewsLoading ? (
          <div className="text-center text-gray-500 lowercase">loading...</div>
        ) : (
          <div className="space-y-4">
            {sortedAndFilteredReviews.length > 0 ? (
              sortedAndFilteredReviews.map((review) => (
                <ReviewLink key={review.id} review={review}>
                  <ReviewCardDisplay review={review} />
                </ReviewLink>
              ))
            ) : (
              <p className="text-center text-gray-500 lowercase">
                {viewMode === 'my' && !currentUser 
                  ? 'please log in to see your reviews.'
                  : (viewMode === 'my' && currentUser ? 'you haven\'t written any other reviews yet.' : 'no other reviews found.')}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
} 