const express = require('express');
const router = express.Router();
const { requireAuth, verifyLogin, loginLimiter } = require('../middleware/auth');
const settingsModel = require('../models/settings');
const heroModel = require('../models/hero');
const portfolioModel = require('../models/portfolio');
const servicesModel = require('../models/services');
const aboutModel = require('../models/about');
const contactModel = require('../models/contact');
const pagesModel = require('../models/pages');
const widgetsModel = require('../models/widgets');

// Login page
router.get('/login', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.redirect('/backend');
  }
  res.render('admin/login', { error: null });
});

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  const valid = await verifyLogin(username, password);

  if (valid) {
    req.session.authenticated = true;
    res.redirect('/backend');
  } else {
    res.render('admin/login', { error: 'Ongeldige inloggegevens.' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/backend/login');
  });
});

// All admin routes below require auth
router.use(requireAuth);

// Dashboard
router.get('/', (req, res) => {
  const projects = portfolioModel.getProjects();
  const services = servicesModel.getAll();
  const slides = heroModel.getSlides();
  const pages = pagesModel.getAll();
  res.render('admin/dashboard', {
    projectCount: projects.length,
    serviceCount: services.length,
    slideCount: slides.length,
    pageCount: pages.length
  });
});

// Hero
router.get('/hero', (req, res) => {
  res.render('admin/hero', {
    hero: heroModel.getContent(),
    slides: heroModel.getSlides()
  });
});

// Portfolio
router.get('/portfolio', (req, res) => {
  res.render('admin/portfolio', {
    categories: portfolioModel.getCategories(),
    projects: portfolioModel.getProjects()
  });
});

// Project edit
router.get('/portfolio/:id', (req, res) => {
  const project = portfolioModel.getProjectById(parseInt(req.params.id));
  if (!project) return res.redirect('/backend/portfolio');
  const images = portfolioModel.getGalleryImages(project.id);
  const categories = portfolioModel.getCategories();
  res.render('admin/project-edit', { project, images, categories });
});

// Services
router.get('/services', (req, res) => {
  res.render('admin/services', { services: servicesModel.getAll() });
});

// About
router.get('/about', (req, res) => {
  res.render('admin/about', {
    about: aboutModel.getContent(),
    stats: aboutModel.getStats()
  });
});

// Contact
router.get('/contact', (req, res) => {
  const settings = settingsModel.getAll();
  res.render('admin/contact', {
    settings,
    socialLinks: contactModel.getSocialLinks()
  });
});

// Pages
router.get('/pages', (req, res) => {
  res.render('admin/pages', { pages: pagesModel.getAll() });
});

router.get('/pages/:id', (req, res) => {
  const page = pagesModel.getById(parseInt(req.params.id));
  if (!page) return res.redirect('/backend/pages');
  const widgets = widgetsModel.getByPageId(page.id);
  res.render('admin/page-edit', { page, widgets });
});

// Settings
router.get('/settings', (req, res) => {
  res.render('admin/settings', { settings: settingsModel.getAll() });
});

module.exports = router;
