'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'
import { reviews } from '@/data/reviews'
import ReviewCard from '@/components/ReviewCard'
import ReviewLink from '@/components/ReviewLink'
import Masonry from 'react-masonry-css';

export default function Home() {
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reviews/recent')
      .then(res => res.json())
      .then(data => {
        setRecentReviews(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-16 px-4 py-8 max-w-[1000px] mx-auto border-x-2 border-black dark:border-gray-100 min-h-screen">
      <section className="border-b-2 border-black dark:border-gray-100 pb-8">
        <h2 className="text-4xl font-black mb-4 tracking-tight lowercase">note</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed lowercase">
          this website is a collection of reviews for films, music, anime, and books that you and others have experienced.
          each review should include one's thoughts, ratings, and analysis of the work. 
        </p>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-12 border-b-2 border-black dark:border-gray-100 pb-4">
          <h2 className="text-4xl font-black tracking-tight lowercase">recent reviews</h2>
        </div>
        {loading ? (
          <div className="text-center text-gray-500 lowercase">loading...</div>
        ) : (
          <Masonry
            breakpointCols={{ default: 2, 700: 1 }}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {recentReviews.map((review) => (
              <div key={review.id} className="flex flex-col h-full mb-8">
                <ReviewLink review={review}>
                  <ReviewCard review={review} />
                </ReviewLink>
              </div>
            ))}
          </Masonry>
        )}
      </section>
    </div>
  )
}

// Masonry CSS (add to globals.css or as inline style)
// .masonry-grid { display: flex; margin-left: -16px; }
// .masonry-grid_column { padding-left: 16px; background-clip: padding-box; } 