import { formatCategory, formatPrice } from '../api.js';

function navLink(active) {
  return `nav-link ${active ? 'is-active' : ''}`;
}

function cartButton(count) {
  return `
    <a href="./cart.html" class="header-action relative" aria-label="Cart">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9H7.5L6 6Z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
      <span data-cart-count class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold bg-accent text-accent-text rounded-full ${count ? '' : 'hidden'}">${count}</span>
    </a>`;
}

export function renderHeader({ active, accountHref, accountLabel, count }) {
  return `
    <header class="site-header" data-header data-overlay="false">
      <div class="site-header__bar">
        <a href="./index.html" class="brand">Still</a>
        <nav class="hidden md:flex items-center gap-1">
          <a href="./index.html" class="${navLink(active === 'home')}">Home</a>
          <a href="./index.html#products" class="${navLink(false)}">Shop</a>
          <a href="${accountHref}" class="${navLink(active === 'account')}">${accountLabel}</a>
        </nav>
        <div class="flex items-center gap-1">
          ${cartButton(count)}
          <button type="button" data-mobile-toggle class="header-action md:hidden" aria-label="Menu">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </div>
      <div data-mobile-menu class="hidden md:hidden max-w-4xl mx-auto mt-2 pointer-events-auto rounded-2xl bg-surface ring-1 ring-[color:var(--color-ring)] shadow-lg overflow-hidden">
        <div class="px-2 py-2 flex flex-col">
          <a href="./index.html" class="nav-link py-3 px-3">Home</a>
          <a href="./index.html#products" class="nav-link py-3 px-3">Shop</a>
          <a href="${accountHref}" class="nav-link py-3 px-3">${accountLabel}</a>
        </div>
      </div>
    </header>`;
}

export function renderFooter({ accountHref }) {
  return `
    <footer class="site-footer mt-20" id="contact">
      <div class="page-wrap py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div class="sm:col-span-2 lg:col-span-1">
          <p class="brand text-lg mb-3">Still</p>
          <p class="text-sm text-ink-muted leading-relaxed max-w-xs">Modern everyday clothing. Simple shopping, fast checkout.</p>
        </div>
        <div>
          <p class="text-sm font-semibold mb-4">Shop</p>
          <ul class="space-y-2.5 text-sm text-ink-muted">
            <li><a href="./index.html#products" class="hover:text-ink">All products</a></li>
            <li><a href="./cart.html" class="hover:text-ink">Cart</a></li>
            <li><a href="${accountHref}" class="hover:text-ink">Account</a></li>
          </ul>
        </div>
        <div>
          <p class="text-sm font-semibold mb-4">Help</p>
          <ul class="space-y-2.5 text-sm text-ink-muted">
            <li><a href="mailto:hello@still.store" class="hover:text-ink">hello@still.store</a></li>
            <li>Free shipping over $100</li>
            <li>14-day returns</li>
          </ul>
        </div>
        <div>
          <p class="text-sm font-semibold mb-4">Newsletter</p>
          <p class="text-sm text-ink-muted">Get drops and restock alerts.</p>
        </div>
      </div>
      <div class="border-t border-line">
        <div class="page-wrap py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-ink-muted">
          <span>© ${new Date().getFullYear()} Still</span>
          <span>Privacy · Terms</span>
        </div>
      </div>
    </footer>`;
}

export function renderProductCard(product) {
  return `
    <article class="product-card group" data-product-id="${product.id}">
      <div class="product-card__image-wrap">
        <img src="${product.image}" alt="" loading="lazy" />
        <span class="product-card__quick">View</span>
      </div>
      <div class="product-card__body">
        <p class="product-card__meta">${formatCategory(product.category)}</p>
        <h3 class="product-card__title">${product.title}</h3>
        <p class="product-card__price">${formatPrice(product.price)}</p>
      </div>
    </article>`;
}

export function getCatalogShellClass() {
  return 'catalog-shell';
}

export function usesOverlayHeader() {
  return false;
}
