/* ============================================
   Widget Editor - CreaCas CMS
   ============================================ */

let currentPageId = null;
let widgetInstances = [];
let quillInstances = {};
let sortableInstance = null;

const WIDGET_LABELS = {
  text: 'Tekst',
  heading: 'Heading',
  spacer: 'Spacer',
  image: 'Afbeelding',
  gallery: 'Galerij',
  video: 'Video',
  columns: 'Kolommen',
  cards: 'Cards',
  cta: 'Call to Action',
  accordion: 'Accordion',
  quote: 'Quote',
  'before-after': 'Before/After'
};

const DEFAULT_CONFIGS = {
  text: { html: '' },
  heading: { text: '', level: 2, subtitle: '', alignment: 'left' },
  spacer: { height: 40, show_line: false },
  image: { image_path: '', alt_text: '', caption: '', layout: 'full-width' },
  gallery: { images: [], columns: 3, lightbox: true },
  video: { url: '', provider: '', embed_id: '', caption: '' },
  columns: { layout: 'text-image', reversed: false, left_content: '', left_image: '', right_content: '', right_image: '' },
  cards: { cards: [{ icon_svg: '', image_path: '', title: '', text: '', button_text: '', button_link: '' }] },
  cta: { heading: '', text: '', button_text: '', button_link: '', style: 'dark' },
  accordion: { items: [{ title: '', content: '' }] },
  quote: { text: '', author: '', source: '' },
  'before-after': { before_image: '', after_image: '', before_label: 'Before', after_label: 'After', caption: '', start_position: 50, layout: 'full' }
};

function initWidgetEditor(pageId, widgets) {
  currentPageId = pageId;
  widgetInstances = widgets.map(w => ({ ...w }));
  renderAllWidgets();
  initWidgetSortable();
}

function initWidgetSortable() {
  var list = document.getElementById('widgetList');
  if (!list) return;
  if (sortableInstance) sortableInstance.destroy();
  sortableInstance = Sortable.create(list, {
    handle: '.widget-header',
    filter: '.widget-action-btn',
    preventOnFilter: false,
    draggable: '.widget-block',
    animation: 200,
    ghostClass: 'widget-ghost',
    chosenClass: 'widget-chosen',
    dragClass: 'widget-dragging',
    fallbackOnBody: true,
    swapThreshold: 0.65,
    onEnd: function () {
      var items = list.querySelectorAll('.widget-block');
      var reordered = [];
      items.forEach(function(el) {
        var id = parseInt(el.dataset.widgetId);
        var w = widgetInstances.find(function(w) { return w.id === id; });
        if (w) reordered.push(w);
      });
      widgetInstances = reordered;
    }
  });
}

function renderAllWidgets() {
  const list = document.getElementById('widgetList');
  list.innerHTML = '';
  quillInstances = {};

  for (const widget of widgetInstances) {
    const el = createWidgetBlock(widget);
    list.appendChild(el);
  }

  // Initialize Quill editors after DOM is ready
  requestAnimationFrame(() => {
    for (const widget of widgetInstances) {
      if (widget.type === 'text') {
        initQuillForWidget(widget.id, widget.config.html || '');
      }
      if (widget.type === 'columns') {
        const c = widget.config;
        if (c.layout === 'text-text' || c.layout === 'text-image') {
          initQuillForWidget(`${widget.id}-left`, c.left_content || '');
        }
        if (c.layout === 'text-text' || c.layout === 'image-text') {
          initQuillForWidget(`${widget.id}-right`, c.right_content || '');
        }
      }
      if (widget.type === 'accordion') {
        const items = widget.config.items || [];
        items.forEach((item, idx) => {
          initQuillForWidget(`${widget.id}-acc-${idx}`, item.content || '');
        });
      }
    }
  });
}

function createWidgetBlock(widget) {
  const block = document.createElement('div');
  block.className = 'widget-block';
  block.dataset.widgetId = widget.id;

  block.innerHTML = `
    <div class="widget-header">
      <div class="widget-drag-handle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16"/></svg>
      </div>
      <span class="widget-type-label">${WIDGET_LABELS[widget.type] || widget.type}</span>
      <div class="widget-actions">
        <button class="widget-action-btn" onclick="toggleWidgetBody(${widget.id})" title="Inklappen/Uitklappen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <button class="widget-action-btn" onclick="duplicateWidget(${widget.id})" title="Dupliceren">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
        </button>
        <button class="widget-action-btn widget-action-danger" onclick="deleteWidget(${widget.id})" title="Verwijderen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>
    <div class="widget-body" id="widget-body-${widget.id}">
      ${renderWidgetEditor(widget)}
    </div>
  `;

  return block;
}

