'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

  // Check for user session, redirect if not logged in
  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (!res.ok) {
        router.push('/login?redirect=/create-post');
      }
    });
  }, [router]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    }
    if (suggestions.length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [suggestions]);

  // Autofill logic for title (fetch from OMDb, AniList, iTunes, Google Books)
  useEffect(() => {
    if (formData.title.length < 2) {
      setSuggestions([]);
      return;
    }
    let ignore = false;
    async function fetchSuggestions() {
      setSuggestLoading(true);
      let results: any[] = [];
      if (formData.category === 'film') {
        // OMDb API
        const res = await fetch(`https://www.omdbapi.com/?apikey=3c1416fe&s=${encodeURIComponent(formData.title)}&type=movie`);
        const data = await res.json();
        if (data.Search) {
          const detailPromises = data.Search.slice(0, 3).map(async (m: any) => {
            const detailRes = await fetch(`https://www.omdbapi.com/?apikey=3c1416fe&i=${m.imdbID}`);
            const detail = await detailRes.json();
            return {
              title: m.Title,
              creator: detail.Director || '',
              poster: m.Poster !== 'N/A' ? m.Poster : undefined,
              year: m.Year,
            };
          });
          results = await Promise.all(detailPromises);
        }
      } else if (formData.category === 'anime') {
        // AniList API
        const query = `query ($search: String) { Page(perPage: 3) { media(search: $search, type: ANIME) { title { romaji } coverImage { large } startDate { year } studios { nodes { name } } } } }`;
        const variables = { search: formData.title };
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables }),
        });
        const data = await res.json();
        if (data.data && data.data.Page && data.data.Page.media) {
          results = data.data.Page.media.map((m: any) => ({
            title: m.title.romaji,
            creator: m.studios.nodes[0]?.name || '',
            poster: m.coverImage.large,
            year: m.startDate.year?.toString() || '',
          }));
        }
      } else if (formData.category === 'music') {
        // iTunes Search API
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(formData.title)}&entity=album&limit=3`);
        const data = await res.json();
        if (data.results) {
          results = data.results.map((m: any) => ({
            title: m.collectionName,
            creator: m.artistName,
            poster: m.artworkUrl100,
            year: m.releaseDate ? m.releaseDate.slice(0, 4) : '',
          }));
        }
      } else if (formData.category === 'books') {
        // Google Books API
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(formData.title)}&maxResults=3`);
        const data = await res.json();
        if (data.items) {
          results = data.items.map((m: any) => ({
            title: m.volumeInfo.title,
            creator: m.volumeInfo.authors ? m.volumeInfo.authors.join(', ') : '',
            poster: m.volumeInfo.imageLinks?.thumbnail,
            year: m.volumeInfo.publishedDate ? m.volumeInfo.publishedDate.slice(0, 4) : '',
          }));
        }
      }
      if (!ignore) setSuggestions(results);
      setSuggestLoading(false);
    }
    fetchSuggestions();
    return () => { ignore = true; };
  }, [formData.title, formData.category]);

  function toTitleCase(str: string) {
    return str
      .toLowerCase()
      .replace(/([\wÀ-ÿ][^\s-]*)/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'title') setPoster(undefined);
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
          imageUrl: poster,
        }),
      });

      if (res.ok) {
        const newReview = await res.json();
        const categoryPath = formData.category === 'music' ? 'music' : formData.category;
        router.push(`/${categoryPath === 'film' ? 'films' : categoryPath}`);
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
          <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" autoComplete="off" />
          {suggestLoading && <div className="text-xs text-gray-400">searching...</div>}
          {suggestions.length > 0 && (
            <ul ref={dropdownRef} className="bg-white dark:bg-[#18181b] border border-gray-300 dark:border-gray-700 rounded shadow absolute z-10 mt-2 max-h-48 overflow-y-auto w-full">
              {suggestions.map((m, i) => (
                <li
                  key={m.title + i}
                  className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                  onClick={() => {
                    setFormData(f => ({
                      ...f,
                      title: toTitleCase(m.title || ''),
                      creator: toTitleCase(m.creator || ''),
                      year: m.year || '',
                    }));
                    setPoster(m.poster || undefined);
                    setSuggestions([]);
                  }}
                >
                  {m.poster && <img src={m.poster} alt={m.title} className="w-8 h-8 rounded object-cover border border-gray-300" />}
                  <span className="font-bold">{toTitleCase(m.title)}</span>
                  {m.year && <span className="ml-2 text-gray-400">({m.year})</span>}
                  <span className="ml-2 text-gray-500">by {m.creator ? toTitleCase(m.creator) : 'unknown'}</span>
                </li>
              ))}
            </ul>
          )}
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
          <input type="number" name="rating" id="rating" value={formData.rating} onChange={handleChange} required min="1" max="10" step="0.1" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" />
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