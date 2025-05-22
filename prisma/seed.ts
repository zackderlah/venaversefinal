import { PrismaClient } from '../src/generated/prisma/client';
import { reviews as staticReviews } from '../src/data/reviews';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Ensure user 'johnny' exists
  const password = await bcrypt.hash('password123', 10);
  let johnny = await prisma.user.findUnique({ where: { username: 'johnny' } });
  if (!johnny) {
    johnny = await prisma.user.create({
      data: { 
        username: 'johnny', 
        password,
        email: 'johnny@example.com'
      },
    });
  }

  // Ensure user 'admin' exists with admin privileges
  const adminPassword = await bcrypt.hash('God23dude', 10);
  let admin = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: adminPassword,
        email: 'admin@example.com',
        isAdmin: true,
      },
    });
  } else {
    // Update password and ensure admin privileges if user already exists
    await prisma.user.update({
      where: { username: 'admin' },
      data: { password: adminPassword, isAdmin: true },
    });
  }

  // Insert reviews
  const categoryMap: Record<string, string> = { manga: 'books', album: 'music' };
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