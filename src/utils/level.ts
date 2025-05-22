export function calculateUserXPAndLevel(reviews: { review: string }[]) {
  let xp = 0;
  for (const r of reviews) {
    const wordCount = r.review.trim().split(/\s+/).length;
    // 50 XP minimum, +50 XP for each additional 50 words, up to 500 XP
    const reviewXP = Math.min(50 + Math.floor(wordCount / 50) * 50, 500);
    xp += reviewXP;
  }
  const level = Math.floor(xp / 100);
  return { xp, level };
} 