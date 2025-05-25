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
        return 'Book';
      case 'other':
        return 'Other';
    }
  };

  const getCategoryColor = (category: ReviewCategory) => {
    switch (category) {
      case 'film':
        return 'text-blue-800';
      case 'music':
        return 'text-purple-800';
      case 'anime':
        return 'text-pink-800';
      case 'books':
        return 'text-green-800';
      case 'other':
        return 'text-yellow-800';
    }
  };

  return (
    <span className={`inline-block text-xs font-bold lowercase ${getCategoryColor(category)}`}>
      {getCategoryLabel(category)}
    </span>
  );
} 