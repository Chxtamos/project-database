ALTER TABLE public.movies
ADD COLUMN IF NOT EXISTS video_url text;
