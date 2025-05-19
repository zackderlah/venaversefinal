'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface ReviewFormData {
  title: string;
  category: string;
  creator: string;
  year: string;
  rating: string;
  review: string;
}

export default function EditReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id;

  const [formData, setFormData] = useState<ReviewFormData>({
    title: '',
    category: 'film',
    creator: '',
    year: '',
    rating: '',
    review: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check for user session first
    fetch('/api/auth/me').then(res => {
      if (!res.ok) {
        router.push(`/login?redirect=/reviews/${reviewId}/edit`);
      }
    });
  }, [router, reviewId]);

  useEffect(() => {
    if (reviewId) {
      fetch(`/api/reviews/${reviewId}`)
        .then(res => {
          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                setError('you are not authorized to edit this review, or your session is invalid.');
                // Redirect to login or home after a delay
                setTimeout(() => router.push('/'), 3000);
            } else {
                setError('failed to load review data.');
            }
            throw new Error('Failed to fetch review');
          }
          return res.json();
        })
        .then(data => {
          setFormData({
            title: data.title,
            category: data.category,
            creator: data.creator,
            year: String(data.year),
            rating: String(data.rating),
            review: data.review,
          });
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          // Error state is already set above
          setIsLoading(false);
        });
    }
  }, [reviewId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    for (const key in formData) {
      if (key !== 'review' && formData[key as keyof ReviewFormData].trim() === '') {
        setError(`please fill in the ${key} field.`);
        setIsSubmitting(false);
        return;
      }
    }
    if (isNaN(parseInt(formData.year)) || formData.year.length !== 4) {
        setError('please enter a valid four-digit year.');
        setIsSubmitting(false);
        return;
    }
    if (isNaN(parseFloat(formData.rating)) || parseFloat(formData.rating) < 1 || parseFloat(formData.rating) > 10) {
        setError('please enter a rating between 1 and 10.');
        setIsSubmitting(false);
        return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            year: parseInt(formData.year),
            rating: parseFloat(formData.rating), // Allow float for rating e.g. 8.5
          }),
        });

      if (res.ok) {
        // const updatedReview = await res.json();
        const categoryPath = formData.category === 'music' ? 'music' : formData.category;
        router.push(`/${categoryPath === 'film' ? 'films' : categoryPath}`);
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'failed to update review. please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('an unexpected error occurred. please try again.');
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div className="max-w-2xl mx-auto py-8 px-4 text-center lowercase">loading review data...</div>;
  }
  
  if (error && !formData.title) { // Show error prominently if form data couldn't load
    return <div className="max-w-2xl mx-auto py-8 px-4 text-center text-red-500 lowercase">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black mb-6 lowercase">edit review</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 lowercase">title</label>
          <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 lowercase">category</label>
          <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="film">film</option>
            <option value="music">music</option>
            <option value="anime">anime</option>
            <option value="books">books</option>
            <option value="other">other</option>
          </select>
        </div>

        <div>
          <label htmlFor="creator" className="block text-sm font-medium text-gray-700 dark:text-gray-300 lowercase">creator (e.g. director, artist)</label>
          <input type="text" name="creator" id="creator" value={formData.creator} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 lowercase">year</label>
          <input type="number" name="year" id="year" value={formData.year} onChange={handleChange} required placeholder="e.g. 2023" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 lowercase">rating (1-10)</label>
          <input type="number" step="0.1" name="rating" id="rating" value={formData.rating} onChange={handleChange} required min="1" max="10" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label htmlFor="review" className="block text-sm font-medium text-gray-700 dark:text-gray-300 lowercase">review</label>
          <textarea name="review" id="review" value={formData.review} onChange={handleChange} rows={6} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>

        {error && formData.title && <p className="text-red-500 text-sm lowercase">{error}</p>} {/* Show error inline if form data loaded but submission failed */}

        <div>
          <button type="submit" disabled={isSubmitting || isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent font-bold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 lowercase disabled:opacity-50">
            {isSubmitting ? 'updating...' : 'update review'}
          </button>
        </div>
      </form>
    </div>
  );
} 