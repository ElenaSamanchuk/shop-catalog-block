import { formatPrice } from './api.js';
import { getOrder } from './auth.js';
import { mountLayout, bindCartSync } from './ui.js';

export function initSuccessPage() {
  mountLayout({ active: 'cart' });
  bindCartSync();

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order');
  const idEl = document.getElementById('orderId');
  const detailsEl = document.getElementById('orderDetails');

  if (!orderId || !idEl || !detailsEl) {
    if (idEl) idEl.textContent = 'Order not found';
    return;
  }

  const order = getOrder(orderId);
  if (!order) {
    idEl.textContent = orderId;
    detailsEl.textContent = 'Order details unavailable. Check your email for confirmation.';
    return;
  }

  idEl.textContent = order.id;
  const itemsList = order.items
    .map((item) => `<li>${item.title} · ${item.size} × ${item.qty} — ${formatPrice(item.price * item.qty)}</li>`)
    .join('');

  detailsEl.innerHTML = `
    <p><strong>Status:</strong> ${order.status}</p>
    <p><strong>Recipient:</strong> ${order.customer.name}</p>
    <p><strong>Email:</strong> ${order.customer.email}</p>
    <p><strong>Phone:</strong> ${order.customer.phone}</p>
    <p><strong>Address:</strong> ${order.customer.address}</p>
    <p><strong>Payment:</strong> ${order.payment}</p>
    <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
    <ul style="margin-top:0.75rem;padding-left:1.1rem;">${itemsList}</ul>
  `;
}
