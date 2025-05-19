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
  const [activeSearchField, setActiveSearchField] = useState<'title' | 'creator'>('title');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const creatorInputRef = useRef<HTMLInputElement | null>(null);

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

  // Autofill logic for title or creator (fetch from OMDb, AniList, iTunes, Google Books)
  useEffect(() => {
    const searchValue = activeSearchField === 'title' ? formData.title : formData.creator;
    if (searchValue.length < 1) {
      setSuggestions([]);
      return;
    }
    let ignore = false;
    async function fetchSuggestions() {
      setSuggestLoading(true);
      let results: any[] = [];
      if (activeSearchField === 'title') {
        if (formData.category === 'film') {
          // OMDb API: Try to filter by director if creator is filled
          let url = `https://www.omdbapi.com/?apikey=3c1416fe&s=${encodeURIComponent(searchValue)}&type=movie`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.Search) {
            const detailPromises = data.Search.slice(0, 30).map(async (m: any) => {
              const detailRes = await fetch(`https://www.omdbapi.com/?apikey=3c1416fe&i=${m.imdbID}`);
              const detail = await detailRes.json();
              return {
                title: m.Title,
                creator: detail.Director || '',
                poster: m.Poster !== 'N/A' ? m.Poster : undefined,
                year: m.Year,
              };
            });
            let allResults = await Promise.all(detailPromises);
            // If creator is filled, filter by director
            if (formData.creator.trim().length > 0) {
              const creatorLower = formData.creator.trim().toLowerCase();
              allResults = allResults.filter((r: any) => r.creator.toLowerCase().includes(creatorLower));
            }
            results = allResults.slice(0, 3);
          }
        } else if (formData.category === 'anime') {
          // AniList API: Filter by studio if creator is filled
          const query = `query ($search: String) { Page(perPage: 10) { media(search: $search, type: ANIME) { title { romaji } coverImage { large } startDate { year } studios { nodes { name } } } } }`;
          const variables = { search: searchValue };
          const res = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
          });
          const data = await res.json();
          let allResults = [];
          if (data.data && data.data.Page && data.data.Page.media) {
            allResults = data.data.Page.media.map((m: any) => ({
              title: m.title.romaji,
              creator: m.studios.nodes[0]?.name || '',
              poster: m.coverImage.large,
              year: m.startDate.year?.toString() || '',
            }));
            // If creator is filled, filter by studio
            if (formData.creator.trim().length > 0) {
              const creatorLower = formData.creator.trim().toLowerCase();
              allResults = allResults.filter((r: any) => r.creator.toLowerCase().includes(creatorLower));
            }
            results = allResults.slice(0, 3);
          }
        } else if (formData.category === 'music') {
          // iTunes API: Use both artist and title if creator is filled
          let url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchValue)}&entity=album&limit=10`;
          if (formData.creator.trim().length > 0) {
            url = `https://itunes.apple.com/search?term=${encodeURIComponent(formData.creator + ' ' + searchValue)}&entity=album&limit=10`;
          }
          const res = await fetch(url);
          const data = await res.json();
          let allResults = [];
          if (data.results) {
            allResults = data.results.map((m: any) => ({
              title: m.collectionName,
              creator: m.artistName,
              poster: m.artworkUrl100,
              year: m.releaseDate ? m.releaseDate.slice(0, 4) : '',
            }));
            // If creator is filled, filter by artist
            if (formData.creator.trim().length > 0) {
              const creatorLower = formData.creator.trim().toLowerCase();
              allResults = allResults.filter((r: any) => r.creator.toLowerCase().includes(creatorLower));
            }
            results = allResults.slice(0, 3);
          }
        } else if (formData.category === 'books') {
          // Google Books API: Use both author and title if creator is filled
          let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchValue)}&maxResults=10`;
          if (formData.creator.trim().length > 0) {
            url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(searchValue)}+inauthor:${encodeURIComponent(formData.creator)}&maxResults=10`;
          }
          const res = await fetch(url);
          const data = await res.json();
          let allResults = [];
          if (data.items) {
            allResults = data.items.map((m: any) => ({
              title: m.volumeInfo.title,
              creator: m.volumeInfo.authors ? m.volumeInfo.authors.join(', ') : '',
              poster: m.volumeInfo.imageLinks?.thumbnail,
              year: m.volumeInfo.publishedDate ? m.volumeInfo.publishedDate.slice(0, 4) : '',
            }));
            // If creator is filled, filter by author
            if (formData.creator.trim().length > 0) {
              const creatorLower = formData.creator.trim().toLowerCase();
              allResults = allResults.filter((r: any) => r.creator.toLowerCase().includes(creatorLower));
            }
            results = allResults.slice(0, 3);
          }
        }
      } else if (activeSearchField === 'creator') {
        // New logic for creator search (search for creators only)
        if (formData.category === 'film') {
          // OMDb API: Search for movies by director, then extract unique directors
          const res = await fetch(`https://www.omdbapi.com/?apikey=3c1416fe&s=${encodeURIComponent(searchValue)}&type=movie`);
          const data = await res.json();
          let directors: { name: string; movies: string[] }[] = [];
          if (data.Search) {
            const detailPromises = data.Search.slice(0, 10).map(async (m: any) => {
              const detailRes = await fetch(`https://www.omdbapi.com/?apikey=3c1416fe&i=${m.imdbID}`);
              const detail = await detailRes.json();
              return { director: detail.Director, title: m.Title };
            });
            const details = await Promise.all(detailPromises);
            const directorMap: Record<string, string[]> = {};
            details.forEach(({ director, title }) => {
              if (director) {
                director.split(',').forEach((d: string) => {
                  const name = d.trim();
                  if (!directorMap[name]) directorMap[name] = [];
                  directorMap[name].push(title);
                });
              }
            });
            directors = Object.entries(directorMap).map(([name, movies]) => ({ name, movies }));
          }
          results = directors.slice(0, 5).map(d => ({ creator: d.name, works: d.movies }));
        } else if (formData.category === 'music') {
          // iTunes API: Search for artists
          const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchValue)}&entity=musicArtist&limit=5`);
          const data = await res.json();
          if (data.results) {
            results = data.results.map((m: any) => ({ creator: m.artistName }));
          }
        } else if (formData.category === 'books') {
          // Google Books API: Search for authors
          const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(searchValue)}&maxResults=5`);
          const data = await res.json();
          let authors: Record<string, string[]> = {};
          if (data.items) {
            data.items.forEach((m: any) => {
              if (m.volumeInfo.authors) {
                m.volumeInfo.authors.forEach((author: string) => {
                  if (!authors[author]) authors[author] = [];
                  authors[author].push(m.volumeInfo.title);
                });
              }
            });
          }
          results = Object.entries(authors).map(([name, works]) => ({ creator: name, works }));
        } else if (formData.category === 'anime') {
          // AniList API: Search for studios
          const query = `query ($search: String) { Page(perPage: 5) { studios(search: $search) { nodes { name media { nodes { title { romaji } } } } } } }`;
          const variables = { search: searchValue };
          const res = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
          });
          const data = await res.json();
          if (data.data && data.data.Page && data.data.Page.studios && data.data.Page.studios.nodes) {
            results = data.data.Page.studios.nodes.map((studio: any) => ({
              creator: studio.name,
              works: studio.media.nodes.map((m: any) => m.title.romaji),
            }));
          }
        }
      }
      if (!ignore) setSuggestions(results);
      setSuggestLoading(false);
    }
    fetchSuggestions();
    return () => { ignore = true; };
  }, [formData.title, formData.creator, formData.category, activeSearchField]);

  // Keyboard navigation for dropdown
  useEffect(() => {
    setHighlightedIndex(-1); // Reset highlight when suggestions change
  }, [suggestions, activeSearchField]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(idx => (idx + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(idx => (idx - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      const m = suggestions[highlightedIndex];
      if (activeSearchField === 'title') {
        setFormData(f => ({
          ...f,
          title: toTitleCase(m.title || ''),
          creator: toTitleCase(m.creator || ''),
          year: m.year || '',
        }));
        setPoster(m.poster || undefined);
        setTimeout(() => { titleInputRef.current?.blur(); }, 0);
      } else if (activeSearchField === 'creator') {
        setFormData(f => ({
          ...f,
          creator: toTitleCase(m.creator || ''),
        }));
        setTimeout(() => { creatorInputRef.current?.blur(); }, 0);
      }
      setSuggestions([]);
    }
  };

  function toTitleCase(str: string) {
    return str
      .toLowerCase()
      .replace(/([\wÀ-ÿ][^\s-]*)/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'title') {
      setPoster(undefined);
      setActiveSearchField('title');
    }
    if (e.target.name === 'creator') {
      setActiveSearchField('creator');
    }
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
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 lowercase">title</label>
          <input ref={titleInputRef} type="text" name="title" id="title" value={formData.title} onChange={handleChange} onKeyDown={activeSearchField === 'title' ? handleKeyDown : undefined} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" autoComplete="off" />
          {activeSearchField === 'title' && suggestLoading && <div className="text-xs text-gray-400">searching...</div>}
          {activeSearchField === 'title' && suggestions.length > 0 && (
            <ul ref={dropdownRef} className="bg-white dark:bg-[#18181b] border border-gray-300 dark:border-gray-700 rounded shadow absolute z-10 mt-2 max-h-48 overflow-y-auto w-full">
              {suggestions.map((m, i) => (
                <li
                  key={m.title + i}
                  className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900${highlightedIndex === i ? ' bg-blue-100 dark:bg-blue-900' : ''}`}
                  onClick={() => {
                    setFormData(f => ({
                      ...f,
                      title: toTitleCase(m.title || ''),
                      creator: toTitleCase(m.creator || ''),
                      year: m.year || '',
                    }));
                    setPoster(m.poster || undefined);
                    setSuggestions([]);
                    setTimeout(() => { titleInputRef.current?.blur(); }, 0);
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
          <label htmlFor="creator" className="block text-sm font-medium text-gray-700 dark:text-gray-300 lowercase">creator (e.g. director, artist)</label>
          <input ref={creatorInputRef} type="text" name="creator" id="creator" value={formData.creator} onChange={handleChange} onKeyDown={activeSearchField === 'creator' ? handleKeyDown : undefined} required className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" autoComplete="off" />
          {activeSearchField === 'creator' && suggestLoading && <div className="text-xs text-gray-400">searching...</div>}
          {activeSearchField === 'creator' && suggestions.length > 0 && (
            <ul ref={dropdownRef} className="bg-white dark:bg-[#18181b] border border-gray-300 dark:border-gray-700 rounded shadow absolute z-10 mt-2 max-h-48 overflow-y-auto w-full">
              {suggestions.map((m, i) => (
                <li
                  key={m.creator + i}
                  className={`flex flex-col gap-1 px-3 py-2 text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900${highlightedIndex === i ? ' bg-blue-100 dark:bg-blue-900' : ''}`}
                  onClick={() => {
                    setFormData(f => ({
                      ...f,
                      creator: toTitleCase(m.creator || ''),
                    }));
                    setSuggestions([]);
                    setTimeout(() => { creatorInputRef.current?.blur(); }, 0);
                  }}
                >
                  <span className="font-bold">{toTitleCase(m.creator)}</span>
                  {m.works && m.works.length > 0 && (
                    <span className="text-gray-400">{m.works.slice(0, 3).join(', ')}{m.works.length > 3 ? ', ...' : ''}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
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