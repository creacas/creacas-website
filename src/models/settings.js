const { getDb } = require('../config/database');

function getAll() {
  const rows = getDb().prepare('SELECT key, value FROM site_settings').all();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

function get(key) {
  const row = getDb().prepare('SELECT value FROM site_settings WHERE key = ?').get(key);
  return row ? row.value : '';
}

function set(key, value) {
  getDb().prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)').run(key, value);
}

function updateMultiple(data) {
  const db = getDb();
  const stmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
  const update = db.transaction((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      stmt.run(key, value);
    }
  });
  update(data);
}

module.exports = { getAll, get, set, updateMultiple };
