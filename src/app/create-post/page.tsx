'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor from '@/components/RichTextEditor';

function CreatePostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [activeDraftId, setActiveDraftId] = useState<number | null>(null);
  const [draftsList, setDraftsList] = useState<
    { id: number; title: string; category: string; updatedAt: string }[]
  >([]);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  /** Set only after a draft from the URL is successfully loaded (avoids Strict Mode / skip-fetch bug). */
  const lastLoadedDraftQueryRef = useRef<string | null>(null);
  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const [activeSearchField, setActiveSearchField] = useState<'title' | 'creator'>('title');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const creatorInputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const latestQuery = useRef('');

  // Check for user session, redirect if not logged in
  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (!res.ok) {
        router.push('/login?redirect=/create-post');
      }
    });
  }, [router]);

  async function refreshDraftsList() {
    const res = await fetch('/api/reviews/drafts');
    if (!res.ok) return;
    const data = await res.json();
    setDraftsList(data.drafts || []);
  }

  useEffect(() => {
    refreshDraftsList();
  }, []);

  const draftQuery = searchParams?.get('draft') ?? null;

  useEffect(() => {
    if (!draftQuery) {
      if (lastLoadedDraftQueryRef.current !== null) {
        setFormData({ title: '', category: 'film', creator: '', year: '', rating: '', review: '' });
        setPoster(undefined);
        setError(null);
      }
      lastLoadedDraftQueryRef.current = null;
      setActiveDraftId(null);
      return;
    }

    const num = parseInt(draftQuery, 10);
    if (Number.isNaN(num)) {
      return;
    }

    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/reviews/drafts/${num}`);
      if (!res.ok) {
        return;
      }
      const d = await res.json();
      if (cancelled) return;

      const allowed = new Set(['film', 'music', 'anime', 'books', 'other']);
      const category = allowed.has(d.category) ? d.category : 'film';

      lastLoadedDraftQueryRef.current = draftQuery;
      setActiveDraftId(d.id);
      setFormData({
        title: d.title ?? '',
        category,
        creator: d.creator ?? '',
        year: d.year != null ? String(d.year) : '',
        rating: d.rating != null ? String(d.rating) : '',
        review: d.review ?? '',
      });
      setPoster(d.imageUrl || undefined);
      setDraftNotice(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [draftQuery]);

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

  // Autofill logic for title or creator (fetch from OMDb, AniList, iTunes, Google Books)
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
          } else if (formData.category === 'other') {
            // Use the new product search API that includes food, drinks, and products
            try {
              const searchUrl = `/api/product-search?query=${encodeURIComponent(searchValue)}&category=all`;
              const searchRes = await fetch(searchUrl);
              const searchData = await searchRes.json();
              
              if (searchData.results && searchData.results.length > 0) {
                // Prioritize food/drink results over games
                const foodDrinkResults = searchData.results.filter((item: any) => 
                  item.type === 'food' || item.type === 'drink' || item.type === 'beer'
                );
                const gameResults = searchData.results.filter((item: any) => item.type === 'game');
                
                // Combine results with food/drinks first, then games
                const prioritizedResults = [...foodDrinkResults, ...gameResults];
                
                results = prioritizedResults.map((item: any) => ({
                  title: item.title,
                  creator: item.creator,
                  poster: item.poster,
                  year: item.year,
                  type: item.type,
                  description: item.description
                }));
              } else {
                // If no results from product search, try games as fallback
                try {
                  const gameUrl = `/api/giantbomb-proxy?query=${encodeURIComponent(searchValue)}`;
                  const gameRes = await fetch(gameUrl);
                  const gameData = await gameRes.json();
                  if (gameData.results) {
                    results = gameData.results.map((game: any) => ({
                      title: game.name,
                      creator: game.developer || '',
                      poster: game.image?.super_url,
                      year: game.original_release_date ? game.original_release_date.slice(0, 4) : '',
                      type: 'game'
                    }));
                  }
                } catch (fallbackError) {
                  console.error('Fallback game search also failed:', fallbackError);
                }
              }
            } catch (error) {
              console.error('Error fetching from product search API:', error);
              // Fallback to just games if the new API fails
              try {
                const gameUrl = `/api/giantbomb-proxy?query=${encodeURIComponent(searchValue)}`;
                const gameRes = await fetch(gameUrl);
                const gameData = await gameRes.json();
                if (gameData.results) {
                  results = gameData.results.map((game: any) => ({
                    title: game.name,
                    creator: game.developer || '',
                    poster: game.image?.super_url,
                    year: game.original_release_date ? game.original_release_date.slice(0, 4) : '',
                    type: 'game'
                  }));
                }
              } catch (fallbackError) {
                console.error('Fallback game search also failed:', fallbackError);
              }
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
          } else if (formData.category === 'other') {
            // Search for brands, manufacturers, and developers
            try {
              let brands: Record<string, string[]> = {};
              
              // Search for food brands using Open Food Facts
              const foodUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchValue)}&search_simple=1&action=process&json=1&page_size=10`;
              const foodRes = await fetch(foodUrl);
              const foodData = await foodRes.json();
              
              if (foodData.products) {
                foodData.products.forEach((product: any) => {
                  const brand = product.brands || product.manufacturer;
                  if (brand) {
                    if (!brands[brand]) brands[brand] = [];
                    brands[brand].push(product.product_name || product.product_name_en || 'Unknown Product');
                  }
                });
              }
              
              // Search for beer breweries using Punk API
              try {
                const beerUrl = `https://api.punkapi.com/v2/beers?beer_name=${encodeURIComponent(searchValue)}&per_page=10`;
                const beerRes = await fetch(beerUrl);
                const beerData = await beerRes.json();
                
                if (beerData && beerData.length > 0) {
                  beerData.forEach((beer: any) => {
                    const brewery = beer.brewery || 'Craft Brewery';
                    if (!brands[brewery]) brands[brewery] = [];
                    brands[brewery].push(beer.name);
                  });
                }
              } catch (error) {
                console.error('Error fetching beer breweries:', error);
              }
              
              // Search for game developers using GiantBomb
              try {
                const apiKey = "4ad067883d9d052b144b74cec0dcedb2c1c48431";
                const gameUrl = `https://www.giantbomb.com/api/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(searchValue)}&resources=game`;
                const gameRes = await fetch(gameUrl, { headers: { 'User-Agent': 'johnnywebsite' } });
                const gameData = await gameRes.json();
                
                if (gameData.results) {
                  gameData.results.forEach((game: any) => {
                    const developer = game.developer;
                    if (developer) {
                      if (!brands[developer]) brands[developer] = [];
                      brands[developer].push(game.name);
                    }
                  });
                }
              } catch (error) {
                console.error('Error fetching game developers:', error);
              }
              
              results = Object.entries(brands).map(([name, works]) => ({ 
                creator: name, 
                works: works.slice(0, 3) // Limit to 3 works per creator
              }));
            } catch (error) {
              console.error('Error searching for creators in other category:', error);
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

  async function saveDraft() {
    setSavingDraft(true);
    setDraftNotice(null);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        creator: formData.creator,
        year: formData.year,
        rating: formData.rating,
        review: formData.review,
        imageUrl: poster ?? null,
      };
      if (activeDraftId) {
        const res = await fetch(`/api/reviews/drafts/${activeDraftId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('save failed');
        setDraftNotice('draft saved');
      } else {
        const res = await fetch('/api/reviews/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('save failed');
        const d = await res.json();
        setActiveDraftId(d.id);
        router.replace(`/create-post?draft=${d.id}`);
        setDraftNotice('draft saved');
      }
      await refreshDraftsList();
    } catch {
      setDraftNotice('could not save draft');
    } finally {
      setSavingDraft(false);
    }
  }

  function startNewPost() {
    setFormData({ title: '', category: 'film', creator: '', year: '', rating: '', review: '' });
    setPoster(undefined);
    setActiveDraftId(null);
    setDraftNotice(null);
    setError(null);
    lastLoadedDraftQueryRef.current = null;
    router.replace('/create-post');
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    for (const key in formData) {
      if (key !== 'review' && formData[key as keyof typeof formData].trim() === '') {
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
      const res = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year),
          rating: parseFloat(formData.rating),
          imageUrl: poster,
          draftId: activeDraftId ?? undefined,
        }),
      });

      if (res.ok) {
        await refreshDraftsList();
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
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <h1 className="text-3xl font-black lowercase flex-1 min-w-0">create new post</h1>
        <Link
          href="/drafts"
          className="shrink-0 py-2 px-3 text-sm font-bold lowercase border-2 border-black dark:border-white bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors inline-flex items-center"
        >
          view drafts ({draftsList.length})
        </Link>
      </div>
      {draftNotice && (
        <p className="text-sm lowercase text-gray-600 dark:text-gray-300 mb-4 -mt-2">{draftNotice}</p>
      )}

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
          <input ref={titleInputRef} type="text" name="title" id="title" value={formData.title} onChange={handleChange} onKeyDown={activeSearchField === 'title' ? handleKeyDown : undefined} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" autoComplete="off" />
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
          <input ref={creatorInputRef} type="text" name="creator" id="creator" value={formData.creator} onChange={handleChange} onKeyDown={activeSearchField === 'creator' ? handleKeyDown : undefined} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" autoComplete="off" />
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
          <input type="number" name="year" id="year" value={formData.year} onChange={handleChange} placeholder="e.g. 2023" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 lowercase">rating (1-10)</label>
          <input type="number" name="rating" id="rating" value={formData.rating} onChange={handleChange} min="1" max="10" step="0.1" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white p-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div>
          <label htmlFor="review" className="block text-sm font-medium text-gray-700 dark:text-gray-300 lowercase">review</label>
          <RichTextEditor
            key={draftQuery ? `draft-${draftQuery}` : 'new-post'}
            value={formData.review}
            onChange={(val) => setFormData((f) => ({ ...f, review: val }))}
          />
        </div>

        {error && <p className="text-red-500 text-sm lowercase">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent font-bold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 lowercase disabled:opacity-50"
          >
            {isSubmitting ? 'submitting...' : 'submit review'}
          </button>
          <button
            type="button"
            onClick={saveDraft}
            disabled={savingDraft}
            className="sm:w-auto w-full flex justify-center py-2 px-4 border-2 border-black dark:border-white font-bold lowercase bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            {savingDraft ? 'saving…' : 'save draft'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-8 px-4 lowercase text-gray-500 dark:text-gray-400">loading…</div>
      }
    >
      <CreatePostForm />
    </Suspense>
  );
} 