'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import ReviewCard from '@/components/ReviewCard'
import ReviewLink from '@/components/ReviewLink'
import { Masonry } from 'masonic';
import SkeletonCard from '@/components/SkeletonCard'
import PullToRefresh from '@/components/PullToRefresh'

export default function Home() {
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchReviews = useCallback(async (page: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const res = await fetch(`/api/reviews/recent?page=${page}`);
      const data = await res.json();
      
      if (append) {
        setRecentReviews(prev => [...prev, ...(data.reviews || [])]);
      } else {
        setRecentReviews(data.reviews || []);
      }
      
      const pagination = data.pagination || {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
      };
      
      setHasMore(pagination.hasNextPage);
      setCurrentPage(page);
      
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews(1, false);
  }, [fetchReviews]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchReviews(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, currentPage, fetchReviews]);

  // Render function for each review
  const renderReview = ({ data }: { data: any }) => (
    <ReviewLink review={data}>
      <ReviewCard review={data} />
    </ReviewLink>
  );

  const handleRefresh = async () => {
    setCurrentPage(1);
    setHasMore(true);
    await fetchReviews(1, false);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-16">
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
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            <Masonry
              items={recentReviews}
              columnGutter={24}
              columnWidth={350}
              overscanBy={2}
              render={renderReview}
            />
            {loadingMore && (
              <div className="mt-8 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}
            <div ref={observerTarget} className="h-4" />
            {!hasMore && recentReviews.length > 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8 pb-8 lowercase">
                no more reviews to load
              </div>
            )}
          </>
        )}
      </section>
    </div>
    </PullToRefresh>
  )
}

// Masonry CSS (add to globals.css or as inline style)
// .masonry-grid { display: flex; margin-left: -16px; }
// .masonry-grid_column { padding-left: 16px; background-clip: padding-box; } 