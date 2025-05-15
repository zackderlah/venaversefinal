'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    category: 'film',
    creator: '',
    year: '',
    rating: '',
    review: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for user session, redirect if not logged in
  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (!res.ok) {
        router.push('/login?redirect=/create-post');
      }
    });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    for (const key in formData) {
      if (formData[key as keyof typeof formData].trim() === '') {
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
    if (isNaN(parseInt(formData.rating)) || parseInt(formData.rating) < 1 || parseInt(formData.rating) > 10) {
        setError('please enter a rating between 1 and 10.');
        setIsSubmitting(false);
        return;
    }

    try {
      const res = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year),
          rating: parseInt(formData.rating),
        }),
      });

      if (res.ok) {
        const newReview = await res.json();
        // Redirect to the new review's category page, or home
        // For simplicity, let's redirect to home for now, or the category page
        const categoryPath = formData.category === 'music' ? 'music' : formData.category; // handles 'album' -> 'music' if needed
        router.push(`/${categoryPath === 'film' ? 'films' : categoryPath}`); // Adjust path for films
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'failed to create post. please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('an unexpected error occurred. please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black mb-6 lowercase">create new post</h1>
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
          <input type="number" name="rating" id="rating" value={formData.rating} onChange={handleChange} required min="1" max="10" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label htmlFor="review" className="block text-sm font-medium text-gray-700 dark:text-gray-300 lowercase">review</label>
          <textarea name="review" id="review" value={formData.review} onChange={handleChange} rows={6} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>

        {error && <p className="text-red-500 text-sm lowercase">{error}</p>}

        <div>
          <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent font-bold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 lowercase disabled:opacity-50">
            {isSubmitting ? 'submitting...' : 'submit review'}
          </button>
        </div>
      </form>
    </div>
  );
} 