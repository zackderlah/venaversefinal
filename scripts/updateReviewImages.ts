import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const OMDB_API_KEY = '3c1416fe';

async function fetchFilmPoster(title: string, year: number): Promise<string | null> {
  try {
    const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&y=${encodeURIComponent(year)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.Poster && data.Poster !== 'N/A') {
      return data.Poster;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching OMDb for ${title} (${year}):`, err);
    return null;
  }
}

async function fetchMusicCover(title: string, creator: string): Promise<string | null> {
  try {
    const mbUrl = `https://musicbrainz.org/ws/2/release/?query=release:${encodeURIComponent(title)}%20AND%20artist:${encodeURIComponent(creator)}&fmt=json&limit=1`;
    const mbRes = await fetch(mbUrl, { headers: { 'User-Agent': 'johnnywebsite/1.0.0 ( email@example.com )' } });
    const mbData = await mbRes.json();
    if (mbData.releases && mbData.releases.length > 0) {
      const release = mbData.releases[0];
      if (release.id) {
        const caaUrl = `https://coverartarchive.org/release/${release.id}/front-250`;
        const caaRes = await fetch(caaUrl);
        if (caaRes.ok) {
          return caaUrl;
        }
      }
    }
    return null;
  } catch (err) {
    console.error(`Error fetching MusicBrainz/CAA for ${title} by ${creator}:`, err);
    return null;
  }
}

async function fetchBookCover(title: string, creator: string): Promise<string | null> {
  try {
    const olUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(creator)}&limit=1`;
    const olRes = await fetch(olUrl);
    const olData = await olRes.json();
    if (olData.docs && olData.docs.length > 0) {
      const doc = olData.docs[0];
      if (doc.cover_i) {
        return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      }
    }
    return null;
  } catch (err) {
    console.error(`Error fetching Open Library for ${title} by ${creator}:`, err);
    return null;
  }
}

async function fetchAnimeCover(title: string): Promise<string | null> {
  try {
    const query = `query ($search: String) { Media(search: $search, type: ANIME) { coverImage { large } } }`;
    const variables = { search: title };
    const anilistRes = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const anilistData = await anilistRes.json();
    if (anilistData.data && anilistData.data.Media && anilistData.data.Media.coverImage && anilistData.data.Media.coverImage.large) {
      return anilistData.data.Media.coverImage.large;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching AniList for ${title}:`, err);
    return null;
  }
}

async function main() {
  // Print all anime and book reviews with their imageUrl
  const animeBookReviews = await prisma.review.findMany({
    where: {
      OR: [
        { category: 'anime' },
        { category: 'books' },
      ],
    },
  });
  console.log('Current anime and book reviews with imageUrl:');
  for (const review of animeBookReviews) {
    console.log(`#${review.id} [${review.category}] ${review.title} - imageUrl: ${review.imageUrl}`);
  }

  // Force re-fetch and overwrite imageUrl for all anime and book reviews
  for (const review of animeBookReviews) {
    let imageUrl: string | null = null;
    if (review.category === 'books') {
      imageUrl = await fetchBookCover(review.title, review.creator);
    } else if (review.category === 'anime') {
      imageUrl = await fetchAnimeCover(review.title);
    }
    if (imageUrl) {
      await prisma.review.update({
        where: { id: review.id },
        data: { imageUrl },
      });
      console.log(`Updated review #${review.id} (${review.title}) with image: ${imageUrl}`);
    } else {
      console.warn(`No image found for ${review.title} (${review.category}).`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect()); 