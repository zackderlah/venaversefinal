'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReviewCard from '@/components/ReviewCard';
import ReviewLink from '@/components/ReviewLink';
import SkeletonCard from '@/components/SkeletonCard';
import { Masonry } from 'masonic';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
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
    <div className="space-y-8">
      <div className="border-b-2 border-black dark:border-gray-100 pb-4">
        <h1 className="text-4xl font-black tracking-tight lowercase mb-2">
          search results
        </h1>
        {query && (
          <p className="text-gray-600 dark:text-gray-300 lowercase">
            for "{query}"
          </p>
        )}
      </div>
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
        <div className="text-center text-gray-500 dark:text-gray-400 py-12 lowercase">
          no reviews found for "{query}"
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12 lowercase">
          enter a search query to find reviews
        </div>
      )}
    </div>
  );
}

