const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const CART_KEY = 'still-catalog-block-cart';

const state = {
  products: [],
  category: 'all',
  query: '',
  sort: 'default',
  activeProduct: null,
  selectedSize: 'M',
};

function formatCategory(label) {
  return label
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function addToCart(product, { size = 'M', qty = 1 } = {}) {
  const items = readCart();
  const key = `${product.id}-${size}`;
  const existing = items.find((item) => item.key === key);

  if (existing) {
    existing.qty += qty;
  } else {
    items.push({
      key,
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      category: product.category,
      size,
      qty,
    });
  }

  writeCart(items);
  return items;
}

function showToast(message) {
  let host = document.getElementById('toastHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'toast-host';
    document.body.appendChild(host);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  host.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

function renderProductCard(product) {
  return `
    <article class="product-card" data-product-id="${product.id}" tabindex="0" role="button" aria-label="View ${escapeHtml(product.title)}">
      <div class="product-card__image-wrap">
        <img src="${escapeHtml(product.image)}" alt="" width="640" height="800" loading="lazy" decoding="async" />
        <span class="product-card__quick">View</span>
      </div>
      <div class="product-card__body">
        <p class="product-card__meta">${escapeHtml(formatCategory(product.category))}</p>
        <h2 class="product-card__title">${escapeHtml(product.title)}</h2>
        <p class="product-card__price">${formatPrice(product.price)}</p>
      </div>
    </article>`;
}

function getCategories() {
  return [...new Set(state.products.map((item) => item.category))].sort();
}

function filteredProducts() {
  let list = [...state.products];

  if (state.category !== 'all') {
    list = list.filter((item) => item.category === state.category);
  }

  const q = state.query.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q),
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

function renderFilters() {
  const root = document.getElementById('categoryFilters');
  if (!root) return;

  const chips = [
    `<button type="button" class="filter-chip${state.category === 'all' ? ' is-active' : ''}" data-category="all">All products</button>`,
    ...getCategories().map(
      (cat) =>
        `<button type="button" class="filter-chip${state.category === cat ? ' is-active' : ''}" data-category="${escapeHtml(cat)}">${escapeHtml(formatCategory(cat))}</button>`,
    ),
  ];

  root.innerHTML = chips.join('');
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const status = document.getElementById('catalogStatus');
  if (!grid) return;

  const list = filteredProducts();

  if (!list.length) {
    grid.innerHTML =
      '<p class="product-grid__empty">No results. Try a different filter.</p>';
    if (status) status.textContent = '0 items';
    return;
  }

  grid.innerHTML = list.map((product) => renderProductCard(product)).join('');
  if (status) status.textContent = `${list.length} ${list.length === 1 ? 'item' : 'items'}`;
}

function setSelectedSize(size) {
  if (!SIZES.includes(size)) return;
  state.selectedSize = size;
  document.querySelectorAll('#sizePills [data-size]').forEach((pill) => {
    pill.classList.toggle('is-selected', pill.dataset.size === size);
  });
}

function resetQty() {
  const qtyInput = document.getElementById('qtyInput');
  if (qtyInput) qtyInput.value = '1';
}

function getQtyValue() {
  const qtyInput = document.getElementById('qtyInput');
  const value = Math.max(1, Math.min(9, Number(qtyInput?.value ?? 1)));
  if (qtyInput) qtyInput.value = String(value);
  return value;
}

function openModal(product) {
  const modal = document.getElementById('productModal');
  if (!modal) return;

  state.activeProduct = product;
  state.selectedSize = 'M';

  document.getElementById('modalCategory').textContent = formatCategory(product.category);
  document.getElementById('modalTitle').textContent = product.title;
  document.getElementById('modalPrice').textContent = formatPrice(product.price);
  document.getElementById('modalRating').textContent = `${product.rating?.rate ?? 0} · ${product.rating?.count ?? 0} reviews`;
  document.getElementById('modalDescription').textContent = product.description;
  document.getElementById('modalImage').src = product.image;

  setSelectedSize('M');
  resetQty();

  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal() {
  const modal = document.getElementById('productModal');
  if (!modal) return;

  state.activeProduct = null;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function findProduct(id) {
  return state.products.find((item) => item.id === id) ?? null;
}

function bindModalControls() {
  document.getElementById('sizePills')?.addEventListener('click', (event) => {
    const pill = event.target.closest('[data-size]');
    if (!pill) return;
    setSelectedSize(pill.dataset.size ?? 'M');
  });

  document.getElementById('qtyMinus')?.addEventListener('click', () => {
    const qtyInput = document.getElementById('qtyInput');
    if (!qtyInput) return;
    qtyInput.value = String(Math.max(1, Number(qtyInput.value) - 1));
  });

  document.getElementById('qtyPlus')?.addEventListener('click', () => {
    const qtyInput = document.getElementById('qtyInput');
    if (!qtyInput) return;
    qtyInput.value = String(Math.min(9, Number(qtyInput.value) + 1));
  });

  document.getElementById('qtyInput')?.addEventListener('change', () => {
    getQtyValue();
  });

  document.getElementById('addToCartBtn')?.addEventListener('click', () => {
    if (!state.activeProduct) return;
    const qty = getQtyValue();
    addToCart(state.activeProduct, { size: state.selectedSize, qty });
    showToast('Added to cart');
  });
}

function bindControls() {
  bindModalControls();

  document.getElementById('categoryFilters')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-category]');
    if (!btn) return;
    state.category = btn.dataset.category ?? 'all';
    renderFilters();
    renderProducts();
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
    const product = findProduct(Number(card.dataset.productId));
    if (product) openModal(product);
  });

  document.getElementById('productGrid')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('[data-product-id]');
    if (!card) return;
    event.preventDefault();
    const product = findProduct(Number(card.dataset.productId));
    if (product) openModal(product);
  });

  document.getElementById('productModal')?.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-modal]')) closeModal();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

async function init() {
  bindControls();

  try {
    const response = await fetch('./products.json');
    if (!response.ok) throw new Error('Failed to load products');
    state.products = await response.json();
    renderFilters();
    renderProducts();
  } catch {
    const grid = document.getElementById('productGrid');
    if (grid) {
      grid.innerHTML = '<p class="product-grid__empty">Catalog is temporarily unavailable.</p>';
    }
  }
}

init();
