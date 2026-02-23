const { getDb } = require('../config/database');

// Categories
function getCategories() {
  return getDb().prepare('SELECT * FROM portfolio_categories ORDER BY sort_order ASC').all();
}

function getCategoryById(id) {
  return getDb().prepare('SELECT * FROM portfolio_categories WHERE id = ?').get(id);
}

function createCategory(data) {
  return getDb().prepare('INSERT INTO portfolio_categories (name, slug, filter_label, sort_order) VALUES (?, ?, ?, ?)').run(
    data.name, data.slug, data.filter_label, data.sort_order || 0
  );
}

function updateCategory(id, data) {
  getDb().prepare('UPDATE portfolio_categories SET name = ?, slug = ?, filter_label = ? WHERE id = ?').run(
    data.name, data.slug, data.filter_label, id
  );
}

function deleteCategory(id) {
  return getDb().prepare('DELETE FROM portfolio_categories WHERE id = ?').run(id);
}

function reorderCategories(ids) {
  const db = getDb();
  const stmt = db.prepare('UPDATE portfolio_categories SET sort_order = ? WHERE id = ?');
  const reorder = db.transaction((idList) => {
    idList.forEach((id, index) => stmt.run(index, id));
  });
  reorder(ids);
}

// Projects
function getProjects() {
  return getDb().prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM portfolio_projects p
    JOIN portfolio_categories c ON p.category_id = c.id
    ORDER BY p.sort_order ASC
  `).all();
}

function getProjectById(id) {
  return getDb().prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM portfolio_projects p
    JOIN portfolio_categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(id);
}

function getProjectsByCategory(categoryId) {
  return getDb().prepare('SELECT * FROM portfolio_projects WHERE category_id = ? ORDER BY sort_order ASC').all(categoryId);
}

function createProject(data) {
  const maxOrder = getDb().prepare('SELECT MAX(sort_order) as m FROM portfolio_projects').get().m || 0;
  return getDb().prepare('INSERT INTO portfolio_projects (category_id, title, slug, description, cover_image, sort_order) VALUES (?, ?, ?, ?, ?, ?)').run(
    data.category_id, data.title, data.slug, data.description, data.cover_image || '', maxOrder + 1
  );
}

function updateProject(id, data) {
  const fields = [];
  const values = [];

  if (data.category_id !== undefined) { fields.push('category_id = ?'); values.push(data.category_id); }
  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.slug !== undefined) { fields.push('slug = ?'); values.push(data.slug); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
  if (data.cover_image !== undefined) { fields.push('cover_image = ?'); values.push(data.cover_image); }

  if (fields.length === 0) return;
  values.push(id);
  getDb().prepare(`UPDATE portfolio_projects SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

function deleteProject(id) {
  return getDb().prepare('DELETE FROM portfolio_projects WHERE id = ?').run(id);
}

function reorderProjects(ids) {
  const db = getDb();
  const stmt = db.prepare('UPDATE portfolio_projects SET sort_order = ? WHERE id = ?');
  const reorder = db.transaction((idList) => {
    idList.forEach((id, index) => stmt.run(index, id));
  });
  reorder(ids);
}

// Gallery images
function getGalleryImages(projectId) {
  return getDb().prepare('SELECT * FROM gallery_images WHERE project_id = ? ORDER BY sort_order ASC').all(projectId);
}

function addGalleryImage(data) {
  const maxOrder = getDb().prepare('SELECT MAX(sort_order) as m FROM gallery_images WHERE project_id = ?').get(data.project_id).m || 0;
  return getDb().prepare('INSERT INTO gallery_images (project_id, image_path, thumbnail_path, alt_text, sort_order) VALUES (?, ?, ?, ?, ?)').run(
    data.project_id, data.image_path, data.thumbnail_path || '', data.alt_text || '', maxOrder + 1
  );
}

function updateGalleryImage(id, data) {
  getDb().prepare('UPDATE gallery_images SET alt_text = ? WHERE id = ?').run(data.alt_text, id);
}

function deleteGalleryImage(id) {
  return getDb().prepare('DELETE FROM gallery_images WHERE id = ?').run(id);
}

function getGalleryImageById(id) {
  return getDb().prepare('SELECT * FROM gallery_images WHERE id = ?').get(id);
}

function reorderGalleryImages(ids) {
  const db = getDb();
  const stmt = db.prepare('UPDATE gallery_images SET sort_order = ? WHERE id = ?');
  const reorder = db.transaction((idList) => {
    idList.forEach((id, index) => stmt.run(index, id));
  });
  reorder(ids);
}

module.exports = {
  getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, reorderCategories,
  getProjects, getProjectById, getProjectsByCategory, createProject, updateProject, deleteProject, reorderProjects,
  getGalleryImages, addGalleryImage, updateGalleryImage, deleteGalleryImage, getGalleryImageById, reorderGalleryImages
};
