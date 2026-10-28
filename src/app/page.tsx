'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import ReviewCard from '@/components/ReviewCard'
import ReviewLink from '@/components/ReviewLink'
import SkeletonCard from '@/components/SkeletonCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import FrameRule from '@/components/FrameRule'
import Link from 'next/link'

const MasonryGrid = dynamic(
  () => import('masonic').then((mod) => mod.Masonry),
  { ssr: false }
);
const PullToRefresh = dynamic(() => import('@/components/PullToRefresh'), { ssr: false });
const PatchNotesSection = dynamic(() => import('@/components/PatchNotesSection'), { ssr: false });

export default function Home() {
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);
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

  useEffect(() => {
    const idleCallback = (window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    }).requestIdleCallback;
    const cancelIdleCallback = (window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    }).cancelIdleCallback;

    if (idleCallback) {
      const id = idleCallback(() => setShowPatchNotes(true));
      return () => {
        if (cancelIdleCallback) cancelIdleCallback(id);
      };
    }

    const timeoutId = window.setTimeout(() => setShowPatchNotes(true), 1200);
    return () => window.clearTimeout(timeoutId);
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
    <div>
      <section className="px-5 pb-12 pt-14 md:px-8 md:pb-16 md:pt-20">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <h1 className="max-w-3xl text-[2.1rem] font-bold leading-[1.05] tracking-[-0.035em] lowercase md:text-[3.25rem]">
            <span className="text-vv-fg">vena/verse</span>
            <br />
            <span className="text-vv-faint">honest takes on what we watch, hear, read and play.</span>
          </h1>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/create-post" className="vv-btn vv-btn-solid">write a review</Link>
            <Link href="/community" className="vv-btn">community</Link>
          </div>
        </div>
        <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-vv-muted lowercase">
          a collection of reviews that you and others have experienced. each review should include
          one&apos;s thoughts, ratings, and analysis of the work.
        </p>
      </section>

      {showPatchNotes ? (
        <>
          <FrameRule />
          <section className="px-5 py-10 md:px-8">
            <div className="vv-panel px-5 py-5 md:px-7 md:py-6">
              <PatchNotesSection />
            </div>
          </section>
        </>
      ) : null}

      <FrameRule />

      <section className="px-5 py-12 md:px-8 md:py-14">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight lowercase">recent reviews</h2>
          {pagination.totalCount > 0 && (
            <span className="vv-eyebrow">{pagination.totalCount} total</span>
          )}
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
            <MasonryGrid
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
                  <div className="text-center text-vv-faint text-sm mt-8 pb-8 lowercase">
                    no more reviews to load
                  </div>
                )}
              </>
            )}
            {/* Desktop: Pagination */}
            {!isMobile && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="vv-icon-btn disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ←
                </button>
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${index}`} className="px-2 text-vv-faint">
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
                        className="vv-pill min-w-[32px] justify-center"
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="vv-icon-btn disabled:cursor-not-allowed disabled:opacity-40"
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