const { getDb } = require('../config/database');

function getSocialLinks() {
  return getDb().prepare('SELECT * FROM social_links ORDER BY sort_order ASC').all();
}

function getSocialLinkById(id) {
  return getDb().prepare('SELECT * FROM social_links WHERE id = ?').get(id);
}

function createSocialLink(data) {
  const maxOrder = getDb().prepare('SELECT MAX(sort_order) as m FROM social_links').get().m || 0;
  return getDb().prepare('INSERT INTO social_links (platform, url, icon_svg, sort_order) VALUES (?, ?, ?, ?)').run(
    data.platform, data.url, data.icon_svg || '', maxOrder + 1
  );
}

function updateSocialLink(id, data) {
  getDb().prepare('UPDATE social_links SET platform = ?, url = ?, icon_svg = ? WHERE id = ?').run(
    data.platform, data.url, data.icon_svg || '', id
  );
}

function deleteSocialLink(id) {
  return getDb().prepare('DELETE FROM social_links WHERE id = ?').run(id);
}

function reorderSocialLinks(ids) {
  const db = getDb();
  const stmt = db.prepare('UPDATE social_links SET sort_order = ? WHERE id = ?');
  const reorder = db.transaction((idList) => {
    idList.forEach((id, index) => stmt.run(index, id));
  });
  reorder(ids);
}

module.exports = { getSocialLinks, getSocialLinkById, createSocialLink, updateSocialLink, deleteSocialLink, reorderSocialLinks };
