-- Migration: create page_content table to store JSON content for pages

CREATE TABLE IF NOT EXISTS page_content (
  id SERIAL PRIMARY KEY,
  page_key TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'he',
  content_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (page_key, locale)
);
