const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { upload, setUploadType } = require('../middleware/upload');
const { processImage, deleteImage } = require('../utils/image-processor');
const settingsModel = require('../models/settings');
const heroModel = require('../models/hero');
const portfolioModel = require('../models/portfolio');
const servicesModel = require('../models/services');
const aboutModel = require('../models/about');
const contactModel = require('../models/contact');
const pagesModel = require('../models/pages');
const widgetsModel = require('../models/widgets');

router.use(requireAuth);

// === SETTINGS ===
router.put('/settings', (req, res) => {
  try {
    settingsModel.updateMultiple(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === HERO ===
router.put('/hero/content', (req, res) => {
  try {
    heroModel.updateContent(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/hero/slides', setUploadType('hero'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Geen afbeelding geüpload.' });
    const { processed, thumbnail } = await processImage(req.file.path, 'hero');
    const result = heroModel.addSlide(processed, req.body.alt_text || '');
    res.json({ success: true, id: result.lastInsertRowid, image_path: processed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder BEFORE :id to prevent route conflict
router.put('/hero/slides/reorder', (req, res) => {
  try {
    heroModel.reorderSlides(req.body.ids);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/hero/slides/:id', (req, res) => {
  try {
    heroModel.updateSlide(parseInt(req.params.id), req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/hero/slides/:id', (req, res) => {
  try {
    const slides = heroModel.getSlides();
    const slide = slides.find(s => s.id === parseInt(req.params.id));
    if (slide) deleteImage(slide.image_path);
    heroModel.deleteSlide(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PORTFOLIO CATEGORIES ===
router.post('/portfolio/categories', (req, res) => {
  try {
    const result = portfolioModel.createCategory(req.body);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder BEFORE :id
router.put('/portfolio/categories/reorder', (req, res) => {
  try {
    portfolioModel.reorderCategories(req.body.ids);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/portfolio/categories/:id', (req, res) => {
  try {
    portfolioModel.updateCategory(parseInt(req.params.id), req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/portfolio/categories/:id', (req, res) => {
  try {
    portfolioModel.deleteCategory(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PORTFOLIO PROJECTS ===
router.post('/portfolio/projects', setUploadType('portfolio'), upload.single('cover_image'), async (req, res) => {
  try {
    let coverImage = '';
    if (req.file) {
      const { processed } = await processImage(req.file.path, 'portfolio');
      coverImage = processed;
    }
    const result = portfolioModel.createProject({
      category_id: parseInt(req.body.category_id),
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description || '',
      cover_image: coverImage
    });
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder BEFORE :id
router.put('/portfolio/projects/reorder', (req, res) => {
  try {
    portfolioModel.reorderProjects(req.body.ids);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/portfolio/projects/:id', setUploadType('portfolio'), upload.single('cover_image'), async (req, res) => {
  try {
    const data = {
      category_id: req.body.category_id ? parseInt(req.body.category_id) : undefined,
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description
    };
    if (req.file) {
      const old = portfolioModel.getProjectById(parseInt(req.params.id));
      if (old) deleteImage(old.cover_image);
      const { processed } = await processImage(req.file.path, 'portfolio');
      data.cover_image = processed;
    }
    portfolioModel.updateProject(parseInt(req.params.id), data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/portfolio/projects/:id', (req, res) => {
  try {
    const project = portfolioModel.getProjectById(parseInt(req.params.id));
    if (project) {
      deleteImage(project.cover_image);
      const images = portfolioModel.getGalleryImages(project.id);
      for (const img of images) {
        deleteImage(img.image_path);
      }
    }
    portfolioModel.deleteProject(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GALLERY IMAGES ===
router.post('/portfolio/projects/:id/gallery', setUploadType('gallery'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Geen afbeelding geüpload.' });
    const { processed, thumbnail } = await processImage(req.file.path, 'gallery');
    const result = portfolioModel.addGalleryImage({
      project_id: parseInt(req.params.id),
      image_path: processed,
      thumbnail_path: thumbnail,
      alt_text: req.body.alt_text || ''
    });
    res.json({ success: true, id: result.lastInsertRowid, image_path: processed, thumbnail_path: thumbnail });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder BEFORE :id
router.put('/portfolio/gallery/reorder', (req, res) => {
  try {
    portfolioModel.reorderGalleryImages(req.body.ids);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/portfolio/gallery/:id', (req, res) => {
  try {
    portfolioModel.updateGalleryImage(parseInt(req.params.id), req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/portfolio/gallery/:id', (req, res) => {
  try {
    const img = portfolioModel.getGalleryImageById(parseInt(req.params.id));
    if (img) deleteImage(img.image_path);
    portfolioModel.deleteGalleryImage(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === SERVICES ===
router.post('/services', (req, res) => {
  try {
    const result = servicesModel.create(req.body);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder BEFORE :id
router.put('/services/reorder', (req, res) => {
  try {
    servicesModel.reorder(req.body.ids);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/services/:id', (req, res) => {
  try {
    servicesModel.update(parseInt(req.params.id), req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/services/:id', (req, res) => {
  try {
    servicesModel.remove(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === ABOUT ===
router.put('/about', (req, res) => {
  try {
    const current = aboutModel.getContent();
    aboutModel.updateContent({
      heading: req.body.heading || current.heading,
      content: req.body.content || current.content,
      image_path: current.image_path
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/about/image', setUploadType('about'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Geen afbeelding geüpload.' });
    const current = aboutModel.getContent();
    if (current) deleteImage(current.image_path);
    const { processed } = await processImage(req.file.path, 'about');
    aboutModel.updateImage(processed);
    res.json({ success: true, image_path: processed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/about/stats', (req, res) => {
  try {
    aboutModel.updateStats(req.body.stats);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === SOCIAL LINKS ===
router.post('/social', (req, res) => {
  try {
    const result = contactModel.createSocialLink(req.body);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/social/:id', (req, res) => {
  try {
    contactModel.updateSocialLink(parseInt(req.params.id), req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/social/:id', (req, res) => {
  try {
    contactModel.deleteSocialLink(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PAGES ===
router.post('/pages', (req, res) => {
  try {
    const { title, slug } = req.body;
    if (!title || !slug) return res.status(400).json({ error: 'Titel en slug zijn verplicht.' });
    if (pagesModel.isReservedSlug(slug)) return res.status(400).json({ error: 'Deze slug is gereserveerd.' });
    if (pagesModel.isSlugTaken(slug)) return res.status(400).json({ error: 'Deze slug is al in gebruik.' });
    const result = pagesModel.create({ title, slug });
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder BEFORE :id
router.put('/pages/reorder', (req, res) => {
  try {
    pagesModel.reorder(req.body.ids);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/pages/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    if (data.slug !== undefined) {
      if (pagesModel.isReservedSlug(data.slug)) return res.status(400).json({ error: 'Deze slug is gereserveerd.' });
      if (pagesModel.isSlugTaken(data.slug, id)) return res.status(400).json({ error: 'Deze slug is al in gebruik.' });
    }
    pagesModel.update(id, data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pages/:id/image', setUploadType('page'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Geen afbeelding geüpload.' });
    const page = pagesModel.getById(parseInt(req.params.id));
    if (page && page.featured_image) deleteImage(page.featured_image);
    const { processed } = await processImage(req.file.path, 'page');
    pagesModel.update(parseInt(req.params.id), { featured_image: processed });
    res.json({ success: true, image_path: processed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/pages/:id/image', (req, res) => {
  try {
    const page = pagesModel.getById(parseInt(req.params.id));
    if (page && page.featured_image) deleteImage(page.featured_image);
    pagesModel.update(parseInt(req.params.id), { featured_image: '' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/pages/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const page = pagesModel.getById(id);
    if (page && page.featured_image) deleteImage(page.featured_image);
    // Clean up widget images
    const widgets = widgetsModel.getByPageId(id);
    for (const w of widgets) {
      deleteWidgetImages(w);
    }
    pagesModel.remove(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === WIDGETS ===

function deleteWidgetImages(widget) {
  const c = widget.config || {};
  if (c.image_path) deleteImage(c.image_path);
  if (c.left_image) deleteImage(c.left_image);
  if (c.right_image) deleteImage(c.right_image);
  if (c.before_image) deleteImage(c.before_image);
  if (c.after_image) deleteImage(c.after_image);
  if (Array.isArray(c.images)) {
    for (const img of c.images) {
      if (img.image_path) deleteImage(img.image_path);
    }
  }
  if (Array.isArray(c.cards)) {
    for (const card of c.cards) {
      if (card.image_path) deleteImage(card.image_path);
    }
  }
}

router.get('/pages/:id/widgets', (req, res) => {
  try {
    const widgets = widgetsModel.getByPageId(parseInt(req.params.id));
    res.json(widgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pages/:id/widgets', (req, res) => {
  try {
    const { type, config } = req.body;
    if (!type) return res.status(400).json({ error: 'Type is verplicht.' });
    const result = widgetsModel.create(parseInt(req.params.id), type, config || {});
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/pages/:id/widgets/reorder', (req, res) => {
  try {
    widgetsModel.reorder(req.body.ids);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/pages/:id/widgets/bulk', (req, res) => {
  try {
    widgetsModel.bulkSave(parseInt(req.params.id), req.body.widgets);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/widgets/:id', (req, res) => {
  try {
    widgetsModel.update(parseInt(req.params.id), req.body.config);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/widgets/:id/duplicate', (req, res) => {
  try {
    const result = widgetsModel.duplicate(parseInt(req.params.id));
    if (!result) return res.status(404).json({ error: 'Widget niet gevonden.' });
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/widgets/:id', (req, res) => {
  try {
    const widget = widgetsModel.getById(parseInt(req.params.id));
    if (widget) deleteWidgetImages(widget);
    widgetsModel.remove(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/widgets/upload-image', setUploadType('widget'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Geen afbeelding geüpload.' });
    const { processed, thumbnail } = await processImage(req.file.path, 'widget');
    res.json({ success: true, image_path: processed, thumbnail_path: thumbnail });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
