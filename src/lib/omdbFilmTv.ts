const OMDB_KEY = '3c1416fe';

type OmdbSearchHit = { imdbID: string; Title: string; Year: string; Type?: string };

/**
 * Merge OMDb search hits for film + TV autocomplete.
 * Order matters: an `s=&type=movie` search lists only movies, so putting those first
 * hid TV hits behind irrelevant title-matches (e.g. "The Office" → ten obscure "Office" movies before the series).
 * We lead with OMDb's untyped `s=` ranking (mixed movies + series), then append typed series, then typed movies.
 */
export async function omdbSearchFilmAndTv(searchValue: string): Promise<OmdbSearchHit[]> {
  const base = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&s=${encodeURIComponent(searchValue)}`;
  const [mixedData, seriesData, movieData] = await Promise.all([
    fetch(base).then((r) => r.json()),
    fetch(`${base}&type=series`).then((r) => r.json()),
    fetch(`${base}&type=movie`).then((r) => r.json()),
  ]);
  const ordered: OmdbSearchHit[] = [];
  const seen = new Set<string>();
  const pushHits = (data: { Search?: OmdbSearchHit[] }) => {
    if (!data?.Search || !Array.isArray(data.Search)) return;
    for (const m of data.Search) {
      if (m.Type === 'episode') continue;
      if (m?.imdbID && !seen.has(m.imdbID)) {
        seen.add(m.imdbID);
        ordered.push(m);
      }
    }
  };
  pushHits(mixedData);
  pushHits(seriesData);
  pushHits(movieData);
  return ordered.slice(0, 30);
}

export async function omdbDetailById(imdbID: string) {
  const detailRes = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${imdbID}`);
  return detailRes.json();
}

/** Creator field for reviews: director for movies; writer or director for series. */
export function omdbCreatorLine(detail: { Type?: string; Director?: string; Writer?: string }): string {
  if (detail.Type === 'series') {
    return (detail.Writer || detail.Director || '').trim();
  }
  return (detail.Director || '').trim();
}

/**
 * Creator-field search: OMDb `s=` is title search; we scan hits and aggregate people credits (movies + series).
 */
export async function omdbCreatorSuggestFilmTv(searchValue: string): Promise<{ name: string; works: string[] }[]> {
  const peopleToWorks: Record<string, string[]> = {};
  const addCredits = (credits: string | undefined, title: string) => {
    if (!credits) return;
    credits.split(',').forEach((piece: string) => {
      const name = piece.trim().replace(/\(.*?\)/g, '').trim();
      if (!name) return;
      if (!peopleToWorks[name]) peopleToWorks[name] = [];
      peopleToWorks[name].push(title);
    });
  };
  for (const typ of ['movie', 'series'] as const) {
    const res = await fetch(
      `https://www.omdbapi.com/?apikey=${OMDB_KEY}&s=${encodeURIComponent(searchValue)}&type=${typ}`
    );
    const data = await res.json();
    if (!data?.Search) continue;
    const slice = data.Search.slice(0, 10);
    const details = await Promise.all(
      slice.map(async (m: { imdbID: string; Title: string }) => {
        const detail = await omdbDetailById(m.imdbID);
        return { detail, title: m.Title as string };
      })
    );
    for (const { detail, title } of details) {
      const line = typ === 'series' ? detail.Writer || detail.Director : detail.Director;
      addCredits(line, title);
    }
  }
  return Object.entries(peopleToWorks).map(([name, works]) => ({ name, works }));
}
