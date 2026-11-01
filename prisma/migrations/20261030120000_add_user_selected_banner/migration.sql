-- Profile banner chosen by the user (an id from src/data/banners.ts, e.g. "music-4").
ALTER TABLE "User" ADD COLUMN "selectedBanner" VARCHAR(64);
