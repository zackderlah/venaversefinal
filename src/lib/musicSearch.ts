// Album search backed by the iTunes Search API, with MusicBrainz / Cover Art Archive as a cover fallback.

export interface AlbumResult {
  title: string;
  creator: string;
  poster?: string;
  year: string;
}

interface ItunesItem {
  collectionId?: number;
  collectionName?: string;
  artistName?: string;
  artworkUrl100?: string;
  releaseDate?: string;
  collectionReleaseDate?: string;
}

const MAX_RESULTS = 6;

/** Lowercase and drop "(Deluxe Edition)", "[Remastered]" and a trailing "- Single"/"- EP". */
function normalizeTitle(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*[-–]\s*(single|ep)\s*$/, '')
    .replace(/\s*[([][^)\]]*[)\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchScore(albumName: string, query: string): number {
  const name = normalizeTitle(albumName);
  const q = normalizeTitle(query);
  if (!q) return 3;
  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (name.includes(q)) return 2;
  return 3;
}

async function itunes(term: string, entity: 'album' | 'song', limit: number): Promise<ItunesItem[]> {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entity}&limit=${limit}`,
  );
  const data = await res.json();
  return Array.isArray(data.results) ? data.results : [];
}

/**
 * Finds albums, not songs. iTunes' album index alone can miss well-known albums, while a song
 * search returns their tracks first, so albums are collected from both and merged.
 */
export async function searchAlbums(title: string, creator = ''): Promise<AlbumResult[]> {
  const creatorTrimmed = creator.trim();
  const term = creatorTrimmed ? `${creatorTrimmed} ${title}` : title;

  const [songs, albums] = await Promise.all([
    itunes(term, 'song', 50).catch(() => []),
    itunes(term, 'album', 25).catch(() => []),
  ]);

  // Albums implied by song results come first (iTunes ranks the best match's tracks first),
  // then any album-index results not already seen.
  const byId = new Map<string, ItunesItem>();
  for (const item of [...songs, ...albums]) {
    if (!item.collectionName || !item.artistName) continue;
    const key = String(item.collectionId ?? `${item.collectionName}|${item.artistName}`);
    if (!byId.has(key)) byId.set(key, item);
  }

  let merged = Array.from(byId.values());
  if (creatorTrimmed) {
    const creatorLower = creatorTrimmed.toLowerCase();
    merged = merged.filter(r => r.artistName!.toLowerCase().includes(creatorLower));
  }

  const ranked = merged
    .map((item, index) => ({
      item,
      index,
      score: matchScore(item.collectionName!, title),
      isShortRelease: /[-–]\s*(single|ep)\s*$/i.test(item.collectionName!) ? 1 : 0,
    }))
    .sort((a, b) => a.score - b.score || a.isShortRelease - b.isShortRelease || a.index - b.index)
    .slice(0, MAX_RESULTS);

  const results: AlbumResult[] = ranked.map(({ item }) => {
    const date = item.collectionReleaseDate || item.releaseDate || '';
    return {
      title: item.collectionName!,
      creator: item.artistName!,
      poster: item.artworkUrl100,
      year: date.slice(0, 4),
    };
  });

  // Cover Art Archive fallback when iTunes has no artwork.
  await Promise.all(
    results
      .filter(r => !r.poster)
      .map(async r => {
        try {
          const mbUrl = `https://musicbrainz.org/ws/2/release/?query=release:${encodeURIComponent(r.title)}%20AND%20artist:${encodeURIComponent(r.creator)}&fmt=json&limit=1`;
          const mbRes = await fetch(mbUrl, { headers: { 'User-Agent': 'johnnywebsite/1.0.0 ( email@example.com )' } });
          const mbData = await mbRes.json();
          const id = mbData.releases?.[0]?.id;
          if (!id) return;
          const caaUrl = `https://coverartarchive.org/release/${id}/front-250`;
          if ((await fetch(caaUrl)).ok) r.poster = caaUrl;
        } catch {}
      }),
  );

  return results;
}
