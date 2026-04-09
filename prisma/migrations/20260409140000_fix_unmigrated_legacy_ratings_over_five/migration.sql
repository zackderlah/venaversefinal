-- Rows still on the old 1–10 scale store values in (5, 10] (e.g. 9). Convert only those,
-- so already-migrated half-star values (e.g. 4.5) are not touched.

UPDATE "Review"
SET rating = GREATEST(
  0.5::double precision,
  LEAST(
    5.0::double precision,
    (ROUND((rating::numeric / 2.0) * 2) / 2.0)::double precision
  )
)
WHERE rating > 5 AND rating <= 10;

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
  AND BTRIM(rating) ~ '^[0-9]+(\.[0-9]+)?$'
  AND BTRIM(rating)::numeric > 5
  AND BTRIM(rating)::numeric <= 10;
