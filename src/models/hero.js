const { getDb } = require('../config/database');

function getContent() {
  return getDb().prepare('SELECT * FROM hero_content WHERE id = 1').get();
}

function updateContent(data) {
  getDb().prepare(`
    INSERT OR REPLACE INTO hero_content (id, heading, tagline, button_primary_text, button_primary_link, button_secondary_text, button_secondary_link)
    VALUES (1, ?, ?, ?, ?, ?, ?)
  `).run(data.heading, data.tagline, data.button_primary_text, data.button_primary_link, data.button_secondary_text, data.button_secondary_link);
}

function getSlides() {
  return getDb().prepare('SELECT * FROM hero_slides ORDER BY sort_order ASC').all();
}

function addSlide(imagePath, altText) {
  const maxOrder = getDb().prepare('SELECT MAX(sort_order) as m FROM hero_slides').get().m || 0;
  return getDb().prepare('INSERT INTO hero_slides (image_path, alt_text, sort_order) VALUES (?, ?, ?)').run(imagePath, altText, maxOrder + 1);
}

function updateSlide(id, data) {
  getDb().prepare('UPDATE hero_slides SET alt_text = ? WHERE id = ?').run(data.alt_text, id);
}

function deleteSlide(id) {
  return getDb().prepare('DELETE FROM hero_slides WHERE id = ?').run(id);
}

function reorderSlides(ids) {
  const db = getDb();
  const stmt = db.prepare('UPDATE hero_slides SET sort_order = ? WHERE id = ?');
  const reorder = db.transaction((idList) => {
    idList.forEach((id, index) => stmt.run(index, id));
  });
  reorder(ids);
}

module.exports = { getContent, updateContent, getSlides, addSlide, updateSlide, deleteSlide, reorderSlides };
