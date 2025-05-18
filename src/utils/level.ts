export function calculateUserXPAndLevel(reviews: { review: string }[]) {
  let xp = 0;
  for (const r of reviews) {
    const wordCount = r.review.trim().split(/\s+/).length;
    xp += wordCount < 50 ? 50 : 100;
  }
  const level = Math.floor(xp / 100);
  return { xp, level };
} 