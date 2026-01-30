// ============================================
// CreaCas Portfolio - Main JavaScript
// ============================================

// Gallery Data - each portfolio item links to a collection
// Helper function for Netlify Image CDN (with local fallback)
const isLocalhost = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.protocol === 'file:';

function netlifyImage(path, width = 1200) {
  if (isLocalhost) {
    // Local development: use original path
    return path.startsWith('/') ? path.substring(1) : path;
  }
  return `/.netlify/images?url=${path}&w=${width}&q=80`;
}

const galleryData = {
  'landschappen': {
    title: 'Landschappen',
    category: 'Fotografie',
    images: [
      { src: '/assets/images/gallery/landschappen/01.jpg', alt: 'Landschap 1' },
      { src: '/assets/images/gallery/landschappen/02.jpg', alt: 'Landschap 2' },
      { src: '/assets/images/gallery/landschappen/03.jpg', alt: 'Landschap 3' },
      { src: '/assets/images/gallery/landschappen/04.jpg', alt: 'Landschap 4' },
      { src: '/assets/images/gallery/landschappen/05.jpg', alt: 'Landschap 5' },
      { src: '/assets/images/gallery/landschappen/06.jpg', alt: 'Landschap 6' }
    ]
  },
  'portretten': {
    title: 'Portretten',
    category: 'Fotografie',
    images: [
      { src: '/assets/images/gallery/portretten/01.jpg', alt: 'Portret 1' },
      { src: '/assets/images/gallery/portretten/02.jpg', alt: 'Portret 2' },
      { src: '/assets/images/gallery/portretten/03.jpg', alt: 'Portret 3' },
      { src: '/assets/images/gallery/portretten/04.jpg', alt: 'Portret 4' },
      { src: '/assets/images/gallery/portretten/05.jpg', alt: 'Portret 5' },
      { src: '/assets/images/gallery/portretten/06.jpg', alt: 'Portret 6' }
    ]
  },
  'branding': {
    title: 'Brand Identity',
    category: 'Design',
    images: [
      { src: '/assets/images/gallery/branding/01.jpg', alt: 'Branding 1' },
      { src: '/assets/images/gallery/branding/02.jpg', alt: 'Branding 2' },
      { src: '/assets/images/gallery/branding/03.jpg', alt: 'Branding 3' },
      { src: '/assets/images/gallery/branding/04.jpg', alt: 'Branding 4' },
      { src: '/assets/images/gallery/branding/05.jpg', alt: 'Branding 5' },
      { src: '/assets/images/gallery/branding/06.jpg', alt: 'Branding 6' }
    ]
  },
  'ui-ux': {
    title: 'UI/UX Design',
    category: 'Design',
    images: [
      { src: '/assets/images/gallery/ui-ux/01.jpg', alt: 'UI/UX 1' },
      { src: '/assets/images/gallery/ui-ux/02.jpg', alt: 'UI/UX 2' },
      { src: '/assets/images/gallery/ui-ux/03.jpg', alt: 'UI/UX 3' },
      { src: '/assets/images/gallery/ui-ux/04.jpg', alt: 'UI/UX 4' },
      { src: '/assets/images/gallery/ui-ux/05.jpg', alt: 'UI/UX 5' },
      { src: '/assets/images/gallery/ui-ux/06.jpg', alt: 'UI/UX 6' }
    ]
  },
  'ai-visuals': {
    title: 'AI Visuals',
    category: 'AI Content',
    images: [
      { src: '/assets/images/gallery/ai-visuals/01.jpg', alt: 'AI Visual 1' },
      { src: '/assets/images/gallery/ai-visuals/02.jpg', alt: 'AI Visual 2' },
      { src: '/assets/images/gallery/ai-visuals/03.jpg', alt: 'AI Visual 3' },
      { src: '/assets/images/gallery/ai-visuals/04.jpg', alt: 'AI Visual 4' },
      { src: '/assets/images/gallery/ai-visuals/05.jpg', alt: 'AI Visual 5' },
      { src: '/assets/images/gallery/ai-visuals/06.jpg', alt: 'AI Visual 6' }
    ]
  },
  'ai-campaigns': {
    title: 'AI Campaigns',
    category: 'AI Content',
    images: [
      { src: '/assets/images/gallery/ai-campaigns/01.jpg', alt: 'AI Campaign 1' },
      { src: '/assets/images/gallery/ai-campaigns/02.jpg', alt: 'AI Campaign 2' },
      { src: '/assets/images/gallery/ai-campaigns/03.jpg', alt: 'AI Campaign 3' },
      { src: '/assets/images/gallery/ai-campaigns/04.jpg', alt: 'AI Campaign 4' },
      { src: '/assets/images/gallery/ai-campaigns/05.jpg', alt: 'AI Campaign 5' },
      { src: '/assets/images/gallery/ai-campaigns/06.jpg', alt: 'AI Campaign 6' }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavigation();
  initHeroSlider();
  initScrollEffects();
  initPortfolioFilter();
  initGallery();
  initContactForm();
});

// ============================================
// Theme Toggle (Dark Mode)
// ============================================
function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  // Check saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (prefersDark.matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  toggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // Listen for system preference changes
  prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
}

