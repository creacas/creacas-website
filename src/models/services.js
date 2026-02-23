const { getDb } = require('../config/database');

function getAll() {
  return getDb().prepare('SELECT * FROM services ORDER BY sort_order ASC').all();
}

function getById(id) {
  return getDb().prepare('SELECT * FROM services WHERE id = ?').get(id);
}

function create(data) {
  const maxOrder = getDb().prepare('SELECT MAX(sort_order) as m FROM services').get().m || 0;
  return getDb().prepare('INSERT INTO services (title, description, icon_svg, sort_order) VALUES (?, ?, ?, ?)').run(
    data.title, data.description, data.icon_svg || '', maxOrder + 1
  );
}

function update(id, data) {
  getDb().prepare('UPDATE services SET title = ?, description = ?, icon_svg = ? WHERE id = ?').run(
    data.title, data.description, data.icon_svg || '', id
  );
}

function remove(id) {
  return getDb().prepare('DELETE FROM services WHERE id = ?').run(id);
}

function reorder(ids) {
  const db = getDb();
  const stmt = db.prepare('UPDATE services SET sort_order = ? WHERE id = ?');
  const reorderTx = db.transaction((idList) => {
    idList.forEach((id, index) => stmt.run(index, id));
  });
  reorderTx(ids);
}

module.exports = { getAll, getById, create, update, remove, reorder };
