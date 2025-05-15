'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ReviewCard from '@/components/ReviewCard'
import SearchBar from '@/components/SearchBar'
import SortSelect from '@/components/SortSelect'
import { Review } from '@/types/review'

export default function MusicPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [allMusicReviews, setAllMusicReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all');
  
  useEffect(() => {
    fetch('/api/reviews/music')
      .then(res => res.json())
      .then((data: Review[]) => {
        setAllMusicReviews(data);
        setReviewsLoading(false);
      });
  }, []);

  const filteredByViewMode = viewMode === 'my' && currentUser
    ? allMusicReviews.filter(review => review.userId === currentUser.id)
    : allMusicReviews;

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
            my music reviews
          </h2>
          <h2 
            className={`text-3xl font-black lowercase cursor-pointer ${viewMode === 'all' ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
            onClick={() => setViewMode('all')}
          >
            all music reviews
          </h2>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg lowercase">
          {viewMode === 'my' 
            ? (currentUser ? `a collection of music reviews written by you.` : `please log in to see your music reviews.`)
            : `a collection of thoughts and ratings for music i've listened to.`}
        </p>

        <div className="space-y-8">
          <SearchBar value={search} onChange={setSearch} placeholder="search music by title..." />
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
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <p className="text-center text-gray-500 lowercase">
                {viewMode === 'my' && !currentUser 
                  ? 'please log in to see your reviews.'
                  : (viewMode === 'my' && currentUser ? 'you haven\'t written any music reviews yet.' : 'no music reviews found.')}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
} 