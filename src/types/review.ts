export type ReviewCategory = 'film' | 'album' | 'anime' | 'books';

export interface Review {
  id: string;
  title: string;
  category: ReviewCategory;
  creator: string;
  year: number;
  rating: number;
  review: string;
  date: string;
  imageUrl?: string;
} 