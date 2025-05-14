export type ReviewCategory = 'film' | 'album' | 'anime' | 'manga';

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