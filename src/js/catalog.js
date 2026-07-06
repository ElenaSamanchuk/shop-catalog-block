import {
  fetchCategories,
  fetchProduct,
  fetchProducts,
  formatCategory,
  formatPrice,
} from './api.js';
import { addToCart } from './cart-store.js';
import { mountLayout, bindCartSync, showToast, syncCartBadge, starsHtml } from './ui.js';
import { renderProductCard } from './designs/layouts.js';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const state = {
  products: [],
  categories: [],
  category: 'all',
  query: '',
  sort: 'default',
};

function filteredProducts() {
  let list = [...state.products];
  const q = state.query.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q),
    );
  }
  switch (state.sort) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      list.sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0));
      break;
    default:
      break;
  }
  return list;
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const status = document.getElementById('catalogStatus');
  if (!grid) return;

  const list = filteredProducts();
  if (!list.length) {
    grid.innerHTML =
      '<p class="col-span-full py-20 text-center text-ink-muted">No results. Try a different filter.</p>';
    if (status) status.textContent = '0 items';
    return;
  }

  grid.innerHTML = list.map((product) => renderProductCard(product)).join('');

  if (status) status.textContent = `${list.length} ${list.length === 1 ? 'item' : 'items'}`;
}

function renderFilters() {
  const root = document.getElementById('categoryFilters');
  if (!root) return;

  root.innerHTML = [
    `<button type="button" class="filter-chip ${state.category === 'all' ? 'is-active' : ''}" data-category="all">All products</button>`,
    ...state.categories.map(
      (cat) =>
        `<button type="button" class="filter-chip ${state.category === cat ? 'is-active' : ''}" data-category="${cat}">${formatCategory(cat)}</button>`,
    ),
  ].join('');
}

async function loadCatalog(category = state.category) {
  state.category = category;
  const grid = document.getElementById('productGrid');
  if (grid) {
    grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-24 gap-4">
        <div class="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin"></div>
        <span class="text-sm text-ink-muted">Loading collection...</span>
      </div>`;
  }

  try {
    state.products = await fetchProducts(category);
    renderFilters();
    renderProducts();
  } catch {
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-20">
          <p class="text-ink-muted mb-6">Catalog is temporarily unavailable</p>
          <button type="button" class="btn-primary" id="retryCatalog">Try again</button>
        </div>`;
      document.getElementById('retryCatalog')?.addEventListener('click', () => loadCatalog(category));
    }
  }
}

function bindCatalogControls() {
  document.getElementById('categoryFilters')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-category]');
    if (!btn) return;
    loadCatalog(btn.dataset.category);
  });

  document.getElementById('searchInput')?.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderProducts();
  });

  document.getElementById('sortSelect')?.addEventListener('change', (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  document.getElementById('productGrid')?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-product-id]');
    if (!card) return;
    openProductModal(Number(card.dataset.productId));
  });
}

function findProduct(id) {
  return state.products.find((item) => item.id === id) ?? null;
}

function setHeroVideoPaused(paused) {
  const video = document.querySelector('#hero video');
  if (!video) return;
  if (paused) video.pause();
  else video.play().catch(() => {});
}

function showModalShell() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.classList.add('overflow-hidden');
  setHeroVideoPaused(true);
}

function hideModalShell() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.classList.remove('overflow-hidden');
  setHeroVideoPaused(false);
}

function bindSizePills(container, defaultSize = 'M') {
  container.querySelectorAll('[data-size]').forEach((pill) => {
    pill.classList.toggle('is-selected', pill.dataset.size === defaultSize);
  });
  return defaultSize;
}

