CREATE TABLE IF NOT EXISTS public.streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL CHECK (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  lrclib_url text NOT NULL CHECK (lrclib_url ~ '^https://lrclib\.net/tracks/[0-9]+/?$'),
  title text NOT NULL,
  artist text NOT NULL,
  lyrics_data jsonb NOT NULL,
  processing_status text NOT NULL DEFAULT 'ready' CHECK (processing_status IN ('ready', 'partial', 'failed')),
  processing_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read streams"
  ON public.streams FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create streams"
  ON public.streams FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update streams"
  ON public.streams FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete streams"
  ON public.streams FOR DELETE TO authenticated
  USING (true);

GRANT SELECT ON public.streams TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.streams TO authenticated;