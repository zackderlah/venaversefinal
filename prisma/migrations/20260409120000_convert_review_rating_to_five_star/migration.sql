-- Convert legacy 1–10 scores to a 5-star scale (0.5 steps), clamped to [0.5, 5].
-- Safe to run once on databases that still store the old scale.

UPDATE "Review"
SET rating = GREATEST(
  0.5::double precision,
  LEAST(
    5.0::double precision,
    (ROUND((rating::numeric / 2.0) * 2) / 2.0)::double precision
  )
);

UPDATE "ReviewDraft"
SET rating = regexp_replace(
  trim(
    to_char(
      GREATEST(
        0.5::numeric,
        LEAST(
          5::numeric,
          ROUND((BTRIM(rating)::numeric / 2.0) * 2) / 2.0
        )
      ),
      'FM999999990.9'
    )
  ),
  '\.$',
  ''
)
WHERE BTRIM(rating) <> ''
  AND BTRIM(rating) ~ '^[0-9]+(\.[0-9]+)?$';
