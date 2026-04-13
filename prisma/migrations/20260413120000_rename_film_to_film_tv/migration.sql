-- Unify "film" (and profile "tv") into stored category film-tv
UPDATE "Review" SET "category" = 'film-tv' WHERE "category" = 'film';
UPDATE "ReviewDraft" SET "category" = 'film-tv' WHERE "category" = 'film';
UPDATE "User" SET "selectedTitleCategory" = 'film-tv' WHERE "selectedTitleCategory" = 'film';
UPDATE "CurrentlyExperiencing" SET "type" = 'film-tv' WHERE "type" IN ('film', 'tv');
