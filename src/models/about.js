const { getDb } = require('../config/database');

function getContent() {
  return getDb().prepare('SELECT * FROM about WHERE id = 1').get();
}

function updateContent(data) {
  getDb().prepare('INSERT OR REPLACE INTO about (id, heading, content, image_path) VALUES (1, ?, ?, ?)').run(
    data.heading, data.content, data.image_path
  );
}

function updateImage(imagePath) {
  getDb().prepare('UPDATE about SET image_path = ? WHERE id = 1').run(imagePath);
}

function getStats() {
  return getDb().prepare('SELECT * FROM about_stats ORDER BY sort_order ASC').all();
}

function updateStats(stats) {
  const db = getDb();
  const deleteTx = db.transaction(() => {
    db.prepare('DELETE FROM about_stats').run();
    const stmt = db.prepare('INSERT INTO about_stats (number, label, sort_order) VALUES (?, ?, ?)');
    stats.forEach((stat, index) => {
      stmt.run(stat.number, stat.label, index);
    });
  });
  deleteTx();
}

module.exports = { getContent, updateContent, updateImage, getStats, updateStats };
