ALTER TABLE public.playlist_movie
ADD COLUMN IF NOT EXISTS sort_order integer;

WITH ordered AS (
  SELECT
    playlist_id,
    movie_id,
    ROW_NUMBER() OVER (PARTITION BY playlist_id ORDER BY movie_id) AS rn
  FROM public.playlist_movie
)
UPDATE public.playlist_movie pm
SET sort_order = ordered.rn
FROM ordered
WHERE pm.playlist_id = ordered.playlist_id
  AND pm.movie_id = ordered.movie_id
  AND pm.sort_order IS NULL;
