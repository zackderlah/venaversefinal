const { PrismaClient } = require('../src/generated/prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const staticReviews = [
  {
    id: '1',
    title: 'Eternal Sunshine of the Spotless Mind',
    category: 'film',
    creator: 'Michel Gondry',
    year: 2004,
    rating: 9,
    review: '',
    date: '2025-05-13',
  },
  {
    id: '2',
    title: 'Loveless',
    category: 'album',
    creator: 'My Bloody Valentine',
    year: 1991,
    rating: 10,
    review: `I was 19 years old when my friends sucker punched me with Only Shallow for the first time.  We were drinking and ripping nangs in their sharehouse in one of the bedrooms - it was a pretty ethereal moment for me. I couldn't tell if I loved or hated it, but it was nothing like I'd heard before at the time. One thing I did know for sure, was that I couldn't stop thinking about it - the intense whirring of the guitar and haunting vocals had been etched into my mind. I remember listening to the rest of the album shortly after, as it became obvious I was listening to a masterpiece. Loveless is the landmark album for shoegaze. It is hypnotic, emotionally intimate, and evokes a particularly nostalgic mood in me with each listen. Nothing has come close to Loveless's power, and I fear nothing will in my lifetime. Kevin Shields is the goat, and I'm positive his monstrous power will annihilate me when I watch mbv perform live.`,
    date: '2025-05-13',
  },
  {
    id: '3',
    title: 'Neon Genesis Evangelion',
    category: 'anime',
    creator: 'Hideaki Anno',
    year: 1995,
    rating: 8.5,
    review: '',
    date: '2025-05-13',
  },
  {
    id: '4',
    title: 'Berserk',
    category: 'manga',
    creator: 'Kentaro Miura',
    year: 1989,
    rating: 9,
    review: '',
    date: '2025-05-13',
  },
  {
    id: '5',
    title: 'The Banshees of Inisherin',
    category: 'film',
    creator: 'Martin McDonagh',
    year: 2022,
    rating: 8.5,
    review: '',
    date: '2025-05-13',
  },
  {
    id: '6',
    title: 'Prison School',
    category: 'anime',
    creator: 'Tsutomu Mizushima',
    year: 2015,
    rating: 9.5,
    review: 'Easily the funniest anime I have seen. Absurd and over the top show with ridiculous yet incredibly relatable male characters who had me in tears basically the entire time. The underground student council girls are all sexy and waifu material as fuck. The animation is disgustingly good and unexpected for a show of its nature. Watched initially as a teen, but was a more enjoyable rewatch as a young adult with the bros.',
    date: '2025-05-13',
  },
  {
    id: '7',
    title: 'Ping Pong the Animation',
    category: 'anime',
    creator: 'Masaaki Yuasa',
    year: 2014,
    rating: 10,
    review: 'My all time favourite. I watch ping pong every single year, specifically around Christmas time, so I can sync it up with the Christmas eve song in episode 6. This show touches my heart deeply in various, almost inexplainable ways. I suppose it could be the wonderful character development, complimented by immersive storytelling through Yuasa Masaaki\'s unique animation. Or maybe it\'s the perfectly constructed sound track by Kensuke Ushio. Unsurprisingly, after showing my friends this show, we played table tennis everyday for 6 months straight. Ping Pong the Animation is a lesser known masterpiece, which I will continue rewatching often until the day I die.',
    date: '2025-05-14',
  },
];

async function main() {
  // Ensure user 'johnny' exists
  const password = await bcrypt.hash('God23dude', 10);
  let johnny = await prisma.user.findUnique({ where: { username: 'johnny' } });
  if (!johnny) {
    johnny = await prisma.user.create({
      data: { username: 'johnny', password },
    });
  } else {
    // Update password if user already exists
    await prisma.user.update({
      where: { username: 'johnny' },
      data: { password },
    });
  }

  // Insert reviews
  const categoryMap = { manga: 'books', album: 'music' };
  for (const r of staticReviews) {
    // Check if review already exists (by title and user)
    const exists = await prisma.review.findFirst({
      where: { title: r.title, userId: johnny.id },
    });
    if (!exists) {
      await prisma.review.create({
        data: {
          title: r.title,
          category: categoryMap[r.category] || r.category,
          creator: r.creator,
          year: r.year,
          rating: Math.round(r.rating),
          review: r.review,
          date: new Date(r.date),
          imageUrl: r.imageUrl || null,
          userId: johnny.id,
        },
      });
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 