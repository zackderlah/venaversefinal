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
  title?: string;
  creator: string;
  poster?: string;
  year?: string;
  works?: string[];
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
  const [activeSearchField, setActiveSearchField] = useState<'title' | 'creator'>('title');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const creatorInputRef = useRef<HTMLInputElement | null>(null);

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

  // Autofill logic for title or creator (fetch from OMDb, AniList, iTunes, Google Books)
  useEffect(() => {
    const searchValue = activeSearchField === 'title' ? form.title : form.creator;
    if (searchValue.length < 1) {
      setSuggestions([]);
      return;
    }
    let ignore = false;
    async function fetchSuggestions() {
      setSuggestLoading(true);
      let results: any[] = [];
      if (activeSearchField === 'title') {
        if (form.type === 'film') {
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
            if (form.creator.trim().length > 0) {
              const creatorLower = form.creator.trim().toLowerCase();
              allResults = allResults.filter((r: any) => r.creator.toLowerCase().includes(creatorLower));
            }
            results = allResults.slice(0, 3);
          }
        } else if (form.type === 'anime') {
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
            if (form.creator.trim().length > 0) {
              const creatorLower = form.creator.trim().toLowerCase();
              allResults = allResults.filter((r: any) => r.creator.toLowerCase().includes(creatorLower));
            }
            results = allResults.slice(0, 3);
          }
        } else if (form.type === 'music') {
          let url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchValue)}&entity=album,song&limit=10`;
          if (form.creator.trim().length > 0) {
            url = `https://itunes.apple.com/search?term=${encodeURIComponent(form.creator + ' ' + searchValue)}&entity=album,song&limit=10`;
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
            if (form.creator.trim().length > 0) {
              const creatorLower = form.creator.trim().toLowerCase();
              allResults = allResults.filter((r: any) => r.creator.toLowerCase().includes(creatorLower));
            }
            results = allResults.slice(0, 3);
          }
        } else if (form.type === 'book') {
          let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchValue)}&maxResults=10`;
          if (form.creator.trim().length > 0) {
            url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(searchValue)}+inauthor:${encodeURIComponent(form.creator)}&maxResults=10`;
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
            if (form.creator.trim().length > 0) {
              const creatorLower = form.creator.trim().toLowerCase();
              allResults = allResults.filter((r: any) => r.creator.toLowerCase().includes(creatorLower));
            }
            results = allResults.slice(0, 3);
          }
        }
      } else if (activeSearchField === 'creator') {
        if (form.type === 'film') {
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
        } else if (form.type === 'music') {
          const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchValue)}&entity=musicArtist&limit=5`);
          const data = await res.json();
          if (data.results) {
            results = data.results.map((m: any) => ({ creator: m.artistName }));
          }
        } else if (form.type === 'book') {
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
        } else if (form.type === 'anime') {
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
  }, [form.title, form.creator, form.type, activeSearchField]);

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
        setForm(f => ({
          ...f,
          title: toTitleCase(m.title || ''),
          creator: toTitleCase(m.creator || ''),
          year: m.year || '',
          seasons: '',
          progress: '',
        }));
        setPoster(m.poster || undefined);
        setTimeout(() => { titleInputRef.current?.blur(); }, 0);
      } else if (activeSearchField === 'creator') {
        setForm(f => ({
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
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs lowercase text-gray-700 dark:text-gray-200">title</label>
                <input
                  ref={titleInputRef}
                  className="border-2 border-black dark:border-white rounded p-2 text-sm bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 outline-none"
                  placeholder="title"
                  value={form.title}
                  onChange={e => {
                    setForm(f => ({ ...f, title: e.target.value }));
                    setPoster(undefined);
                    setActiveSearchField('title');
                  }}
                  onKeyDown={activeSearchField === 'title' ? handleKeyDown : undefined}
                  required
                  autoComplete="off"
                />
                {activeSearchField === 'title' && suggestLoading && <div className="text-xs text-gray-400">searching...</div>}
                {activeSearchField === 'title' && suggestions.length > 0 && (
                  <ul ref={dropdownRef} className="bg-white dark:bg-[#18181b] border border-gray-300 dark:border-gray-700 rounded shadow absolute z-10 mt-10 max-h-48 overflow-y-auto w-80">
                    {suggestions.map((m, i) => (
                      <li
                        key={(m.title ?? '') + i}
                        className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900${highlightedIndex === i ? ' bg-blue-100 dark:bg-blue-900' : ''}`}
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
                          setTimeout(() => { titleInputRef.current?.blur(); }, 0);
                        }}
                      >
                        {m.poster && <img src={m.poster} alt={m.title ?? ''} className="w-8 h-8 rounded object-cover border border-gray-300" />}
                        <span className="font-bold">{toTitleCase(m.title ?? '')}</span>
                        {m.year && <span className="ml-2 text-gray-400">({m.year})</span>}
                        <span className="ml-2 text-gray-500">by {m.creator ? toTitleCase(m.creator) : 'unknown'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs lowercase text-gray-700 dark:text-gray-200">creator</label>
                <input
                  ref={creatorInputRef}
                  className="border-2 border-black dark:border-white rounded p-2 text-sm bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 outline-none"
                  placeholder="creator"
                  value={form.creator}
                  onChange={e => {
                    setForm(f => ({ ...f, creator: e.target.value }));
                    setActiveSearchField('creator');
                  }}
                  onKeyDown={activeSearchField === 'creator' ? handleKeyDown : undefined}
                  required
                  autoComplete="off"
                />
                {activeSearchField === 'creator' && suggestLoading && <div className="text-xs text-gray-400">searching...</div>}
                {activeSearchField === 'creator' && suggestions.length > 0 && (
                  <ul ref={dropdownRef} className="bg-white dark:bg-[#18181b] border border-gray-300 dark:border-gray-700 rounded shadow absolute z-10 mt-2 max-h-48 overflow-y-auto w-80">
                    {suggestions.map((m, i) => (
                      <li
                        key={m.creator + i}
                        className={`flex flex-col gap-1 px-3 py-2 text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900${highlightedIndex === i ? ' bg-blue-100 dark:bg-blue-900' : ''}`}
                        onClick={() => {
                          setForm(f => ({
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