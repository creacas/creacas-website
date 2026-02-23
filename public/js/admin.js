// ============================================
// CreaCas CMS - Admin Panel JavaScript
// ============================================

// Toast notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Initialize SortableJS on a list
function initSortable(elementId, reorderUrl) {
  const el = document.getElementById(elementId);
  if (!el) return;

  new Sortable(el, {
    handle: '.drag-handle',
    animation: 200,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: async () => {
      const items = el.querySelectorAll('[data-id]');
      const ids = Array.from(items).map(item => parseInt(item.dataset.id));
      try {
        await fetch(reorderUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids })
        });
        showToast('Volgorde opgeslagen');
      } catch (err) {
        showToast('Volgorde opslaan mislukt', 'error');
      }
    }
  });
}
