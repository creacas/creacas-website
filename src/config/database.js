const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'cms.sqlite');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hero_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      heading TEXT NOT NULL DEFAULT '',
      tagline TEXT NOT NULL DEFAULT '',
      button_primary_text TEXT NOT NULL DEFAULT 'Bekijk Portfolio',
      button_primary_link TEXT NOT NULL DEFAULT '#portfolio',
      button_secondary_text TEXT NOT NULL DEFAULT 'Neem Contact Op',
      button_secondary_link TEXT NOT NULL DEFAULT '#contact'
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_path TEXT NOT NULL,
      alt_text TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS portfolio_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      filter_label TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS portfolio_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES portfolio_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gallery_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      thumbnail_path TEXT NOT NULL DEFAULT '',
      alt_text TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES portfolio_projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      icon_svg TEXT NOT NULL DEFAULT '',
      button_text TEXT NOT NULL DEFAULT '',
      button_link TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS about (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      heading TEXT NOT NULL DEFAULT 'Over Mij',
      content TEXT NOT NULL DEFAULT '',
      image_path TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS about_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT NOT NULL,
      label TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      icon_svg TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL DEFAULT '',
      meta_description TEXT NOT NULL DEFAULT '',
      featured_image TEXT NOT NULL DEFAULT '',
      published INTEGER NOT NULL DEFAULT 0,
      show_in_nav INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Migration: add title_alignment to pages
    CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY);
  `);

  // Add title_alignment column if not exists
  const hasTitleAlign = db.prepare("SELECT name FROM _migrations WHERE name = 'pages_title_alignment'").get();
  if (!hasTitleAlign) {
    try {
      db.exec("ALTER TABLE pages ADD COLUMN title_alignment TEXT NOT NULL DEFAULT 'left'");
    } catch (e) { /* column may already exist */ }
    db.prepare("INSERT OR IGNORE INTO _migrations (name) VALUES ('pages_title_alignment')").run();
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS page_widgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      config TEXT NOT NULL DEFAULT '{}',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    );
  `);

  // Migrations for existing databases
  const columns = db.prepare("PRAGMA table_info(services)").all().map(c => c.name);
  if (!columns.includes('button_text')) {
    db.exec("ALTER TABLE services ADD COLUMN button_text TEXT NOT NULL DEFAULT ''");
    db.exec("ALTER TABLE services ADD COLUMN button_link TEXT NOT NULL DEFAULT ''");
  }

  // Migrate existing page content to text widgets
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='page_widgets'").get();
  if (tables) {
    const pagesWithContent = db.prepare("SELECT id, content FROM pages WHERE content != '' AND content IS NOT NULL").all();
    for (const page of pagesWithContent) {
      const hasWidgets = db.prepare("SELECT COUNT(*) as count FROM page_widgets WHERE page_id = ?").get(page.id).count;
      if (hasWidgets === 0) {
        db.prepare(
          "INSERT INTO page_widgets (page_id, type, config, sort_order) VALUES (?, 'text', ?, 0)"
        ).run(page.id, JSON.stringify({ html: page.content }));
      }
    }
  }
}

module.exports = { getDb, initDatabase };
