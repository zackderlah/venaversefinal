"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

const TYPE_OPTIONS = [
  { value: 'film', label: 'film' },
  { value: 'anime', label: 'anime' },
  { value: 'tv', label: 'tv' },
  { value: 'music', label: 'music' },
  { value: 'book', label: 'book' },
  { value: 'other', label: 'other' },
];

interface MediaSuggestion {
  title: string;
  creator: string;
  poster?: string;
  year?: string;
}

interface CurrentlyExperiencing {
  id: number;
  title: string;
  type: string;
  progress?: string | null;
  createdAt: string;
  updatedAt: string;
  creator: string;
  imageUrl?: string | null;
  seasons?: string | null;
  year?: string | null;
  userId?: number;
}

export default function CurrentlyExperiencingSection({ profileId }: { profileId: number }) {
  const { data: session } = useSession();
  const user = session?.user;
  const isOwner = user && Number(user.id) === profileId;
  const [items, setItems] = useState<CurrentlyExperiencing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'film',
    progress: '',
    creator: '',
    year: '',
    seasons: '',
  });
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<MediaSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const dropdownRef = useRef<HTMLUListElement | null>(null);

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

  useEffect(() => {
    setLoading(true);
    fetch(`/api/currently-experiencing?userId=${profileId}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      });
  }, [profileId]);

  // Autofill logic for title (fetch from OMDb or AniList)
  useEffect(() => {
    if (form.title.length < 2) {
      setSuggestions([]);
      return;
    }
    let ignore = false;
    async function fetchSuggestions() {
      setSuggestLoading(true);
      let results: MediaSuggestion[] = [];
      if (form.type === 'film' || form.type === 'tv') {
        // OMDb API (works for films and many TV shows)
        const res = await fetch(`https://www.omdbapi.com/?apikey=3c1416fe&s=${encodeURIComponent(form.title)}&type=${form.type === 'film' ? 'movie' : 'series'}`);
        const data = await res.json();
        if (data.Search) {
          // Fetch details for each result to get the director/creator
          const detailPromises = data.Search.slice(0, 5).map(async (m: any) => {
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
      } else if (form.type === 'anime') {
        // AniList API
        const query = `query ($search: String) { Page(perPage: 5) { media(search: $search, type: ANIME) { title { romaji } coverImage { large } startDate { year } studios { nodes { name } } } } }`;
        const variables = { search: form.title };
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
      } else if (form.type === 'music') {
        // iTunes Search API
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(form.title)}&entity=album&limit=5`);
        const data = await res.json();
        if (data.results) {
          results = data.results.map((m: any) => ({
            title: m.collectionName,
            creator: m.artistName,
            poster: m.artworkUrl100,
            year: m.releaseDate ? m.releaseDate.slice(0, 4) : '',
          }));
        }
      } else if (form.type === 'book') {
        // Google Books API
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(form.title)}&maxResults=5`);
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
  }, [form.title, form.type]);

  function toTitleCase(str: string) {
    return str
      .toLowerCase()
      .replace(/([\wÀ-ÿ][^\s-]*)/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setPosting(true);
    const capitalizedForm = {
      ...form,
      title: toTitleCase(form.title),
      creator: toTitleCase(form.creator),
    };
    const res = await fetch('/api/currently-experiencing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...capitalizedForm, imageUrl: poster }),
    });
    setPosting(false);
    if (res.ok) {
      setForm({ title: '', type: 'film', progress: '', creator: '', year: '', seasons: '' });
      setPoster(undefined);
      setShowForm(false);
      setLoading(true);
      fetch(`/api/currently-experiencing?userId=${profileId}`)
        .then(res => res.json())
        .then(data => {
          setItems(data.items || []);
          setLoading(false);
        });
    } else {
      let data = {};
      try { data = await res.json(); } catch {}
      setError((data as any).error || 'Failed to add');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this item?')) return;
    setLoading(true);
    await fetch(`/api/currently-experiencing?id=${id}`, { method: 'DELETE' });
    fetch(`/api/currently-experiencing?userId=${profileId}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items || []);
        setLoading(false);
      });
  }

  return (
    <div>
      {isOwner && (
        <div className="mb-4">
          <button
            className="px-3 py-1 text-xs font-bold border-2 border-black dark:border-white rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 lowercase hover:bg-blue-200 hover:dark:bg-blue-800 transition-all mb-2"
            onClick={() => setShowForm(f => !f)}
          >
            {showForm ? 'cancel' : 'add new'}
          </button>
          {showForm && (
            <form onSubmit={handleAdd} className="flex flex-col gap-4 p-4 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-[#18181b] shadow-lg max-w-xl relative">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs lowercase text-gray-700 dark:text-gray-200">title</label>
                <input
                  className="border-2 border-black dark:border-white rounded p-2 text-sm bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 outline-none"
                  placeholder="title"
                  value={form.title}
                  onChange={e => {
                    setForm(f => ({ ...f, title: e.target.value }));
                    setPoster(undefined);
                  }}
                  required
                  autoComplete="off"
                />
                {suggestLoading && <div className="text-xs text-gray-400">searching...</div>}
                {suggestions.length > 0 && (
                  <ul ref={dropdownRef} className="bg-white dark:bg-[#18181b] border border-gray-300 dark:border-gray-700 rounded shadow absolute z-10 mt-10 max-h-48 overflow-y-auto w-80">
                    {suggestions.map((m, i) => (
                      <li
                        key={m.title + i}
                        className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                        onClick={() => {
                          setForm(f => ({
                            ...f,
                            title: toTitleCase(m.title || ''),
                            creator: toTitleCase(m.creator || ''),
                            year: m.year || '',
                            seasons: '',
                            progress: '',
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
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs lowercase text-gray-700 dark:text-gray-200">type</label>
                <select
                  className="border-2 border-black dark:border-white rounded p-2 text-sm bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 outline-none"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  required
                >
                  {TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-col gap-2 flex-1 min-w-[120px]">
                  <label className="font-bold text-xs lowercase text-gray-700 dark:text-gray-200">year</label>
                  <input className="border-2 border-black dark:border-white rounded p-2 text-sm bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 outline-none" placeholder="year" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-[120px]">
                  <label className="font-bold text-xs lowercase text-gray-700 dark:text-gray-200">seasons</label>
                  <input className="border-2 border-black dark:border-white rounded p-2 text-sm bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 outline-none" placeholder="seasons" value={form.seasons} onChange={e => setForm(f => ({ ...f, seasons: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-[120px]">
                  <label className="font-bold text-xs lowercase text-gray-700 dark:text-gray-200">progress</label>
                  <input className="border-2 border-black dark:border-white rounded p-2 text-sm bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 outline-none" placeholder="progress (e.g. S2E5)" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs lowercase text-gray-700 dark:text-gray-200">creator</label>
                <input
                  className="border-2 border-black dark:border-white rounded p-2 text-sm bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 outline-none"
                  placeholder="creator"
                  value={form.creator}
                  onChange={e => setForm(f => ({ ...f, creator: e.target.value }))}
                  required
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="self-end px-4 py-2 text-xs font-bold border-2 border-black dark:border-white rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 lowercase hover:bg-blue-200 hover:dark:bg-blue-800 transition-all shadow" disabled={posting}>
                {posting ? 'adding...' : 'add'}
              </button>
              {error && <span className="text-xs text-red-500 font-bold lowercase mt-1">{error}</span>}
            </form>
          )}
        </div>
      )}
      {loading ? (
        <div className="text-gray-400 lowercase">loading...</div>
      ) : !items.length ? (
        <div className="text-gray-400 lowercase">nothing currently being experienced</div>
      ) : (
        <ul className="space-y-4">
          {items.map(item => (
            <li key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="flex items-center gap-4">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded object-cover border border-black dark:border-white" />
                )}
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-lg">{toTitleCase(item.title)}</span>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    <span>{toTitleCase(item.type)}</span>
                    {item.year && <span>• {item.year}</span>}
                    {item.seasons && <span>• {item.seasons} Seasons</span>}
                    {item.progress && <span>• {item.progress}</span>}
                    <span>• {toTitleCase(item.creator)}</span>
                  </div>
                </div>
                {isOwner && (
                  <button onClick={() => handleDelete(item.id)} className="ml-auto text-xs font-bold text-red-600 lowercase hover:underline bg-transparent border-none p-0 shadow-none focus:outline-none" style={{ background: 'none', border: 'none', padding: 0 }}>
                    delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 