function renderWidgetEditor(widget) {
  const c = widget.config;
  switch (widget.type) {
    case 'text':
      return `<div id="quill-toolbar-${widget.id}">
        <span class="ql-formats"><button class="ql-bold"></button><button class="ql-italic"></button></span>
        <span class="ql-formats"><select class="ql-header"><option value="2">H2</option><option value="3">H3</option><option selected value="">Normaal</option></select></span>
        <span class="ql-formats"><button class="ql-list" value="ordered"></button><button class="ql-list" value="bullet"></button><button class="ql-blockquote"></button></span>
        <span class="ql-formats"><button class="ql-align" value=""></button><button class="ql-align" value="center"></button><button class="ql-align" value="right"></button><button class="ql-align" value="justify"></button></span>
        <span class="ql-formats"><button class="ql-link"></button></span>
        <span class="ql-formats"><button class="ql-clean"></button></span>
      </div>
      <div id="quill-editor-${widget.id}" class="quill-editor widget-quill-editor"></div>`;

    case 'heading':
      return `<div class="form-row">
        <div class="form-group"><label>Tekst</label><input type="text" class="form-control" value="${escAttr(c.text || '')}" onchange="updateWidgetConfig(${widget.id}, 'text', this.value)"></div>
        <div class="form-group"><label>Niveau</label><select class="form-control" onchange="updateWidgetConfig(${widget.id}, 'level', parseInt(this.value))">
          <option value="1" ${c.level === 1 ? 'selected' : ''}>H1</option>
          <option value="2" ${c.level === 2 ? 'selected' : ''}>H2</option>
          <option value="3" ${c.level === 3 ? 'selected' : ''}>H3</option>
        </select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Ondertitel</label><input type="text" class="form-control" value="${escAttr(c.subtitle || '')}" onchange="updateWidgetConfig(${widget.id}, 'subtitle', this.value)"></div>
        <div class="form-group"><label>Uitlijning</label><select class="form-control" onchange="updateWidgetConfig(${widget.id}, 'alignment', this.value)">
          <option value="left" ${c.alignment === 'left' ? 'selected' : ''}>Links</option>
          <option value="center" ${c.alignment === 'center' ? 'selected' : ''}>Midden</option>
          <option value="right" ${c.alignment === 'right' ? 'selected' : ''}>Rechts</option>
        </select></div>
      </div>`;

    case 'spacer':
      return `<div class="form-row">
        <div class="form-group"><label>Hoogte (px)</label><select class="form-control" onchange="updateWidgetConfig(${widget.id}, 'height', parseInt(this.value))">
          ${[20,30,40,50,60,80,100].map(h => `<option value="${h}" ${c.height === h ? 'selected' : ''}>${h}px</option>`).join('')}
        </select></div>
        <div class="form-group"><label class="checkbox-label" style="margin-top:1.5rem"><input type="checkbox" ${c.show_line ? 'checked' : ''} onchange="updateWidgetConfig(${widget.id}, 'show_line', this.checked)"> Toon lijn</label></div>
      </div>`;

    case 'image':
      return `<div class="widget-image-upload">
        ${c.image_path ? `<img src="${c.image_path}" class="widget-image-preview" id="img-preview-${widget.id}">` : `<div class="widget-image-placeholder" id="img-preview-${widget.id}">Geen afbeelding</div>`}
        <input type="file" accept="image/*" class="form-control" style="max-width:300px" id="img-input-${widget.id}">
        <button class="btn btn-primary btn-sm" onclick="uploadWidgetImage(${widget.id}, 'image_path')">Uploaden</button>
      </div>
      <div class="form-row" style="margin-top:1rem">
        <div class="form-group"><label>Alt tekst</label><input type="text" class="form-control" value="${escAttr(c.alt_text || '')}" onchange="updateWidgetConfig(${widget.id}, 'alt_text', this.value)"></div>
        <div class="form-group"><label>Layout</label><select class="form-control" onchange="updateWidgetConfig(${widget.id}, 'layout', this.value)">
          <option value="full-width" ${c.layout === 'full-width' ? 'selected' : ''}>Volledige breedte</option>
          <option value="centered" ${c.layout === 'centered' ? 'selected' : ''}>Gecentreerd</option>
          <option value="left" ${c.layout === 'left' ? 'selected' : ''}>Links</option>
          <option value="right" ${c.layout === 'right' ? 'selected' : ''}>Rechts</option>
        </select></div>
      </div>
      <div class="form-group"><label>Bijschrift</label><input type="text" class="form-control" value="${escAttr(c.caption || '')}" onchange="updateWidgetConfig(${widget.id}, 'caption', this.value)"></div>`;

    case 'gallery':
      return `<div class="form-row" style="margin-bottom:1rem">
        <div class="form-group"><label>Kolommen</label><select class="form-control" onchange="updateWidgetConfig(${widget.id}, 'columns', parseInt(this.value))">
          <option value="2" ${c.columns === 2 ? 'selected' : ''}>2</option>
          <option value="3" ${c.columns === 3 ? 'selected' : ''}>3</option>
          <option value="4" ${c.columns === 4 ? 'selected' : ''}>4</option>
        </select></div>
        <div class="form-group"><label class="checkbox-label" style="margin-top:1.5rem"><input type="checkbox" ${c.lightbox !== false ? 'checked' : ''} onchange="updateWidgetConfig(${widget.id}, 'lightbox', this.checked)"> Lightbox</label></div>
      </div>
      <div class="widget-gallery-grid" id="gallery-grid-${widget.id}">
        ${(c.images || []).map((img, idx) => `
          <div class="widget-gallery-item" data-index="${idx}">
            <img src="${img.image_path || img.thumbnail_path}" alt="${escAttr(img.alt_text || '')}">
            <button class="widget-gallery-remove" onclick="removeGalleryImage(${widget.id}, ${idx})">&times;</button>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:0.75rem">
        <input type="file" accept="image/*" multiple class="form-control" style="max-width:300px;display:inline-block" id="gallery-input-${widget.id}">
        <button class="btn btn-primary btn-sm" onclick="uploadGalleryImages(${widget.id})">Toevoegen</button>
      </div>`;

    case 'video':
      return `<div class="form-group"><label>YouTube of Vimeo URL</label><input type="text" class="form-control" value="${escAttr(c.url || '')}" onchange="parseVideoUrl(${widget.id}, this.value)" placeholder="https://www.youtube.com/watch?v=... of https://vimeo.com/..."></div>
      ${c.embed_id ? `<div class="widget-video-preview"><iframe src="${getEmbedUrl(c.provider, c.embed_id)}" frameborder="0" allowfullscreen></iframe></div>` : ''}
      <div class="form-group"><label>Bijschrift</label><input type="text" class="form-control" value="${escAttr(c.caption || '')}" onchange="updateWidgetConfig(${widget.id}, 'caption', this.value)"></div>`;

    case 'columns':
      return `<div class="form-row" style="margin-bottom:1rem">
        <div class="form-group"><label>Layout</label><select class="form-control" onchange="changeColumnLayout(${widget.id}, this.value)" id="col-layout-${widget.id}">
          <option value="text-image" ${c.layout === 'text-image' ? 'selected' : ''}>Tekst | Afbeelding</option>
          <option value="image-text" ${c.layout === 'image-text' ? 'selected' : ''}>Afbeelding | Tekst</option>
          <option value="text-text" ${c.layout === 'text-text' ? 'selected' : ''}>Tekst | Tekst</option>
        </select></div>
      </div>
      <div class="widget-columns-editor" id="col-editor-${widget.id}">
        ${renderColumnPanels(widget)}
      </div>`;

    case 'cards':
      return `<div id="cards-container-${widget.id}">
        ${(c.cards || []).map((card, idx) => renderCardEditor(widget.id, card, idx)).join('')}
      </div>
      ${(c.cards || []).length < 3 ? `<button class="btn btn-secondary btn-sm" onclick="addCard(${widget.id})" style="margin-top:0.75rem">+ Card toevoegen</button>` : ''}`;

    case 'cta':
      return `<div class="form-group"><label>Heading</label><input type="text" class="form-control" value="${escAttr(c.heading || '')}" onchange="updateWidgetConfig(${widget.id}, 'heading', this.value)"></div>
      <div class="form-group"><label>Tekst</label><textarea class="form-control" rows="2" onchange="updateWidgetConfig(${widget.id}, 'text', this.value)">${escAttr(c.text || '')}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Knoptekst</label><input type="text" class="form-control" value="${escAttr(c.button_text || '')}" onchange="updateWidgetConfig(${widget.id}, 'button_text', this.value)"></div>
        <div class="form-group"><label>Knoplink</label><input type="text" class="form-control" value="${escAttr(c.button_link || '')}" onchange="updateWidgetConfig(${widget.id}, 'button_link', this.value)"></div>
      </div>
      <div class="form-group"><label>Stijl</label><select class="form-control" onchange="updateWidgetConfig(${widget.id}, 'style', this.value)">
        <option value="dark" ${c.style === 'dark' ? 'selected' : ''}>Donker</option>
        <option value="accent" ${c.style === 'accent' ? 'selected' : ''}>Accent (Oranje)</option>
      </select></div>`;

    case 'accordion':
      return `<div id="accordion-container-${widget.id}">
        ${(c.items || []).map((item, idx) => renderAccordionItemEditor(widget.id, item, idx)).join('')}
      </div>
      <button class="btn btn-secondary btn-sm" onclick="addAccordionItem(${widget.id})" style="margin-top:0.75rem">+ Item toevoegen</button>`;

    case 'quote':
      return `<div class="form-group"><label>Citaat</label><textarea class="form-control" rows="3" onchange="updateWidgetConfig(${widget.id}, 'text', this.value)">${escAttr(c.text || '')}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Auteur</label><input type="text" class="form-control" value="${escAttr(c.author || '')}" onchange="updateWidgetConfig(${widget.id}, 'author', this.value)"></div>
        <div class="form-group"><label>Bron</label><input type="text" class="form-control" value="${escAttr(c.source || '')}" onchange="updateWidgetConfig(${widget.id}, 'source', this.value)"></div>
      </div>`;

    case 'before-after':
      return `<div class="form-row" style="margin-bottom:1rem">
        <div class="form-group"><label>Layout</label><select class="form-control" onchange="updateWidgetConfig(${widget.id}, 'layout', this.value)">
          <option value="full" ${(c.layout || 'full') === 'full' ? 'selected' : ''}>Volledige breedte</option>
          <option value="half" ${c.layout === 'half' ? 'selected' : ''}>Halve breedte (naast elkaar)</option>
        </select></div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Before afbeelding</label>
          <div class="widget-image-upload">
            ${c.before_image ? `<img src="${c.before_image}" class="widget-image-preview" id="ba-before-preview-${widget.id}">` : `<div class="widget-image-placeholder" id="ba-before-preview-${widget.id}">Geen afbeelding</div>`}
            <div>
              <input type="file" accept="image/*" class="form-control" style="max-width:250px" id="ba-before-input-${widget.id}">
              <button class="btn btn-primary btn-sm" style="margin-top:0.5rem" onclick="uploadBeforeAfterImage(${widget.id}, 'before')">Uploaden</button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>After afbeelding</label>
          <div class="widget-image-upload">
            ${c.after_image ? `<img src="${c.after_image}" class="widget-image-preview" id="ba-after-preview-${widget.id}">` : `<div class="widget-image-placeholder" id="ba-after-preview-${widget.id}">Geen afbeelding</div>`}
            <div>
              <input type="file" accept="image/*" class="form-control" style="max-width:250px" id="ba-after-input-${widget.id}">
              <button class="btn btn-primary btn-sm" style="margin-top:0.5rem" onclick="uploadBeforeAfterImage(${widget.id}, 'after')">Uploaden</button>
            </div>
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Before label</label><input type="text" class="form-control" value="${escAttr(c.before_label || 'Before')}" onchange="updateWidgetConfig(${widget.id}, 'before_label', this.value)"></div>
        <div class="form-group"><label>After label</label><input type="text" class="form-control" value="${escAttr(c.after_label || 'After')}" onchange="updateWidgetConfig(${widget.id}, 'after_label', this.value)"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Startpositie slider (%)</label><input type="range" min="10" max="90" value="${c.start_position || 50}" class="form-control" style="padding:0.3rem 0" oninput="updateWidgetConfig(${widget.id}, 'start_position', parseInt(this.value)); this.nextElementSibling.textContent = this.value + '%'"><span style="font-size:0.85rem;color:var(--admin-text-muted)">${c.start_position || 50}%</span></div>
        <div class="form-group"><label>Bijschrift</label><input type="text" class="form-control" value="${escAttr(c.caption || '')}" onchange="updateWidgetConfig(${widget.id}, 'caption', this.value)"></div>
      </div>`;

    default:
      return `<p>Onbekend widget type: ${widget.type}</p>`;
  }
}

function renderColumnPanels(widget) {
  const c = widget.config;
  const layout = c.layout || 'text-image';
  let leftPanel = '', rightPanel = '';

  if (layout === 'text-image' || layout === 'text-text') {
    leftPanel = `<div class="widget-column-panel">
      <label>Linker kolom (tekst)</label>
      <div id="quill-toolbar-${widget.id}-left">
        <span class="ql-formats"><button class="ql-bold"></button><button class="ql-italic"></button></span>
        <span class="ql-formats"><button class="ql-list" value="ordered"></button><button class="ql-list" value="bullet"></button></span>
        <span class="ql-formats"><button class="ql-link"></button></span>
      </div>
      <div id="quill-editor-${widget.id}-left" class="quill-editor widget-quill-editor-sm"></div>
    </div>`;
  } else {
    leftPanel = `<div class="widget-column-panel">
      <label>Linker kolom (afbeelding)</label>
      ${c.left_image ? `<img src="${c.left_image}" class="widget-image-preview">` : ''}
      <input type="file" accept="image/*" class="form-control" style="max-width:250px" id="img-input-${widget.id}-left">
      <button class="btn btn-primary btn-sm" onclick="uploadColumnImage(${widget.id}, 'left')">Uploaden</button>
    </div>`;
  }

  if (layout === 'text-text' || layout === 'image-text') {
    rightPanel = `<div class="widget-column-panel">
      <label>Rechter kolom (tekst)</label>
      <div id="quill-toolbar-${widget.id}-right">
        <span class="ql-formats"><button class="ql-bold"></button><button class="ql-italic"></button></span>
        <span class="ql-formats"><button class="ql-list" value="ordered"></button><button class="ql-list" value="bullet"></button></span>
        <span class="ql-formats"><button class="ql-link"></button></span>
      </div>
      <div id="quill-editor-${widget.id}-right" class="quill-editor widget-quill-editor-sm"></div>
    </div>`;
  } else {
    rightPanel = `<div class="widget-column-panel">
      <label>Rechter kolom (afbeelding)</label>
      ${c.right_image ? `<img src="${c.right_image}" class="widget-image-preview">` : ''}
      <input type="file" accept="image/*" class="form-control" style="max-width:250px" id="img-input-${widget.id}-right">
      <button class="btn btn-primary btn-sm" onclick="uploadColumnImage(${widget.id}, 'right')">Uploaden</button>
    </div>`;
  }

  return `<div class="widget-columns-grid">${leftPanel}${rightPanel}</div>`;
}

function renderCardEditor(widgetId, card, idx) {
  return `<div class="widget-card-editor" data-card-index="${idx}">
    <div class="widget-card-header">
      <strong>Card ${idx + 1}</strong>
      <button class="widget-action-btn widget-action-danger" onclick="removeCard(${widgetId}, ${idx})" title="Verwijderen">&times;</button>
    </div>
    <div class="form-group"><label>Titel</label><input type="text" class="form-control" value="${escAttr(card.title || '')}" onchange="updateCardField(${widgetId}, ${idx}, 'title', this.value)"></div>
    <div class="form-group"><label>Tekst</label><textarea class="form-control" rows="2" onchange="updateCardField(${widgetId}, ${idx}, 'text', this.value)">${escAttr(card.text || '')}</textarea></div>
    <div class="form-group"><label>Icon SVG</label><textarea class="form-control form-control-sm" rows="2" placeholder="<svg>...</svg>" onchange="updateCardField(${widgetId}, ${idx}, 'icon_svg', this.value)">${escAttr(card.icon_svg || '')}</textarea></div>
    <div class="widget-image-upload">
      ${card.image_path ? `<img src="${card.image_path}" class="widget-image-preview-sm">` : ''}
      <input type="file" accept="image/*" class="form-control" style="max-width:250px" id="card-img-${widgetId}-${idx}">
      <button class="btn btn-primary btn-sm" onclick="uploadCardImage(${widgetId}, ${idx})">Uploaden</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Knoptekst</label><input type="text" class="form-control" value="${escAttr(card.button_text || '')}" onchange="updateCardField(${widgetId}, ${idx}, 'button_text', this.value)"></div>
      <div class="form-group"><label>Knoplink</label><input type="text" class="form-control" value="${escAttr(card.button_link || '')}" onchange="updateCardField(${widgetId}, ${idx}, 'button_link', this.value)"></div>
    </div>
  </div>`;
}

function renderAccordionItemEditor(widgetId, item, idx) {
  return `<div class="widget-accordion-item-editor" data-acc-index="${idx}">
    <div class="widget-card-header">
      <strong>Item ${idx + 1}</strong>
      <button class="widget-action-btn widget-action-danger" onclick="removeAccordionItem(${widgetId}, ${idx})" title="Verwijderen">&times;</button>
    </div>
    <div class="form-group"><label>Titel</label><input type="text" class="form-control" value="${escAttr(item.title || '')}" onchange="updateAccordionField(${widgetId}, ${idx}, 'title', this.value)"></div>
    <div class="form-group">
      <label>Content</label>
      <div id="quill-toolbar-${widgetId}-acc-${idx}">
        <span class="ql-formats"><button class="ql-bold"></button><button class="ql-italic"></button></span>
        <span class="ql-formats"><button class="ql-list" value="ordered"></button><button class="ql-list" value="bullet"></button></span>
        <span class="ql-formats"><button class="ql-link"></button></span>
      </div>
      <div id="quill-editor-${widgetId}-acc-${idx}" class="quill-editor widget-quill-editor-sm"></div>
    </div>
  </div>`;
}

// === Quill helpers ===
function initQuillForWidget(id, content) {
  const editorEl = document.getElementById(`quill-editor-${id}`);
  const toolbarEl = document.getElementById(`quill-toolbar-${id}`);
  if (!editorEl || !toolbarEl) return;

  const q = new Quill(editorEl, {
    theme: 'snow',
    modules: { toolbar: toolbarEl }
  });
  q.root.innerHTML = content;
  quillInstances[id] = q;
}

// === Config updates ===
function updateWidgetConfig(widgetId, key, value) {
  const w = widgetInstances.find(w => w.id === widgetId);
  if (w) w.config[key] = value;
}

function updateCardField(widgetId, cardIdx, field, value) {
  const w = widgetInstances.find(w => w.id === widgetId);
  if (w && w.config.cards && w.config.cards[cardIdx]) {
    w.config.cards[cardIdx][field] = value;
  }
}

function updateAccordionField(widgetId, itemIdx, field, value) {
  const w = widgetInstances.find(w => w.id === widgetId);
  if (w && w.config.items && w.config.items[itemIdx]) {
    w.config.items[itemIdx][field] = value;
  }
}

// === Widget actions ===
function toggleWidgetPicker() {
  const picker = document.getElementById('widgetPicker');
  picker.classList.toggle('widget-picker-open');
}

function toggleWidgetBody(widgetId) {
  const body = document.getElementById(`widget-body-${widgetId}`);
  body.style.display = body.style.display === 'none' ? 'block' : 'none';
}

async function addWidget(type) {
  try {
    const config = JSON.parse(JSON.stringify(DEFAULT_CONFIGS[type] || {}));
    const res = await fetch(`/backend/api/pages/${currentPageId}/widgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, config })
    });
    const data = await res.json();
    if (data.success) {
      widgetInstances.push({ id: data.id, type, config });
      renderAllWidgets();
      initWidgetSortable();
      document.getElementById('widgetPicker').classList.remove('widget-picker-open');
      showToast(`${WIDGET_LABELS[type]} widget toegevoegd`);
    }
  } catch (err) {
    showToast('Widget toevoegen mislukt', 'error');
  }
}

