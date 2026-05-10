ALTER TABLE public.movies
  ADD COLUMN IF NOT EXISTS movie_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS screening_expires_at timestamp NULL;

UPDATE public.movies
SET movie_status = 'inactive'
WHERE screening_expires_at IS NOT NULL
  AND screening_expires_at <= CURRENT_TIMESTAMP;

