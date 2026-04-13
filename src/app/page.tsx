'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import ReviewCard from '@/components/ReviewCard'
import ReviewLink from '@/components/ReviewLink'
import { Masonry } from 'masonic';
import SkeletonCard from '@/components/SkeletonCard'
import PullToRefresh from '@/components/PullToRefresh'
import LoadingSpinner from '@/components/LoadingSpinner'
import PatchNotesSection from '@/components/PatchNotesSection'

export default function Home() {
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      }
      
      const paginationData = data.pagination || {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
      };
      
      setHasMore(paginationData.hasNextPage);
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

  // Infinite scroll observer - only on mobile
  useEffect(() => {
    if (!isMobile) return;

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
  }, [hasMore, loadingMore, loading, currentPage, fetchReviews, isMobile]);

  const handlePageChange = (page: number) => {
    if (
      page >= 1 &&
      page <= pagination.totalPages &&
      page !== pagination.currentPage
    ) {
      void fetchReviews(page, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

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

  const content = (
    <div className="space-y-16">
      <section className="border-b-2 border-black dark:border-gray-100 pb-8">
        <h2 className="text-4xl font-black mb-4 tracking-tight lowercase">note</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed lowercase">
          this website is a collection of reviews for{' '}
          <span className="text-blue-600 dark:text-blue-400">film/tv</span>,{' '}
          <span className="text-purple-600 dark:text-purple-400">music</span>,{' '}
          <span className="text-red-600 dark:text-red-400">anime</span>,{' '}
          <span className="text-green-600 dark:text-green-400">books</span>, and{' '}
          <span className="text-cyan-600 dark:text-cyan-400">games</span> that you and others have experienced.
          each review should include one's thoughts, ratings, and analysis of the work.{' '}
        </p>
        <PatchNotesSection />
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-12 border-b-2 border-black dark:border-gray-100 pb-4">
          <h2 className="text-4xl font-black tracking-tight lowercase">recent reviews</h2>
        </div>
        {loading ? (
          isMobile ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <LoadingSpinner />
          )
        ) : (
          <>
            <Masonry
              items={recentReviews}
              columnGutter={24}
              columnWidth={350}
              overscanBy={2}
              render={renderReview}
            />
            {/* Mobile: Infinite scroll */}
            {isMobile && (
              <>
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
            {/* Desktop: Pagination */}
            {!isMobile && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pt-8">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className={`px-3 py-1 text-sm lowercase tracking-tight transition-opacity ${
                    pagination.hasPreviousPage
                      ? 'text-black dark:text-gray-100 hover:opacity-60 cursor-pointer'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  ←
                </button>
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400 dark:text-gray-600">
                          ...
                        </span>
                      );
                    }
                    const pageNum = page as number;
                    const isActive = pageNum === pagination.currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[32px] px-2 py-1 text-sm lowercase tracking-tight transition-colors ${
                          isActive
                            ? 'bg-black dark:bg-gray-100 text-white dark:text-black font-semibold'
                            : 'text-black dark:text-gray-100 hover:opacity-60'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`px-3 py-1 text-sm lowercase tracking-tight transition-opacity ${
                    pagination.hasNextPage
                      ? 'text-black dark:text-gray-100 hover:opacity-60 cursor-pointer'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );

  return isMobile ? (
    <PullToRefresh onRefresh={handleRefresh}>
      {content}
    </PullToRefresh>
  ) : (
    content
  );
}

// Masonry CSS (add to globals.css or as inline style)
// .masonry-grid { display: flex; margin-left: -16px; }
// .masonry-grid_column { padding-left: 16px; background-clip: padding-box; } 