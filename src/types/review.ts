export type ReviewCategory = 'film' | 'music' | 'anime' | 'books' | 'other';

export interface Review {
  id: number;
  title: string;
  category: ReviewCategory;
  creator: string;
  year: number;
  rating: number;
  review: string;
  date: string;
  imageUrl?: string;
  user?: { 
    username: string;
    id: number;
  };
  userId: number;
} 