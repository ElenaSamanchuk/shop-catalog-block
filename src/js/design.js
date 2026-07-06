export const DESIGNS = [
  { id: 'flow', label: 'Light', hint: 'Modern light UI' },
  { id: 'night', label: 'Dark', hint: 'Modern dark UI' },
];

const STORAGE_KEY = 'still-store-design';
const LEGACY_MAP = { still: 'flow', market: 'flow', luxe: 'flow', studio: 'flow' };

export function getDesignId() {
  const fromUrl = new URLSearchParams(window.location.search).get('design');
  if (fromUrl) {
    const mapped = LEGACY_MAP[fromUrl] ?? fromUrl;
    if (DESIGNS.some((d) => d.id === mapped)) return mapped;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const mapped = LEGACY_MAP[saved] ?? saved;
      if (DESIGNS.some((d) => d.id === mapped)) return mapped;
    }
  } catch {
    /* ignore */
  }
  return 'night';
}

export function applyDesign(id, { silent = false } = {}) {
  const mapped = LEGACY_MAP[id] ?? id;
  const designId = DESIGNS.some((d) => d.id === mapped) ? mapped : 'night';
  document.documentElement.dataset.design = designId;
  try {
    localStorage.setItem(STORAGE_KEY, designId);
  } catch {
    /* ignore */
  }

  document.querySelectorAll('[data-design-option]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.designOption === designId);
  });

  document.querySelectorAll('[data-design-hero]').forEach((hero) => {
    hero.hidden = hero.dataset.designHero !== designId;
  });

  if (!silent) {
    window.dispatchEvent(new CustomEvent('designchange', { detail: designId }));
  }
}

function buildSwitcher() {
  if (document.getElementById('designPreviewSwitcher')) return;

  const host = document.createElement('div');
  host.id = 'designPreviewSwitcher';
  host.className = 'design-switcher';
  host.innerHTML = `
    <p class="design-switcher__hint">Appearance</p>
    <div class="design-switcher__options">
      ${DESIGNS.map(
        (d) =>
          `<button type="button" class="design-switcher__btn" data-design-option="${d.id}" title="${d.hint}">${d.label}</button>`,
      ).join('')}
    </div>
  `;

  host.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-design-option]');
    if (!btn) return;
    applyDesign(btn.dataset.designOption);
  });

  document.body.appendChild(host);
}

export function initDesign() {
  applyDesign(getDesignId(), { silent: true });
  buildSwitcher();
}
