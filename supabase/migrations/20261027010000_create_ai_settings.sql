CREATE TABLE IF NOT EXISTS public.ai_settings (
  id text PRIMARY KEY DEFAULT 'default',
  providers text[] NOT NULL DEFAULT ARRAY['Gemini', '9Router', 'OpenRouter'],
  language text NOT NULL DEFAULT 'id',
  gemini_enabled boolean NOT NULL DEFAULT true,
  gemini_api_key_encrypted text,
  gemini_model text NOT NULL DEFAULT 'gemini-1.5-flash',
  nine_router_enabled boolean NOT NULL DEFAULT false,
  nine_router_url text NOT NULL DEFAULT 'http://localhost:20128/v1/chat/completions',
  nine_router_api_key_encrypted text,
  nine_router_model text NOT NULL DEFAULT 'gemini-flash',
  open_router_enabled boolean NOT NULL DEFAULT false,
  open_router_api_key_encrypted text,
  open_router_model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ai settings"
  ON public.ai_settings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can write ai settings"
  ON public.ai_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_settings TO authenticated;

INSERT INTO public.ai_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;