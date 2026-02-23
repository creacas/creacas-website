const { getDb } = require('../config/database');

function seedIfEmpty() {
  const db = getDb();

  const count = db.prepare('SELECT COUNT(*) as c FROM site_settings').get().c;
  if (count > 0) return;

  console.log('Seeding database with initial content...');

  const insert = db.transaction(() => {
    // Site settings
    const settings = {
      site_title: 'CreaCas | Fotografie, Design & AI',
      meta_description: 'CreaCas - Fotografie, Design & AI Content Creator. Creatieve oplossingen voor jouw visuele verhaal.',
      meta_keywords: 'fotografie, design, AI, content creator, portfolio, CreaCas',
      footer_text: '&copy; 2026 CreaCas. Alle rechten voorbehouden.',
      contact_email: 'info@creacas.nl',
      contact_location: 'Nederland',
      contact_heading: 'Contact',
      contact_subtitle: 'Heb je een project in gedachten? Laten we praten over de mogelijkheden.',
      portfolio_heading: 'Portfolio',
      portfolio_subtitle: 'Een selectie van recente projecten in fotografie, design en AI-generated content.',
      services_heading: 'Services',
      services_subtitle: 'Van concept tot creatie - professionele diensten voor jouw visuele communicatie.',
      web3forms_key: ''
    };

    const insertSetting = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(settings)) {
      insertSetting.run(key, value);
    }

    // Hero content
    db.prepare(`INSERT INTO hero_content (id, heading, tagline, button_primary_text, button_primary_link, button_secondary_text, button_secondary_link) VALUES (1, ?, ?, ?, ?, ?, ?)`).run(
      'Creatief met<br><span>Beeld</span>, Design & <span>AI</span>',
      'Fotografie, grafisch design en AI-gedreven content die jouw verhaal vertelt en je merk laat opvallen.',
      'Bekijk Portfolio',
      '#portfolio',
      'Neem Contact Op',
      '#contact'
    );

    // Hero slides
    const insertSlide = db.prepare('INSERT INTO hero_slides (image_path, alt_text, sort_order) VALUES (?, ?, ?)');
    insertSlide.run('/assets/images/hero/hero-1.jpg', 'Fotografie', 0);
    insertSlide.run('/assets/images/hero/hero-2.jpg', 'Design', 1);
    insertSlide.run('/assets/images/hero/hero-3.jpg', 'AI Content', 2);

    // Portfolio categories
    const insertCategory = db.prepare('INSERT INTO portfolio_categories (name, slug, filter_label, sort_order) VALUES (?, ?, ?, ?)');
    insertCategory.run('Fotografie', 'fotografie', 'Fotografie', 0);
    insertCategory.run('Design', 'design', 'Design', 1);
    insertCategory.run('AI Content', 'ai', 'AI Content', 2);

    // Portfolio projects
    const insertProject = db.prepare('INSERT INTO portfolio_projects (category_id, title, slug, description, cover_image, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    insertProject.run(1, 'Landschappen', 'landschappen', 'Natuurlijke schoonheid vastgelegd', '/assets/images/portfolio/landschappen.jpg', 0);
    insertProject.run(2, 'Brand Identity', 'branding', 'Complete visuele identiteit', '/assets/images/portfolio/branding.jpg', 1);
    insertProject.run(3, 'AI Visuals', 'ai-visuals', 'Gegenereerde conceptkunst', '/assets/images/portfolio/ai-visuals.jpg', 2);
    insertProject.run(1, 'Portretten', 'portretten', 'Persoonlijkheid in beeld', '/assets/images/portfolio/portretten.jpg', 3);
    insertProject.run(2, 'UI/UX Design', 'ui-ux', 'Gebruiksvriendelijke interfaces', '/assets/images/portfolio/ui-ux.jpg', 4);
    insertProject.run(3, 'AI Campaigns', 'ai-campaigns', 'Data-driven creaties', '/assets/images/portfolio/ai-campaigns.jpg', 5);

    // Gallery images for each project
    const insertGallery = db.prepare('INSERT INTO gallery_images (project_id, image_path, alt_text, sort_order) VALUES (?, ?, ?, ?)');
    const galleries = {
      1: { folder: 'landschappen', prefix: 'Landschap' },
      2: { folder: 'branding', prefix: 'Branding' },
      3: { folder: 'ai-visuals', prefix: 'AI Visual' },
      4: { folder: 'portretten', prefix: 'Portret' },
      5: { folder: 'ui-ux', prefix: 'UI/UX' },
      6: { folder: 'ai-campaigns', prefix: 'AI Campaign' }
    };

    for (const [projectId, info] of Object.entries(galleries)) {
      for (let i = 1; i <= 6; i++) {
        const num = String(i).padStart(2, '0');
        insertGallery.run(
          parseInt(projectId),
          `/assets/images/gallery/${info.folder}/${num}.jpg`,
          `${info.prefix} ${i}`,
          i - 1
        );
      }
    }

    // Services
    const insertService = db.prepare('INSERT INTO services (title, description, icon_svg, sort_order) VALUES (?, ?, ?, ?)');
    insertService.run(
      'Fotografie',
      'Professionele fotografie voor portretten, producten, evenementen en meer. Elk beeld vertelt een verhaal.',
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
      0
    );
    insertService.run(
      'Grafisch Design',
      'Van logo\'s tot complete huisstijlen. Visuele identiteiten die blijven hangen en je merk versterken.',
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>',
      1
    );
    insertService.run(
      'AI Content Creatie',
      'Innovatieve content met AI-tools. Van gegenereerde visuals tot geautomatiseerde workflows voor schaalbare creaties.',
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
      2
    );

    // About
    db.prepare('INSERT INTO about (id, heading, content, image_path) VALUES (1, ?, ?, ?)').run(
      'Over Mij',
      '<p>Welkom bij CreaCas. Als fotograaf, designer en content creator combineer ik traditionele creativiteit met de nieuwste AI-technologieën.</p><p>Met een passie voor visueel verhalen vertellen help ik merken en individuen hun unieke identiteit naar voren te brengen. Of het nu gaat om een krachtig portret, een opvallende huisstijl of innovatieve AI-gegenereerde content - elk project krijgt mijn volledige aandacht en creativiteit.</p><p>Nieuwsgierig naar wat we samen kunnen creëren? Neem gerust contact op voor een vrijblijvend gesprek.</p>',
      '/assets/images/about.jpeg'
    );

    // About stats
    const insertStat = db.prepare('INSERT INTO about_stats (number, label, sort_order) VALUES (?, ?, ?)');
    insertStat.run('20+', 'Jaar Ervaring', 0);
    insertStat.run('50+', 'Projecten', 1);
    insertStat.run('1', 'Gepassioneerde Creatieveling', 2);

    // Social links
    const insertSocial = db.prepare('INSERT INTO social_links (platform, url, icon_svg, sort_order) VALUES (?, ?, ?, ?)');
    insertSocial.run(
      'Instagram',
      'https://instagram.com/creacas',
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
      0
    );
    insertSocial.run(
      'LinkedIn',
      'https://linkedin.com/in/creacas',
      '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
      1
    );
  });

  insert();
  console.log('Database seeded successfully.');
}

module.exports = { seedIfEmpty };
