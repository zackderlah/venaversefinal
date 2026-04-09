import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { firstVideogameCoverImageUrl } from '@/lib/videogameSearch';
import { isRatingProvided, parseFiveStarRating } from '@/lib/starRating';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.error('No session or user found');
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }

    const {
      title,
      category,
      creator,
      year: yearStr,
      rating: ratingStr,
      review,
      imageUrl: clientImageUrl,
      draftId: draftIdRaw,
    } = await req.json();
    console.log('Received review creation request:', { title, category, creator, yearStr, ratingStr, review, clientImageUrl });
    console.log('Category debugging:', { 
      category, 
      categoryType: typeof category, 
      categoryLength: category?.length,
      categoryCharCodes: category?.split('').map((c: string) => c.charCodeAt(0)),
      trimmedCategory: category?.trim(),
      trimmedLength: category?.trim()?.length
    });

    // Validate input
    if (!title || !category || !creator || !yearStr || !isRatingProvided(ratingStr)) {
      return NextResponse.json({ message: 'all fields except review are required' }, { status: 400 });
    }

    const year = parseInt(yearStr as string);
    const parsedRating = parseFiveStarRating(ratingStr);

    if (isNaN(year) || String(yearStr).length !== 4) {
      return NextResponse.json({ message: 'invalid year format' }, { status: 400 });
    }
    if (!parsedRating.ok) {
      return NextResponse.json({ message: parsedRating.message }, { status: 400 });
    }
    const rating = parsedRating.value;
    let normalizedCategory = (category === 'album' ? 'music' : category).trim();
    const allowedCategories = ['film', 'music', 'anime', 'books', 'games', 'other'];
    console.log('Category validation debugging:', {
      originalCategory: category,
      normalizedCategory,
      allowedCategories,
      isIncluded: allowedCategories.includes(normalizedCategory),
      exactMatches: allowedCategories.map(cat => ({ category: cat, matches: cat === normalizedCategory }))
    });
    if (!allowedCategories.includes(normalizedCategory)) {
      return NextResponse.json({ message: 'invalid category' }, { status: 400 });
    }

    let imageUrl: string | undefined = clientImageUrl;
    if (!imageUrl) {
      if (normalizedCategory === 'film') {
        try {
          const omdbRes = await fetch(`https://www.omdbapi.com/?apikey=3c1416fe&t=${encodeURIComponent(title)}&y=${encodeURIComponent(year)}`);
          const omdbData = await omdbRes.json();
          if (omdbData && omdbData.Poster && omdbData.Poster !== 'N/A') {
            imageUrl = omdbData.Poster;
          }
        } catch (err) {
          console.error('OMDb fetch error:', err);
        }
      }
      // Music cover fetching via MusicBrainz + Cover Art Archive
      if (normalizedCategory === 'music') {
        try {
          const mbUrl = `https://musicbrainz.org/ws/2/release/?query=release:${encodeURIComponent(title)}%20AND%20artist=${encodeURIComponent(creator)}&fmt=json&limit=1`;
          const mbRes = await fetch(mbUrl, { headers: { 'User-Agent': 'johnnywebsite/1.0.0 ( email@example.com )' } });
          const mbData = await mbRes.json();
          if (mbData.releases && mbData.releases.length > 0) {
            const release = mbData.releases[0];
            if (release.id) {
              const caaUrl = `https://coverartarchive.org/release/${release.id}/front-250`;
              const caaRes = await fetch(caaUrl);
              if (caaRes.ok) {
                imageUrl = caaUrl;
              }
            }
          }
        } catch (err) {
          console.error('MusicBrainz/CAA fetch error:', err);
        }
      }
      // Book cover fetching via Open Library
      if (normalizedCategory === 'books') {
        try {
          const olUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(creator)}&limit=1`;
          const olRes = await fetch(olUrl);
          const olData = await olRes.json();
          if (olData.docs && olData.docs.length > 0) {
            const doc = olData.docs[0];
            if (doc.cover_i) {
              imageUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
            }
          }
        } catch (err) {
          console.error('Open Library fetch error:', err);
        }
      }
      // Game cover: RAWG (if RAWG_API_KEY) + GiantBomb fallback via videogameSearch
      if (normalizedCategory === 'games') {
        try {
          const cover = await firstVideogameCoverImageUrl(title);
          if (cover) imageUrl = cover;
        } catch (err) {
          console.error('Videogame cover fetch error:', err);
        }
      }
      // Anime cover fetching via AniList
      if (normalizedCategory === 'anime') {
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
            imageUrl = anilistData.data.Media.coverImage.large;
          }
        } catch (err) {
          console.error('AniList fetch error:', err);
        }
      }
    }

    const newReview = await prisma.review.create({
      data: {
        title,
        category: normalizedCategory,
        creator,
        year,
        rating,
        review,
        date: new Date(),
        userId: Number(session.user.id),
        imageUrl,
      },
      include: {
        user: {
          select: { username: true }
        }
      }
    });
    console.log('Review created in database:', newReview);

    if (draftIdRaw != null && draftIdRaw !== '') {
      const draftId = Number(draftIdRaw);
      if (!Number.isNaN(draftId)) {
        await prisma.reviewDraft.deleteMany({
          where: { id: draftId, userId: Number(session.user.id) },
        });
      }
    }

    return NextResponse.json(newReview, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'error creating review' }, { status: 500 });
  }
} 