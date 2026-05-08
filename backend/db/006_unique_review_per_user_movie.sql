WITH ranked AS (
  SELECT
    review_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, movie_id
      ORDER BY date_review DESC, review_id DESC
    ) AS rn
  FROM public.review
)
DELETE FROM public.report_review rr
USING ranked
WHERE rr.review_id = ranked.review_id
  AND ranked.rn > 1;

WITH ranked AS (
  SELECT
    review_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, movie_id
      ORDER BY date_review DESC, review_id DESC
    ) AS rn
  FROM public.review
)
DELETE FROM public.review r
USING ranked
WHERE r.review_id = ranked.review_id
  AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS review_one_per_user_movie
ON public.review (user_id, movie_id);
