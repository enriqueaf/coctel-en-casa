CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_es TEXT NOT NULL,
  aliases_json TEXT NOT NULL DEFAULT '[]',
  kind TEXT NOT NULL,
  alcoholic INTEGER NOT NULL DEFAULT 0,
  family TEXT
);

CREATE TABLE IF NOT EXISTS cocktails (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_es TEXT NOT NULL,
  alcoholic INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL,
  glass TEXT NOT NULL,
  mood TEXT NOT NULL,
  tastes_json TEXT NOT NULL,
  bases_json TEXT NOT NULL,
  instructions_json TEXT NOT NULL,
  intro_es TEXT,
  faq_json TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  iba_category TEXT,
  sources_json TEXT NOT NULL,
  external_ids_json TEXT
);

CREATE TABLE IF NOT EXISTS cocktail_ingredients (
  cocktail_id TEXT NOT NULL,
  ingredient_id TEXT NOT NULL,
  measure TEXT NOT NULL,
  optional INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (cocktail_id, ingredient_id, position),
  FOREIGN KEY (cocktail_id) REFERENCES cocktails(id),
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_cocktails_mood ON cocktails(mood);
CREATE INDEX IF NOT EXISTS idx_cocktails_featured ON cocktails(featured);
CREATE INDEX IF NOT EXISTS idx_cocktail_ingredients_ingredient ON cocktail_ingredients(ingredient_id);
