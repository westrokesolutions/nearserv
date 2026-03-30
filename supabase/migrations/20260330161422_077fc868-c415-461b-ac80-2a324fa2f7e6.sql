
-- Add structured detail columns to categories (Urban Company style)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS services_included JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS process_steps JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS price_info TEXT;
