import { NextRequest, NextResponse } from 'next/server';
import { searchVideogames } from '@/lib/videogameSearch';

export const dynamic = 'force-dynamic';

/**
 * GET /api/videogames?query=...
 * Video game search (IGDB when IGDB_CLIENT_ID + IGDB_CLIENT_SECRET, else RAWG, else GiantBomb).
 * Response: { results: { name, developer, image: { super_url }, original_release_date }[] }
 */
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query');
  if (!query?.trim()) {
    return NextResponse.json({ error: 'Missing query parameter', results: [] }, { status: 400 });
  }

  try {
    const results = await searchVideogames(query);
    return NextResponse.json(
      { results },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (e) {
    console.error('[api/videogames]', e);
    return NextResponse.json({ error: 'Search failed', results: [] }, { status: 500 });
  }
}
