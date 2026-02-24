const { getDb } = require('../config/database');

const RESERVED_SLUGS = [
  'backend', 'api', 'uploads', 'assets', 'css', 'js',
  'admin', 'login', 'logout', 'favicon.svg'
];

function getAll() {
  return getDb().prepare('SELECT * FROM pages ORDER BY sort_order ASC').all();
}

function getPublished() {
  return getDb().prepare('SELECT * FROM pages WHERE published = 1 ORDER BY sort_order ASC').all();
}

function getNavPages() {
  return getDb().prepare('SELECT * FROM pages WHERE published = 1 AND show_in_nav = 1 ORDER BY sort_order ASC').all();
}

function getById(id) {
  return getDb().prepare('SELECT * FROM pages WHERE id = ?').get(id);
}

function getBySlug(slug) {
  return getDb().prepare('SELECT * FROM pages WHERE slug = ? AND published = 1').get(slug);
}

function isReservedSlug(slug) {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}

function isSlugTaken(slug, excludeId) {
  if (excludeId) {
    return !!getDb().prepare('SELECT id FROM pages WHERE slug = ? AND id != ?').get(slug, excludeId);
  }
  return !!getDb().prepare('SELECT id FROM pages WHERE slug = ?').get(slug);
}

function create(data) {
  const maxOrder = getDb().prepare('SELECT MAX(sort_order) as m FROM pages').get().m || 0;
  return getDb().prepare(
    'INSERT INTO pages (title, slug, content, meta_description, featured_image, published, show_in_nav, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    data.title,
    data.slug,
    data.content || '',
    data.meta_description || '',
    data.featured_image || '',
    data.published ? 1 : 0,
    data.show_in_nav ? 1 : 0,
    maxOrder + 1
  );
}

function update(id, data) {
  const fields = [];
  const values = [];

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.slug !== undefined) { fields.push('slug = ?'); values.push(data.slug); }
  if (data.content !== undefined) { fields.push('content = ?'); values.push(data.content); }
  if (data.meta_description !== undefined) { fields.push('meta_description = ?'); values.push(data.meta_description); }
  if (data.featured_image !== undefined) { fields.push('featured_image = ?'); values.push(data.featured_image); }
  if (data.published !== undefined) { fields.push('published = ?'); values.push(data.published ? 1 : 0); }
  if (data.show_in_nav !== undefined) { fields.push('show_in_nav = ?'); values.push(data.show_in_nav ? 1 : 0); }

  if (fields.length === 0) return;

  fields.push("updated_at = datetime('now')");
  values.push(id);

  getDb().prepare(`UPDATE pages SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

function remove(id) {
  return getDb().prepare('DELETE FROM pages WHERE id = ?').run(id);
}

function reorder(ids) {
  const db = getDb();
  const stmt = db.prepare('UPDATE pages SET sort_order = ? WHERE id = ?');
  const reorderTx = db.transaction((idList) => {
    idList.forEach((id, index) => stmt.run(index, id));
  });
  reorderTx(ids);
}

module.exports = { getAll, getPublished, getNavPages, getById, getBySlug, isReservedSlug, isSlugTaken, create, update, remove, reorder };