async function duplicateWidget(widgetId) {
  try {
    collectQuillContent();
    const res = await fetch(`/backend/api/widgets/${widgetId}/duplicate`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      const original = widgetInstances.find(w => w.id === widgetId);
      const idx = widgetInstances.indexOf(original);
      const newWidget = { id: data.id, type: original.type, config: JSON.parse(JSON.stringify(original.config)) };
      widgetInstances.splice(idx + 1, 0, newWidget);
      renderAllWidgets();
      initWidgetSortable();
      showToast('Widget gedupliceerd');
    }
  } catch (err) {
    showToast('Dupliceren mislukt', 'error');
  }
}

async function deleteWidget(widgetId) {
  if (!confirm('Widget verwijderen?')) return;
  try {
    const res = await fetch(`/backend/api/widgets/${widgetId}`, { method: 'DELETE' });
    if (res.ok) {
      widgetInstances = widgetInstances.filter(w => w.id !== widgetId);
      renderAllWidgets();
      initWidgetSortable();
      showToast('Widget verwijderd');
    }
  } catch (err) {
    showToast('Verwijderen mislukt', 'error');
  }
}

// === Collect Quill content before saving ===
function collectQuillContent() {
  for (const widget of widgetInstances) {
    if (widget.type === 'text' && quillInstances[widget.id]) {
      widget.config.html = quillInstances[widget.id].root.innerHTML;
    }
    if (widget.type === 'columns') {
      const leftQ = quillInstances[`${widget.id}-left`];
      const rightQ = quillInstances[`${widget.id}-right`];
      if (leftQ) widget.config.left_content = leftQ.root.innerHTML;
      if (rightQ) widget.config.right_content = rightQ.root.innerHTML;
    }
    if (widget.type === 'accordion' && widget.config.items) {
      widget.config.items.forEach((item, idx) => {
        const q = quillInstances[`${widget.id}-acc-${idx}`];
        if (q) item.content = q.root.innerHTML;
      });
    }
  }
}

