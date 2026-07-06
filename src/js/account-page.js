import { formatPrice } from './api.js';
import { getOrdersForEmail, getSession, logoutUser } from './auth.js';
import { mountLayout, bindCartSync } from './ui.js';

function formatDate(iso) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

function renderOrders(orders) {
  const list = document.getElementById('ordersList');
  if (!list) return;

  if (!orders.length) {
    list.innerHTML =
      '<p class="p-6 text-sm text-ink-muted">No orders yet. <a href="./index.html#products" class="underline hover:text-ink">Browse shop</a></p>';
    return;
  }

  list.innerHTML = orders
    .map(
      (order) => `
        <article class="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-line-soft transition-colors">
          <div>
            <p class="text-sm font-medium">${order.id}</p>
            <p class="text-xs text-ink-muted mt-1">${formatDate(order.createdAt)} · ${order.items.length} items</p>
          </div>
          <p class="text-xs uppercase tracking-wider text-ink-muted">${order.status}</p>
          <p class="text-sm font-medium">${formatPrice(order.total)}</p>
          <a href="./success.html?order=${encodeURIComponent(order.id)}" class="text-xs uppercase tracking-wider text-ink hover:underline">Details</a>
        </article>
      `,
    )
    .join('');
}

export function initAccountPage() {
  const session = getSession();
  if (!session) {
    window.location.href = './login.html';
    return;
  }

  mountLayout({ active: 'account' });
  bindCartSync();

  document.getElementById('accountGreeting').textContent = session.name;
  document.getElementById('profileName').textContent = session.name;
  document.getElementById('profileEmail').textContent = session.email;

  renderOrders(getOrdersForEmail(session.email));

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logoutUser();
    window.location.href = './login.html';
  });
}
