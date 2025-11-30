'use client';

import { useEffect, useState } from 'react';
import ReviewCard from '@/components/ReviewCard'
import ReviewLink from '@/components/ReviewLink'
import { Masonry } from 'masonic';
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home() {
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reviews/recent?page=${currentPage}`)
      .then(res => res.json())
      .then(data => {
        setRecentReviews(data.reviews || []);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching reviews:', err);
        setLoading(false);
      });
  }, [currentPage]);

  // Render function for each review
  const renderReview = ({ data }: { data: any }) => (
    <ReviewLink review={data}>
      <ReviewCard review={data} />
    </ReviewLink>
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        // Near the end
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
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

  return (
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
          <LoadingSpinner />
        ) : (
          <>
            <Masonry
              items={recentReviews}
              columnGutter={24}
              columnWidth={350}
              overscanBy={2}
              render={renderReview}
            />
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
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
                    const isActive = pageNum === currentPage;
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
                  onClick={() => handlePageChange(currentPage + 1)}
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
  )
}

// Masonry CSS (add to globals.css or as inline style)
// .masonry-grid { display: flex; margin-left: -16px; }
// .masonry-grid_column { padding-left: 16px; background-clip: padding-box; } 