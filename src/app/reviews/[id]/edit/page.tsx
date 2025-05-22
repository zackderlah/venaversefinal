'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';

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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const [activeSearchField, setActiveSearchField] = useState<'title' | 'creator'>('title');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const creatorInputRef = useRef<HTMLInputElement | null>(null);
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const latestQuery = useRef('');

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

  // Autofill logic (copy from create-post)
  useEffect(() => {
    const searchValue = activeSearchField === 'title' ? formData.title : formData.creator;
    if (searchValue.length < 1) {
      setSuggestions([]);
      return;
    }
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    latestQuery.current = searchValue;
    debounceTimeout.current = setTimeout(() => {
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
                let poster = detail.Poster !== 'N/A' ? detail.Poster : undefined;
                // Fallback to TMDb if OMDb poster is missing
                if (!poster) {
                  try {
                    const tmdbKey = '<<TMDB_API_KEY>>'; // Replace with your TMDb API key
                    const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(m.Title)}`);
                    const tmdbData = await tmdbRes.json();
                    if (tmdbData.results && tmdbData.results.length > 0 && tmdbData.results[0].poster_path) {
                      poster = `https://image.tmdb.org/t/p/w500${tmdbData.results[0].poster_path}`;
                    }
                  } catch {}
                }
                return {
                  title: m.Title,
                  creator: detail.Director || '',
                  poster,
                  year: m.Year,
                };
              });
              let allResults = await Promise.all(detailPromises);
              // If creator is filled, filter by director (substring match)
              if (formData.creator.trim().length > 0) {
                const creatorLower = formData.creator.trim().toLowerCase();
                allResults = allResults.filter((r: any) => r.creator.toLowerCase().includes(creatorLower));
              }
              results = allResults.slice(0, 5);
            }
          } else if (formData.category === 'anime') {
            // AniList API: Filter by studio if creator is filled
            const query = `query ($search: String) { Page(perPage: 10) { media(search: $search, type: ANIME) { title { romaji } coverImage { large } startDate { year } studios { nodes { name } } id } } }`;
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
                anilistId: m.id,
              }));
              // If creator is filled, filter by studio (substring match)
              if (formData.creator.trim().length > 0) {
                const creatorLower = formData.creator.trim().toLowerCase();
                allResults = allResults.filter((r: any) => r.creator.toLowerCase().includes(creatorLower));
              }
              // Fallback to MyAnimeList if AniList poster is missing
              for (let r of allResults) {
                if (!r.poster) {
                  try {
                    const malRes = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(r.title)}&limit=1`);
                    const malData = await malRes.json();
                    if (malData.data && malData.data.length > 0 && malData.data[0].images && malData.data[0].images.jpg && malData.data[0].images.jpg.large_image_url) {
                      r.poster = malData.data[0].images.jpg.large_image_url;
                    }
                  } catch {}
                }
              }
              results = allResults.slice(0, 5);
            }
          } else if (formData.category === 'music') {
            // iTunes API: Use both artist and title if creator is filled
            let url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchValue)}&entity=album,song&limit=10`;
            if (formData.creator.trim().length > 0) {
              url = `https://itunes.apple.com/search?term=${encodeURIComponent(formData.creator + ' ' + searchValue)}&entity=album,song&limit=10`;
            }
            const res = await fetch(url);
            const data = await res.json();
            let allResults = [];
            if (data.results) {
              allResults = data.results.map((m: any) => ({
                title: m.trackName || m.collectionName,
                creator: m.artistName,
                poster: m.artworkUrl100,
                year: (m.releaseDate || m.collectionReleaseDate) ? (m.releaseDate || m.collectionReleaseDate).slice(0, 4) : '',
              }));
              // If creator is filled, filter by artist (substring match)
              if (formData.creator.trim().length > 0) {
                const creatorLower = formData.creator.trim().toLowerCase();
                allResults = allResults.filter((r: any) => r.creator.toLowerCase().includes(creatorLower));
              }
              // Fallback to MusicBrainz + Cover Art Archive if iTunes art is missing
              for (let r of allResults) {
                if (!r.poster) {
                  try {
                    const mbUrl = `https://musicbrainz.org/ws/2/release/?query=release:${encodeURIComponent(r.title)}%20AND%20artist:${encodeURIComponent(r.creator)}&fmt=json&limit=1`;
                    const mbRes = await fetch(mbUrl, { headers: { 'User-Agent': 'johnnywebsite/1.0.0 ( email@example.com )' } });
                    const mbData = await mbRes.json();
                    if (mbData.releases && mbData.releases.length > 0 && mbData.releases[0].id) {
                      const caaUrl = `https://coverartarchive.org/release/${mbData.releases[0].id}/front-250`;
                      const caaRes = await fetch(caaUrl);
                      if (caaRes.ok) {
                        r.poster = caaUrl;
                      }
                    }
                  } catch {}
                }
              }
              results = allResults.slice(0, 5);
            }
          } else if (formData.category === 'books') {
            // Google Books API: Use both author and title if creator is filled
            let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchValue)}&maxResults=10`;
            if (formData.creator.trim().length > 0) {
              url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(searchValue)}+inauthor:${encodeURIComponent(formData.creator)}&maxResults=10`;
            }
            console.log('Fetching from Google Books:', url);
            const res = await fetch(url);
            const data = await res.json();
            console.log('Google Books response:', data);
            let allResults = [];
            if (data.items) {
              allResults = data.items.map((m: any) => {
                const imageLinks = m.volumeInfo.imageLinks || {};
                const poster = imageLinks.extraLarge || imageLinks.large || imageLinks.thumbnail;
                console.log('Book image links:', {
                  title: m.volumeInfo.title,
                  extraLarge: imageLinks.extraLarge,
                  large: imageLinks.large,
                  thumbnail: imageLinks.thumbnail,
                  final: poster
                });
                return {
                  title: m.volumeInfo.title,
                  creator: m.volumeInfo.authors ? m.volumeInfo.authors.join(', ') : '',
                  poster: poster || undefined,
                  year: m.volumeInfo.publishedDate ? m.volumeInfo.publishedDate.slice(0, 4) : '',
                  openLibraryId: m.volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier,
                  googleBooksId: m.id,
                };
              });
              // If creator is filled, filter by author (substring match)
              if (formData.creator.trim().length > 0) {
                const creatorLower = formData.creator.trim().toLowerCase();
                allResults = allResults.filter((r: any) => r.creator.toLowerCase().includes(creatorLower));
              }
              // Fallback to Open Library if Google Books cover is missing
              for (let r of allResults) {
                if (!r.poster) {
                  try {
                    // Try Open Library by ISBN first
                    if (r.openLibraryId) {
                      console.log('Trying Open Library by ISBN:', r.openLibraryId);
                      const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${r.openLibraryId}&format=json&jscmd=data`);
                      const olData = await olRes.json();
                      const olKey = `ISBN:${r.openLibraryId}`;
                      if (olData[olKey] && olData[olKey].cover && olData[olKey].cover.large) {
                        r.poster = olData[olKey].cover.large;
                        console.log('Found Open Library cover by ISBN:', r.poster);
                        continue;
                      }
                    }
                    // Try Open Library by title and author
                    console.log('Trying Open Library by title/author:', { title: r.title, author: r.creator });
                    const olSearchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(r.title)}&author=${encodeURIComponent(r.creator)}&limit=1`;
                    const olSearchRes = await fetch(olSearchUrl);
                    const olSearchData = await olSearchRes.json();
                    if (olSearchData.docs && olSearchData.docs.length > 0 && olSearchData.docs[0].cover_i) {
                      r.poster = `https://covers.openlibrary.org/b/id/${olSearchData.docs[0].cover_i}-L.jpg`;
                      console.log('Found Open Library cover by search:', r.poster);
                      continue;
                    }
                  } catch (error) {
                    console.error('Error fetching from Open Library:', error);
                  }
                }
              }
              results = allResults.slice(0, 5);
            }
          }
        }
        if (!ignore && latestQuery.current === searchValue) setSuggestions(results);
        setSuggestLoading(false);
      }
      fetchSuggestions();
      return () => { ignore = true; };
    }, 200);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [formData.title, formData.creator, formData.category, activeSearchField]);

  // Keyboard navigation for dropdown
  useEffect(() => {
    setHighlightedIndex(-1); // Reset highlight when suggestions change
  }, [suggestions, activeSearchField]);

  // Close dropdown on outside click only (not on space/backspace)
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
          <input type="number" step="0.1" name="rating" id="rating" value={formData.rating} onChange={handleChange} required min="1" max="10" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label htmlFor="review" className="block text-sm font-medium text-gray-700 dark:text-gray-300 lowercase">review</label>
          <RichTextEditor value={formData.review} onChange={val => setFormData(f => ({ ...f, review: val }))} />
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