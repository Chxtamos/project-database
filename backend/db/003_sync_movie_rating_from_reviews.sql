UPDATE public.movies m
SET movie_rating = ratings.avg_rating
FROM (
  SELECT movie_id, ROUND(AVG(rating))::int AS avg_rating
  FROM public.review
  GROUP BY movie_id
) ratings
WHERE ratings.movie_id = m.movie_id;

UPDATE public.movies m
SET movie_rating = NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM public.review r
  WHERE r.movie_id = m.movie_id
);
