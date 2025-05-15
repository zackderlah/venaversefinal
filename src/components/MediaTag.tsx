'use client';

import { ReviewCategory } from '@/types/review';

interface MediaTagProps {
  category: ReviewCategory;
}

export default function MediaTag({ category }: MediaTagProps) {
  const getCategoryLabel = (category: ReviewCategory) => {
    switch (category) {
      case 'film':
        return 'Film';
      case 'music':
        return 'Album';
      case 'anime':
        return 'Anime';
      case 'books':
        return 'Books';
      case 'other':
        return 'Other';
    }
  };

  const getCategoryColor = (category: ReviewCategory) => {
    switch (category) {
      case 'film':
        return 'bg-blue-100 text-blue-800';
      case 'music':
        return 'bg-purple-100 text-purple-800';
      case 'anime':
        return 'bg-pink-100 text-pink-800';
      case 'books':
        return 'bg-green-100 text-green-800';
      case 'other':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${getCategoryColor(category)}`}>
      {getCategoryLabel(category)}
    </span>
  );
} 