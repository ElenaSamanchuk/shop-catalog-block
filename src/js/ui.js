import { getCartCount, onCartChange } from './cart-store.js';
import { getSession } from './auth.js';
import { initFlowbite } from 'flowbite';
import { renderHeader, renderFooter } from './designs/layouts.js';

export function mountLayout({ active = 'home' } = {}) {
  const session = getSession();
  const count = getCartCount();
  const accountHref = session ? './account.html' : './login.html';
  const accountLabel = session ? session.name.split(' ')[0] : 'Sign in';

  const layoutOpts = { active, accountHref, accountLabel, count };

  document.querySelectorAll('[data-site-header]').forEach((node) => {
    node.innerHTML = renderHeader(layoutOpts);
  });

  document.querySelectorAll('[data-site-footer]').forEach((node) => {
    node.innerHTML = renderFooter({ accountHref });
  });

  bindMobileMenu();
  syncCartBadge();
  initFlowbite();
}

function bindMobileMenu() {
  document.querySelectorAll('[data-mobile-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelector('[data-mobile-menu]')?.classList.toggle('hidden');
    });
  });
}

export function bindHeaderScroll() {}

export function syncCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('[data-cart-count]').forEach((badge) => {
    badge.textContent = String(count);
    badge.classList.toggle('hidden', count <= 0);
  });
}

export function bindCartSync() {
  onCartChange(syncCartBadge);
}

export function showToast(message) {
  let host = document.getElementById('toastHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[100] flex justify-center';
    document.body.appendChild(host);
  }

  const toast = document.createElement('div');
  toast.className =
    'bg-accent text-accent-text text-sm font-medium px-5 py-3 rounded-2xl shadow-lg opacity-0 translate-y-2 transition-all duration-300';
  toast.textContent = message;
  host.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove('opacity-0', 'translate-y-2'));
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

export function starsHtml(rate) {
  const full = Math.floor(rate);
  return `<span class="text-ink-muted text-xs">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span>`;
}
