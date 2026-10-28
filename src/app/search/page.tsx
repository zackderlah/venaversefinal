'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReviewCard from '@/components/ReviewCard';
import ReviewLink from '@/components/ReviewLink';
import SkeletonCard from '@/components/SkeletonCard';
import { Masonry } from 'masonic';
import PageHeader from '@/components/PageHeader';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`/api/reviews/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data.reviews || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error searching:', err);
          setLoading(false);
        });
    }
  }, [query]);

  const renderReview = ({ data }: { data: any }) => (
    <ReviewLink review={data}>
      <ReviewCard review={data} />
    </ReviewLink>
  );

  return (
    <div>
      <PageHeader
        title="search results"
        subtitle={query ? `for “${query}”` : undefined}
      />
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : results.length > 0 ? (
        <Masonry
          items={results}
          columnGutter={24}
          columnWidth={350}
          overscanBy={2}
          render={renderReview}
        />
      ) : query ? (
        <div className="vv-panel px-6 py-12 text-center text-vv-faint lowercase">
          no reviews found for "{query}"
        </div>
      ) : (
        <div className="vv-panel px-6 py-12 text-center text-vv-faint lowercase">
          enter a search query to find reviews
        </div>
      )}
    </div>
  );
}

