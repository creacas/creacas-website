const express = require('express');
const router = express.Router();
const settingsModel = require('../models/settings');
const heroModel = require('../models/hero');
const portfolioModel = require('../models/portfolio');
const servicesModel = require('../models/services');
const aboutModel = require('../models/about');
const contactModel = require('../models/contact');

router.get('/', (req, res) => {
  const settings = settingsModel.getAll();
  const hero = heroModel.getContent();
  const heroSlides = heroModel.getSlides();
  const categories = portfolioModel.getCategories();
  const projects = portfolioModel.getProjects();
  const services = servicesModel.getAll();
  const about = aboutModel.getContent();
  const aboutStats = aboutModel.getStats();
  const socialLinks = contactModel.getSocialLinks();

  // Build gallery data for JS injection
  const galleryData = {};
  for (const project of projects) {
    const images = portfolioModel.getGalleryImages(project.id);
    galleryData[project.slug] = {
      title: project.title,
      category: project.category_name,
      images: images.map(img => ({ src: img.image_path, alt: img.alt_text }))
    };
  }

  res.render('public/index', {
    settings,
    hero,
    heroSlides,
    categories,
    projects,
    services,
    about,
    aboutStats,
    socialLinks,
    galleryData: JSON.stringify(galleryData)
  });
});

// Contact form proxy to Web3Forms
router.post('/api/contact', express.json(), async (req, res) => {
  const web3formsKey = settingsModel.get('web3forms_key');
  if (!web3formsKey) {
    return res.status(500).json({ error: 'Contact formulier niet geconfigureerd.' });
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: web3formsKey,
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject || 'Contact via creacas.nl',
        message: req.body.message
      })
    });
    const data = await response.json();
    if (data.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Verzenden mislukt.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Verzenden mislukt.' });
  }
});

module.exports = router;
