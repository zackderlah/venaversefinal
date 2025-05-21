import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.error('No session or user found');
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }

    const { title, category, creator, year: yearStr, rating: ratingStr, review, imageUrl: clientImageUrl } = await req.json();
    console.log('Received review creation request:', { title, category, creator, yearStr, ratingStr, review, clientImageUrl });

    // Validate input
    if (!title || !category || !creator || !yearStr || !ratingStr) {
      return NextResponse.json({ message: 'all fields except review are required' }, { status: 400 });
    }

    const year = parseInt(yearStr as string);
    const rating = parseFloat(ratingStr as string);

    if (isNaN(year) || String(yearStr).length !== 4) {
      return NextResponse.json({ message: 'invalid year format' }, { status: 400 });
    }
    if (isNaN(rating) || rating < 1 || rating > 10) {
      return NextResponse.json({ message: 'rating must be between 1 and 10' }, { status: 400 });
    }
    const allowedCategories = ['film', 'music', 'anime', 'books'];
    if (!allowedCategories.includes(category)) {
      return NextResponse.json({ message: 'invalid category' }, { status: 400 });
    }

    let imageUrl: string | undefined = clientImageUrl;
    if (!imageUrl) {
      if (category === 'film') {
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
      if (category === 'music') {
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
      if (category === 'books') {
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
      // Anime cover fetching via AniList
      if (category === 'anime') {
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
        category,
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

    return NextResponse.json(newReview, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'error creating review' }, { status: 500 });
  }
} 