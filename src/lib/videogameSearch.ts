/**
 * Video game metadata search: IGDB (Twitch credentials) → RAWG → GiantBomb.
 * Response shape matches the legacy giantbomb-proxy format for UI compatibility.
 */

const RAWG_BASE = 'https://api.rawg.io/api';
const IGDB_GAMES_URL = 'https://api.igdb.com/v4/games';
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';

let igdbTokenCache: { token: string; expiresAtMs: number } | null = null;

/** Same shape as GiantBomb proxy results used by create-post / edit forms */
export type VideogameSearchHit = {
  name: string;
  developer: string;
  image?: { super_url?: string };
  original_release_date?: string;
};

const GB_USER_AGENT = 'johnnywebsite/1.0';
/** RAWG rejects requests without a descriptive User-Agent (see https://api.rawg.io/docs/) */
const RAWG_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'venaverse/1.0 (https://venaverse.net)',
} as const;

function giantBombKey(): string {
  return process.env.GIANTBOMB_API_KEY?.trim() ?? '';
}

function igdbCreds(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.IGDB_CLIENT_ID?.trim();
  const clientSecret = process.env.IGDB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

/** Apicalypse search string must not contain unescaped double quotes */
function igdbSearchPhrase(query: string): string {
  return query.replace(/"/g, ' ').trim();
}

async function getIgdbAccessToken(): Promise<string | null> {
  const creds = igdbCreds();
  if (!creds) return null;

  const now = Date.now();
  if (igdbTokenCache && now < igdbTokenCache.expiresAtMs - 60_000) {
    return igdbTokenCache.token;
  }

  try {
    const body = new URLSearchParams({
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      grant_type: 'client_credentials',
    });
    const res = await fetch(TWITCH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) return null;

    const expiresInSec = typeof data.expires_in === 'number' ? data.expires_in : 3600;
    igdbTokenCache = {
      token: data.access_token,
      expiresAtMs: now + expiresInSec * 1000,
    };
    return igdbTokenCache.token;
  } catch {
    return null;
  }
}

function developerFromIgdbGame(g: any): string {
  const ic = g.involved_companies;
  if (!Array.isArray(ic)) return '';
  for (const row of ic) {
    if (row?.developer && row?.company?.name) return String(row.company.name);
  }
  for (const row of ic) {
    if (row?.company?.name) return String(row.company.name);
  }
  return '';
}

function coverUrlFromIgdb(cover: { url?: string } | undefined): string | undefined {
  const u = cover?.url;
  if (!u || typeof u !== 'string') return undefined;
  if (u.startsWith('//')) return `https:${u}`;
  return u;
}

function releaseDateFromIgdbUnix(sec: unknown): string {
  if (typeof sec !== 'number' || !Number.isFinite(sec)) return '';
  try {
    return new Date(sec * 1000).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

async function searchIgdb(query: string): Promise<VideogameSearchHit[]> {
  const creds = igdbCreds();
  if (!creds) return [];

  const phrase = igdbSearchPhrase(query);
  if (!phrase) return [];

  try {
    const token = await getIgdbAccessToken();
    if (!token) return [];

    const apicalypse = [
      `search "${phrase.replace(/\\/g, ' ')}";`,
      'fields name,first_release_date,cover.url,involved_companies.developer,involved_companies.company.name;',
      'limit 8;',
    ].join('\n');

    const res = await fetch(IGDB_GAMES_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Client-ID': creds.clientId,
        Authorization: `Bearer ${token}`,
      },
      body: apicalypse,
      cache: 'no-store',
    });
    if (!res.ok) return [];

    const parsed: unknown = await res.json();
    const games: any[] = Array.isArray(parsed) ? parsed : [];

    return games
      .slice(0, 8)
      .map((g: any) => ({
        name: String(g.name ?? '').trim(),
        developer: developerFromIgdbGame(g),
        image: { super_url: coverUrlFromIgdb(g.cover) },
        original_release_date: releaseDateFromIgdbUnix(g.first_release_date),
      }))
      .filter((h) => h.name.length > 0);
  } catch {
    return [];
  }
}

async function searchRawg(query: string): Promise<VideogameSearchHit[]> {
  const key = process.env.RAWG_API_KEY?.trim();
  if (!key) return [];

  try {
    // List endpoint only (no N+1 detail calls) — avoids rate limits / thrown errors breaking all suggestions
    const searchUrl = `${RAWG_BASE}/games?search=${encodeURIComponent(query)}&page_size=10&key=${encodeURIComponent(key)}`;
    const searchRes = await fetch(searchUrl, { cache: 'no-store', headers: RAWG_HEADERS });
    if (!searchRes.ok) return [];

    const data = await searchRes.json();
    const games: any[] = Array.isArray(data.results) ? data.results : [];

    return games.slice(0, 8).map((g: any) => ({
      name: g.name,
      developer:
        g.developers?.[0]?.name ||
        g.publishers?.[0]?.name ||
        '',
      image: { super_url: g.background_image || undefined },
      original_release_date: g.released || '',
    }));
  } catch {
    return [];
  }
}

async function searchGiantBomb(query: string): Promise<VideogameSearchHit[]> {
  const apiKey = giantBombKey();
  if (!apiKey) return [];

  try {
    const url = `https://www.giantbomb.com/api/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(query)}&resources=game`;
    const gbRes = await fetch(url, { headers: { 'User-Agent': GB_USER_AGENT }, cache: 'no-store' });
    if (!gbRes.ok) return [];

    const data = await gbRes.json();
    if (!data.results?.length) return [];

    const detailedResults = await Promise.all(
      data.results.slice(0, 5).map(async (game: any) => {
        let developer = '';
        if (game.api_detail_url) {
          try {
            const sep = game.api_detail_url.includes('?') ? '&' : '?';
            const detailRes = await fetch(`${game.api_detail_url}${sep}api_key=${apiKey}&format=json`, {
              headers: { 'User-Agent': GB_USER_AGENT },
              cache: 'no-store',
            });
            if (!detailRes.ok) {
              return {
                name: game.name,
                developer,
                image: { super_url: game.image?.super_url },
                original_release_date: game.original_release_date || '',
              };
            }
            const detailData = await detailRes.json();
            if (detailData.results?.developers?.[0]?.name) {
              developer = detailData.results.developers[0].name;
            }
          } catch {
            /* ignore */
          }
        }
        return {
          name: game.name,
          developer,
          image: { super_url: game.image?.super_url },
          original_release_date: game.original_release_date || '',
        };
      })
    );

    return detailedResults;
  } catch {
    return [];
  }
}

/** IGDB (Twitch) → RAWG → GiantBomb when each is configured / returns hits. */
export async function searchVideogames(query: string): Promise<VideogameSearchHit[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const igdb = await searchIgdb(q);
    if (igdb.length > 0) return igdb;

    const rawg = await searchRawg(q);
    if (rawg.length > 0) return rawg;

    return await searchGiantBomb(q);
  } catch {
    return [];
  }
}

/** First matching cover image URL for server-side review creation. */
export async function firstVideogameCoverImageUrl(title: string): Promise<string | undefined> {
  const hits = await searchVideogames(title);
  for (const h of hits) {
    const url = h.image?.super_url;
    if (url) return url;
  }
  return undefined;
}