// === Save all ===
async function saveAllWidgets() {
  collectQuillContent();
  const widgets = widgetInstances.map(w => ({
    id: w.id,
    type: w.type,
    config: w.config
  }));

  try {
    const res = await fetch(`/backend/api/pages/${currentPageId}/widgets/bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widgets })
    });
    if (res.ok) showToast('Alle widgets opgeslagen!');
    else showToast('Opslaan mislukt', 'error');
  } catch (err) {
    showToast('Opslaan mislukt', 'error');
  }
}

// === Image uploads ===
async function uploadWidgetImage(widgetId, configKey) {
  const input = document.getElementById(`img-input-${widgetId}`);
  if (!input || !input.files[0]) return showToast('Selecteer eerst een afbeelding', 'error');

  const form = new FormData();
  form.append('image', input.files[0]);

  try {
    const res = await fetch('/backend/api/widgets/upload-image', { method: 'POST', body: form });
    const data = await res.json();
    if (data.success) {
      updateWidgetConfig(widgetId, configKey, data.image_path);
      // Update preview
      const preview = document.getElementById(`img-preview-${widgetId}`);
      if (preview) {
        if (preview.tagName === 'IMG') {
          preview.src = data.image_path;
        } else {
          preview.outerHTML = `<img src="${data.image_path}" class="widget-image-preview" id="img-preview-${widgetId}">`;
        }
      }
      showToast('Afbeelding geupload');
    }
  } catch (err) {
    showToast('Upload mislukt', 'error');
  }
}

async function uploadGalleryImages(widgetId) {
  const input = document.getElementById(`gallery-input-${widgetId}`);
  if (!input || !input.files.length) return showToast('Selecteer eerst afbeeldingen', 'error');

  const w = widgetInstances.find(w => w.id === widgetId);
  if (!w) return;
  if (!w.config.images) w.config.images = [];

  for (const file of input.files) {
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch('/backend/api/widgets/upload-image', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) {
        w.config.images.push({ image_path: data.image_path, thumbnail_path: data.thumbnail_path, alt_text: '' });
      }
    } catch (err) { /* skip failed uploads */ }
  }

  collectQuillContent();
  renderAllWidgets();
  initWidgetSortable();
  showToast('Afbeeldingen toegevoegd');
}

function removeGalleryImage(widgetId, idx) {
  const w = widgetInstances.find(w => w.id === widgetId);
  if (w && w.config.images) {
    w.config.images.splice(idx, 1);
    collectQuillContent();
    renderAllWidgets();
    initWidgetSortable();
  }
}

async function uploadColumnImage(widgetId, side) {
  const input = document.getElementById(`img-input-${widgetId}-${side}`);
  if (!input || !input.files[0]) return showToast('Selecteer eerst een afbeelding', 'error');

  const form = new FormData();
  form.append('image', input.files[0]);

  try {
    const res = await fetch('/backend/api/widgets/upload-image', { method: 'POST', body: form });
    const data = await res.json();
    if (data.success) {
      const key = side === 'left' ? 'left_image' : 'right_image';
      updateWidgetConfig(widgetId, key, data.image_path);
      collectQuillContent();
      renderAllWidgets();
      initWidgetSortable();
      showToast('Afbeelding geupload');
    }
  } catch (err) {
    showToast('Upload mislukt', 'error');
  }
}

async function uploadCardImage(widgetId, cardIdx) {
  const input = document.getElementById(`card-img-${widgetId}-${cardIdx}`);
  if (!input || !input.files[0]) return showToast('Selecteer eerst een afbeelding', 'error');

  const form = new FormData();
  form.append('image', input.files[0]);

  try {
    const res = await fetch('/backend/api/widgets/upload-image', { method: 'POST', body: form });
    const data = await res.json();
    if (data.success) {
      updateCardField(widgetId, cardIdx, 'image_path', data.image_path);
      collectQuillContent();
      renderAllWidgets();
      initWidgetSortable();
      showToast('Afbeelding geupload');
    }
  } catch (err) {
    showToast('Upload mislukt', 'error');
  }
}

// === Before/After image upload ===
async function uploadBeforeAfterImage(widgetId, side) {
  const input = document.getElementById(`ba-${side}-input-${widgetId}`);
  if (!input || !input.files[0]) return showToast('Selecteer eerst een afbeelding', 'error');

  const form = new FormData();
  form.append('image', input.files[0]);

  try {
    const res = await fetch('/backend/api/widgets/upload-image', { method: 'POST', body: form });
    const data = await res.json();
    if (data.success) {
      const key = side === 'before' ? 'before_image' : 'after_image';
      updateWidgetConfig(widgetId, key, data.image_path);
      const preview = document.getElementById(`ba-${side}-preview-${widgetId}`);
      if (preview) {
        if (preview.tagName === 'IMG') {
          preview.src = data.image_path;
        } else {
          preview.outerHTML = `<img src="${data.image_path}" class="widget-image-preview" id="ba-${side}-preview-${widgetId}">`;
        }
      }
      showToast('Afbeelding geupload');
    }
  } catch (err) {
    showToast('Upload mislukt', 'error');
  }
}

// === Cards management ===
function addCard(widgetId) {
  const w = widgetInstances.find(w => w.id === widgetId);
  if (!w || !w.config.cards) return;
  if (w.config.cards.length >= 3) return showToast('Maximaal 3 cards', 'error');
  w.config.cards.push({ icon_svg: '', image_path: '', title: '', text: '', button_text: '', button_link: '' });
  collectQuillContent();
  renderAllWidgets();
  initWidgetSortable();
}

function removeCard(widgetId, idx) {
  const w = widgetInstances.find(w => w.id === widgetId);
  if (w && w.config.cards) {
    w.config.cards.splice(idx, 1);
    collectQuillContent();
    renderAllWidgets();
    initWidgetSortable();
  }
}

// === Accordion management ===
function addAccordionItem(widgetId) {
  const w = widgetInstances.find(w => w.id === widgetId);
  if (!w || !w.config.items) return;
  collectQuillContent();
  w.config.items.push({ title: '', content: '' });
  renderAllWidgets();
  initWidgetSortable();
}

function removeAccordionItem(widgetId, idx) {
  const w = widgetInstances.find(w => w.id === widgetId);
  if (w && w.config.items) {
    collectQuillContent();
    w.config.items.splice(idx, 1);
    renderAllWidgets();
    initWidgetSortable();
  }
}

// === Column layout change ===
function changeColumnLayout(widgetId, newLayout) {
  const w = widgetInstances.find(w => w.id === widgetId);
  if (!w) return;
  collectQuillContent();
  w.config.layout = newLayout;
  renderAllWidgets();
  initWidgetSortable();
}

// === Video URL parsing ===
function parseVideoUrl(widgetId, url) {
  const w = widgetInstances.find(w => w.id === widgetId);
  if (!w) return;

  w.config.url = url;
  w.config.provider = '';
  w.config.embed_id = '';

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    w.config.provider = 'youtube';
    w.config.embed_id = ytMatch[1];
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    w.config.provider = 'vimeo';
    w.config.embed_id = vimeoMatch[1];
  }

  collectQuillContent();
  renderAllWidgets();
  initWidgetSortable();
}

function getEmbedUrl(provider, embedId) {
  if (provider === 'youtube') return `https://www.youtube-nocookie.com/embed/${embedId}`;
  if (provider === 'vimeo') return `https://player.vimeo.com/video/${embedId}`;
  return '';
}

// === Helpers ===
function escAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
