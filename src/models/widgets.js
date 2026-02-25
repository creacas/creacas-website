const { getDb } = require('../config/database');

function getByPageId(pageId) {
  return getDb().prepare('SELECT * FROM page_widgets WHERE page_id = ? ORDER BY sort_order ASC').all(pageId)
    .map(w => ({ ...w, config: JSON.parse(w.config) }));
}

function getById(id) {
  const w = getDb().prepare('SELECT * FROM page_widgets WHERE id = ?').get(id);
  if (w) w.config = JSON.parse(w.config);
  return w;
}

function create(pageId, type, config = {}) {
  const maxOrder = getDb().prepare('SELECT MAX(sort_order) as m FROM page_widgets WHERE page_id = ?').get(pageId).m;
  const sortOrder = (maxOrder !== null ? maxOrder : -1) + 1;
  return getDb().prepare(
    "INSERT INTO page_widgets (page_id, type, config, sort_order) VALUES (?, ?, ?, ?)"
  ).run(pageId, type, JSON.stringify(config), sortOrder);
}

function update(id, config) {
  return getDb().prepare(
    "UPDATE page_widgets SET config = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(JSON.stringify(config), id);
}

function remove(id) {
  return getDb().prepare('DELETE FROM page_widgets WHERE id = ?').run(id);
}

function removeByPageId(pageId) {
  return getDb().prepare('DELETE FROM page_widgets WHERE page_id = ?').run(pageId);
}

function reorder(ids) {
  const db = getDb();
  const stmt = db.prepare('UPDATE page_widgets SET sort_order = ? WHERE id = ?');
  const tx = db.transaction((idList) => {
    idList.forEach((id, index) => stmt.run(index, id));
  });
  tx(ids);
}

function duplicate(id) {
  const w = getDb().prepare('SELECT * FROM page_widgets WHERE id = ?').get(id);
  if (!w) return null;
  // Insert after the current widget
  const db = getDb();
  // Shift subsequent widgets
  db.prepare('UPDATE page_widgets SET sort_order = sort_order + 1 WHERE page_id = ? AND sort_order > ?')
    .run(w.page_id, w.sort_order);
  return db.prepare(
    "INSERT INTO page_widgets (page_id, type, config, sort_order) VALUES (?, ?, ?, ?)"
  ).run(w.page_id, w.type, w.config, w.sort_order + 1);
}

function bulkSave(pageId, widgets) {
  const db = getDb();
  const tx = db.transaction((items) => {
    for (let i = 0; i < items.length; i++) {
      const w = items[i];
      if (w.id) {
        db.prepare(
          "UPDATE page_widgets SET config = ?, sort_order = ?, updated_at = datetime('now') WHERE id = ? AND page_id = ?"
        ).run(JSON.stringify(w.config), i, w.id, pageId);
      } else {
        db.prepare(
          "INSERT INTO page_widgets (page_id, type, config, sort_order) VALUES (?, ?, ?, ?)"
        ).run(pageId, w.type, JSON.stringify(w.config), i);
      }
    }
  });
  tx(widgets);
}

module.exports = { getByPageId, getById, create, update, remove, removeByPageId, reorder, duplicate, bulkSave };
