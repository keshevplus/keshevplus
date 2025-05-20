-- Create translations-related tables

-- Table for supported languages
CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE, -- Language code (e.g., 'en', 'he')
  name VARCHAR(50) NOT NULL, -- Language name (e.g., 'English', 'Hebrew')
  native_name VARCHAR(50) NOT NULL, -- Name in native language (e.g., 'English', 'עברית')
  rtl BOOLEAN NOT NULL DEFAULT FALSE, -- Is right-to-left language
  is_default BOOLEAN NOT NULL DEFAULT FALSE, -- Is this the default language
  is_active BOOLEAN NOT NULL DEFAULT TRUE, -- Is this language active
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table for translation namespace (categories)
CREATE TABLE IF NOT EXISTS translation_namespaces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- Namespace name (e.g., 'common', 'admin', 'forms')
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table for translation keys
CREATE TABLE IF NOT EXISTS translation_keys (
  id SERIAL PRIMARY KEY,
  namespace_id INTEGER NOT NULL REFERENCES translation_namespaces(id) ON DELETE CASCADE,
  key VARCHAR(255) NOT NULL, -- Translation key (e.g., 'admin.login')
  description TEXT, -- Optional description/context for translators
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(namespace_id, key) -- Each key must be unique within a namespace
);

-- Table for translations
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  key_id INTEGER NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
  language_id INTEGER NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  translation TEXT NOT NULL, -- The translated text
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(key_id, language_id) -- Each translation must be unique for a key and language combination
);

-- Insert default languages
INSERT INTO languages (code, name, native_name, rtl, is_default, is_active)
VALUES
  ('en', 'English', 'English', FALSE, FALSE, TRUE),
  ('he', 'Hebrew', 'עברית', TRUE, TRUE, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Insert default namespaces
INSERT INTO translation_namespaces (name, description)
VALUES
  ('common', 'Common translations used throughout the application'),
  ('forms', 'Translations for forms and input fields'),
  ('admin', 'Admin area translations'),
  ('navigation', 'Navigation and menu translations'),
  ('home', 'Home page translations'),
  ('accessibility', 'Accessibility related translations')
ON CONFLICT (name) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_translations_key_language ON translations (key_id, language_id);
CREATE INDEX IF NOT EXISTS idx_translation_keys_namespace ON translation_keys (namespace_id);