function ensureModalShell() {
  const modal = document.getElementById('productModal');
  if (!modal || modal.dataset.ready === 'true') return;

  let selectedSize = 'M';
  let activeProduct = null;

  modal.innerHTML = `
    <div class="modal-panel modal-panel--sheet" id="productModalPanel">
      <div class="md:hidden w-10 h-1 bg-line rounded-full mx-auto mt-3 mb-1"></div>
      <button type="button" data-close-modal class="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center text-ink-muted hover:text-ink bg-surface border border-line" aria-label="Close">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
      <div class="grid md:grid-cols-2">
        <div class="bg-line-soft flex items-center justify-center p-8 md:p-12 min-h-[280px]">
          <img id="modalImage" alt="" class="max-h-[340px] object-contain" decoding="async" />
        </div>
        <div class="p-6 md:p-10 flex flex-col border-t md:border-t-0 md:border-l border-line">
          <p class="label-caps mb-2" id="modalCategory"></p>
          <h2 class="heading-display text-2xl md:text-3xl mb-3" id="modalTitle"></h2>
          <p class="text-xl font-medium mb-1" id="modalPrice"></p>
          <p class="text-xs text-ink-muted mb-6" id="modalRating"></p>
          <p class="text-sm text-ink-soft leading-relaxed mb-8 line-clamp-6" id="modalDescription"></p>

          <p class="label-caps mb-3">Size</p>
          <div class="flex flex-wrap gap-2 mb-6" id="sizePills">
            ${SIZES.map((s) => `<button type="button" data-size="${s}" class="size-pill">${s}</button>`).join('')}
          </div>

          <div class="flex items-center gap-4 mb-8">
            <p class="label-caps shrink-0">Qty</p>
            <div class="qty-stepper">
              <button type="button" data-qty-minus class="qty-stepper__btn">−</button>
              <input type="number" id="qtyInput" min="1" max="9" value="1" class="qty-stepper__input" />
              <button type="button" data-qty-plus class="qty-stepper__btn">+</button>
            </div>
          </div>

          <div class="mt-auto md:static pt-4 pb-6 md:pb-0 md:pt-0">
            <button type="button" id="addToCartBtn" class="btn-primary w-full">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.dataset.ready = 'true';

  const qtyInput = document.getElementById('qtyInput');
  modal.querySelector('[data-qty-minus]')?.addEventListener('click', () => {
    if (!qtyInput) return;
    qtyInput.value = String(Math.max(1, Number(qtyInput.value) - 1));
  });
  modal.querySelector('[data-qty-plus]')?.addEventListener('click', () => {
    if (!qtyInput) return;
    qtyInput.value = String(Math.min(9, Number(qtyInput.value) + 1));
  });
  modal.querySelector('[data-close-modal]')?.addEventListener('click', hideModalShell);

  const sizePills = document.getElementById('sizePills');
  sizePills?.addEventListener('click', (event) => {
    const pill = event.target.closest('[data-size]');
    if (!pill) return;
    selectedSize = pill.dataset.size;
    sizePills.querySelectorAll('[data-size]').forEach((p) => p.classList.toggle('is-selected', p === pill));
  });

  document.getElementById('addToCartBtn')?.addEventListener('click', () => {
    if (!activeProduct) return;
    const qty = Math.max(1, Number(qtyInput?.value ?? 1));
    addToCart(activeProduct, { size: selectedSize, qty });
    syncCartBadge();
    showToast('Added to cart');
  });

  modal.renderProduct = (product) => {
    activeProduct = product;
    const rate = product.rating?.rate ?? 0;
    const image = document.getElementById('modalImage');
    const nextSrc = product.image;

    document.getElementById('modalCategory').textContent = formatCategory(product.category);
    document.getElementById('modalTitle').textContent = product.title;
    document.getElementById('modalPrice').textContent = formatPrice(product.price);
    document.getElementById('modalRating').innerHTML = `${starsHtml(rate)} · ${product.rating?.count ?? 0} reviews`;
    document.getElementById('modalDescription').textContent = product.description;

    if (image && image.getAttribute('src') !== nextSrc) image.src = nextSrc;
    if (qtyInput) qtyInput.value = '1';
    selectedSize = bindSizePills(sizePills, 'M');
  };
}

async function openProductModal(id) {
  const modal = document.getElementById('productModal');
  if (!modal) return;

  let product = findProduct(id);
  if (!product) {
    showModalShell();
    modal.innerHTML = `<div class="modal-panel p-12 text-center"><div class="w-8 h-8 border-2 border-line border-t-ink rounded-full animate-spin mx-auto"></div></div>`;
    modal.dataset.ready = 'false';
    try {
      product = await fetchProduct(id);
      ensureModalShell();
    } catch {
      modal.innerHTML = `
        <div class="modal-panel p-12 text-center max-w-md mx-auto">
          <p class="text-ink-muted mb-6">Could not load product</p>
          <button type="button" class="btn-outline" data-close-modal>Close</button>
        </div>`;
      modal.querySelector('[data-close-modal]')?.addEventListener('click', hideModalShell);
      return;
    }
  } else {
    ensureModalShell();
    showModalShell();
  }

  modal.renderProduct?.(product);
}

function bindModal() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModalShell();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideModalShell();
  });
}

function onDesignChange() {
  mountLayout({ active: 'home' });
  renderFilters();
  renderProducts();
}

export async function initCatalogPage() {
  mountLayout({ active: 'home' });
  bindCartSync();
  bindCatalogControls();
  bindModal();
  ensureModalShell();
  window.addEventListener('designchange', onDesignChange);

  try {
    state.categories = await fetchCategories();
  } catch {
    state.categories = [];
  }

  await loadCatalog('all');
}
