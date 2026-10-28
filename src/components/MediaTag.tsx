'use client';

import { ReviewCategory } from '@/types/review';

interface MediaTagProps {
  category: ReviewCategory | 'film';
}

export default function MediaTag({ category }: MediaTagProps) {
  const getCategoryLabel = (category: ReviewCategory | 'film') => {
    switch (category) {
      case 'film-tv':
      case 'film':
        return 'film/tv';
      case 'music':
        return 'Album';
      case 'anime':
        return 'Anime';
      case 'books':
        return 'Book';
      case 'games':
        return 'Game';
      case 'other':
        return 'Other';
    }
  };

  const getCategoryColor = (category: ReviewCategory | 'film') => {
    switch (category) {
      case 'film-tv':
      case 'film':
        return 'text-blue-500';
      case 'music':
        return 'text-purple-500';
      case 'anime':
        return 'text-pink-500';
      case 'books':
        return 'text-green-500';
      case 'games':
        return 'text-cyan-500';
      case 'other':
        return 'text-yellow-500';
    }
  };

  return (
    <span className={`inline-block text-xs font-bold lowercase ${getCategoryColor(category)}`}>
      {getCategoryLabel(category)}
    </span>
  );
} 