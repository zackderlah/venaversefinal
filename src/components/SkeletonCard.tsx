'use client';

export default function SkeletonCard() {
  return (
    <div className="review-card review-card-item animate-pulse">
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start w-full">
        <div className="flex flex-row gap-3 md:gap-4 items-start w-full md:w-auto min-w-0">
          <div className="w-16 h-24 bg-gray-300 dark:bg-gray-700 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col justify-start">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1 w-1/2" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
          </div>
        </div>
        <div className="w-12 h-8 bg-gray-300 dark:bg-gray-700 rounded ml-auto hidden md:block" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-4/6" />
      </div>
      <div className="mt-4 h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
    </div>
  );
}