// ============================================
// Navigation
// ============================================
function initNavigation() {
  const header = document.querySelector('header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');

  menuToggle?.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      menuToggle?.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.pageYOffset + 100;
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${sectionId}`) {
            item.classList.add('active');
          }
        });
      }
    });
  });
}

// ============================================
// Hero Slider
// ============================================
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const indicators = document.querySelectorAll('.hero-indicator');
  let currentSlide = 0;
  let slideInterval;

  if (slides.length === 0) return;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide]?.classList.remove('active');

    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;

    slides[currentSlide].classList.add('active');
    indicators[currentSlide]?.classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function startAutoPlay() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    clearInterval(slideInterval);
  }

  // Click on indicators
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      stopAutoPlay();
      goToSlide(index);
      startAutoPlay();
    });
  });

  // Start auto-play
  startAutoPlay();

  // Pause on hover
  const heroSection = document.getElementById('home');
  heroSection?.addEventListener('mouseenter', stopAutoPlay);
  heroSection?.addEventListener('mouseleave', startAutoPlay);
}

// ============================================
// Scroll Effects
// ============================================
function initScrollEffects() {
  const fadeElements = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => observer.observe(el));
}

// ============================================
// Portfolio Filter
// ============================================
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      portfolioItems.forEach(item => {
        const category = item.dataset.category;
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 10);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.8)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

// ============================================
// Gallery
// ============================================
function initGallery() {
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  const galleryModal = document.getElementById('galleryModal');
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryTitle = document.getElementById('galleryTitle');
  const galleryCategory = document.getElementById('galleryCategory');
  const galleryClose = document.querySelector('.gallery-close');

  const imageViewer = document.getElementById('imageViewer');
  const viewerImage = document.getElementById('viewerImage');
  const viewerClose = document.querySelector('.image-viewer-close');
  const prevBtn = document.querySelector('.image-viewer-prev');
  const nextBtn = document.querySelector('.image-viewer-next');
  const currentIndexEl = document.getElementById('currentIndex');
  const totalImagesEl = document.getElementById('totalImages');

  let currentGallery = [];
  let currentImageIndex = 0;

  // Open gallery modal
  portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
      const galleryKey = item.dataset.gallery;
      const gallery = galleryData[galleryKey];

      if (!gallery) return;

      currentGallery = gallery.images;
      galleryTitle.textContent = gallery.title;
      galleryCategory.textContent = gallery.category;

      // Populate gallery grid (thumbnails at 400px)
      galleryGrid.innerHTML = gallery.images.map((img, index) => `
        <div class="gallery-item" data-index="${index}">
          <img src="${netlifyImage(img.src, 400)}" alt="${img.alt}" loading="lazy">
        </div>
      `).join('');

      // Add click handlers to gallery items
      document.querySelectorAll('.gallery-item').forEach(galleryItem => {
        galleryItem.addEventListener('click', () => {
          openImageViewer(parseInt(galleryItem.dataset.index));
        });
      });

      galleryModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close gallery modal
  galleryClose?.addEventListener('click', closeGalleryModal);
  galleryModal?.addEventListener('click', (e) => {
    if (e.target === galleryModal) closeGalleryModal();
  });

  function closeGalleryModal() {
    galleryModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Image Viewer
  function openImageViewer(index) {
    currentImageIndex = index;
    updateImageViewer();
    imageViewer.classList.add('active');
  }

  function updateImageViewer() {
    const image = currentGallery[currentImageIndex];
    viewerImage.src = netlifyImage(image.src, 1400);
    viewerImage.alt = image.alt;
    currentIndexEl.textContent = currentImageIndex + 1;
    totalImagesEl.textContent = currentGallery.length;
  }

  function closeImageViewer() {
    imageViewer.classList.remove('active');
  }

  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
    updateImageViewer();
  }

  function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
    updateImageViewer();
  }

  viewerClose?.addEventListener('click', closeImageViewer);
  nextBtn?.addEventListener('click', nextImage);
  prevBtn?.addEventListener('click', prevImage);

  imageViewer?.addEventListener('click', (e) => {
    if (e.target === imageViewer) closeImageViewer();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (imageViewer?.classList.contains('active')) {
      if (e.key === 'Escape') closeImageViewer();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    } else if (galleryModal?.classList.contains('active')) {
      if (e.key === 'Escape') closeGalleryModal();
    }
  });
}

// ============================================
// Contact Form
// ============================================
function initContactForm() {
  const form = document.querySelector('.contact-form');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (!data.name || !data.email || !data.message) {
      showNotification('Vul alle velden in', 'error');
      return;
    }

    if (!isValidEmail(data.email)) {
      showNotification('Vul een geldig e-mailadres in', 'error');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Verzenden...';
    btn.disabled = true;

    setTimeout(() => {
      showNotification('Bericht verzonden! Ik neem snel contact op.', 'success');
      form.reset();
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 1500);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showNotification(message, type) {
  const existing = document.querySelector('.notification');
  existing?.remove();

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `<p>${message}</p>`;
  notification.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 2rem;
    background-color: ${type === 'success' ? '#10B981' : '#EF4444'};
    color: white;
    border-radius: 4px;
    font-size: 0.95rem;
    z-index: 3000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
document.head.appendChild(style);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
