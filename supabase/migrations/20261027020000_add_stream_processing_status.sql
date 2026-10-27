ALTER TABLE public.streams
  ADD COLUMN IF NOT EXISTS processing_status text NOT NULL DEFAULT 'ready',
  ADD COLUMN IF NOT EXISTS processing_error text;

ALTER TABLE public.streams
  DROP CONSTRAINT IF EXISTS streams_processing_status_check;

ALTER TABLE public.streams
  ADD CONSTRAINT streams_processing_status_check
  CHECK (processing_status IN ('ready', 'partial', 'failed'));