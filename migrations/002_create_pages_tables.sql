-- Migration: create pages and page_sections tables

CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  content_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_sections (
  id SERIAL PRIMARY KEY,
  page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  content_json JSONB,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
