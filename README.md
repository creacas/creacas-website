# CreaCas Portfolio Website

Portfolio website voor CreaCas - Fotografie, Design & AI Content Creator.

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox, Grid, Animations
- **Vanilla JavaScript** - No frameworks
- **Netlify** - Hosting + Image CDN

## Features

- Single-page design met smooth scroll navigatie
- Hero sectie met achtergrond slider (3 slides, auto-advance)
- Portfolio met filter (Fotografie / Design / AI)
- Gallery modal met full-screen image viewer
- Dark mode (toggle + system preference detection)
- Responsive design (mobile-first)
- Netlify Image CDN voor automatische optimalisatie
- Contact formulier (frontend-only)

## Projectstructuur

```
2026/
├── index.html              # Hoofdpagina
├── netlify.toml            # Netlify configuratie
├── README.md               # Deze documentatie
├── css/
│   └── style.css           # Alle styling
├── js/
│   └── main.js             # Interactiviteit + gallery data
└── assets/
    ├── favicon.svg         # Favicon (oranje)
    ├── logo-dark.svg       # Logo voor light mode (zwart)
    ├── logo-light.svg      # Logo voor dark mode (wit)
    └── images/
        ├── about.jpeg      # Over Mij foto
        ├── hero/
        │   ├── hero-1.jpg  # Hero slide 1
        │   ├── hero-2.jpg  # Hero slide 2
        │   └── hero-3.jpg  # Hero slide 3
        ├── portfolio/
        │   ├── landschappen.jpg
        │   ├── portretten.jpg
        │   ├── branding.jpg
        │   ├── ui-ux.jpg
        │   ├── ai-visuals.jpg
        │   └── ai-campaigns.jpg
        └── gallery/
            ├── landschappen/
            │   └── 01.jpg - 06.jpg
            ├── portretten/
            │   └── 01.jpg - 06.jpg
            ├── branding/
            │   └── 01.jpg - 06.jpg
            ├── ui-ux/
            │   └── 01.jpg - 06.jpg
            ├── ai-visuals/
            │   └── 01.jpg - 06.jpg
            └── ai-campaigns/
                └── 01.jpg - 06.jpg
```

## Afbeeldingen

### Formaten & Aanbevolen afmetingen

| Type | Formaat | Aanbevolen grootte |
|------|---------|-------------------|
| Hero slides | JPG/PNG | 1920×1080px of groter |
| Portfolio covers | JPG/PNG | 800×600px of groter |
| Gallery items | JPG/PNG | 1200×800px of groter |
| About foto | JPG/PNG | 600×800px of groter |

### Afbeeldingen toevoegen

1. Plaats originele (ongecomprimeerde) afbeeldingen in de juiste map
2. Gebruik de exacte bestandsnamen zoals hierboven
3. Netlify comprimeert en optimaliseert automatisch bij deployment

### Gallery aanpassen

Om meer/minder afbeeldingen per gallery te tonen, bewerk `js/main.js`:

```javascript
const galleryData = {
  'landschappen': {
    title: 'Landschappen',
    category: 'Fotografie',
    images: [
      { src: '/assets/images/gallery/landschappen/01.jpg', alt: 'Beschrijving' },
      { src: '/assets/images/gallery/landschappen/02.jpg', alt: 'Beschrijving' },
      // Voeg meer toe of verwijder regels
    ]
  },
  // ...
};
```

## Kleuren

| Kleur | Hex | Gebruik |
|-------|-----|---------|
| Oranje | `#F26419` | Accent, buttons, highlights |
| Oranje dark | `#D85A17` | Hover states |
| Antraciet | `#2D2D2D` | Tekst, donkere achtergronden |
| Wit | `#FFFFFF` | Achtergronden |
| Lichtgrijs | `#F5F5F5` | Sectie achtergronden |
| Tekstgrijs | `#666666` | Body tekst |

## Fonts

- **Headings**: Space Grotesk (Google Fonts)
- **Body**: Inter (Google Fonts)

## Deployment

### Netlify (aanbevolen)

1. Push code naar GitHub/GitLab
2. Verbind repository met Netlify
3. Deploy settings:
   - Build command: (leeg laten)
   - Publish directory: `.`
4. Koppel custom domein (creacas.nl)

### Handmatig

1. Ga naar [netlify.com](https://netlify.com)
2. Drag & drop de `2026` map
3. Site is live op random Netlify URL
4. Koppel custom domein in Site settings > Domain management

## Lokaal testen

Open `index.html` direct in de browser, of gebruik een lokale server:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve

# PHP
php -S localhost:8000
```

De site detecteert automatisch lokale ontwikkeling en laadt afbeeldingen zonder Netlify CDN.

## Content aanpassen

### Teksten

Alle teksten staan in `index.html`. Zoek naar de relevante sectie:
- Hero: regel ~70
- Portfolio: regel ~85
- Services: regel ~155
- Over Mij: regel ~210
- Contact: regel ~240

### Contact informatie

Bewerk in `index.html`:
- E-mail: zoek naar `info@creacas.nl`
- Social links: zoek naar `instagram.com/creacas` etc.

### Statistieken (Over Mij)

```html
<div class="stat">
  <span class="stat-number">5+</span>
  <span class="stat-label">Jaar Ervaring</span>
</div>
```

## Contact formulier

Het formulier is frontend-only. Voor echte verzending:

### Optie 1: Netlify Forms
Voeg toe aan het `<form>` element:
```html
<form class="contact-form" name="contact" method="POST" data-netlify="true">
```

### Optie 2: Formspree
Vervang form action:
```html
<form class="contact-form" action="https://formspree.io/f/xxxxx" method="POST">
```

## Browser Support

- Chrome (laatste 2 versies)
- Firefox (laatste 2 versies)
- Safari (laatste 2 versies)
- Edge (laatste 2 versies)

## Performance

Netlify Image CDN zorgt voor:
- Automatische WebP/AVIF conversie
- Responsive sizing
- Lazy loading
- Caching (1 jaar)

## Licentie

Copyright 2026 CreaCas. Alle rechten voorbehouden.
