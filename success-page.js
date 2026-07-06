function initSuccessPage() {
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
    detailsEl.textContent = 'Order details unavailable.';
    return;
  }

  idEl.textContent = order.id;

  const itemsList = order.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.title)} · ${escapeHtml(item.size)} × ${item.qty} — ${formatPrice(item.price * item.qty)}</li>`,
    )
    .join('');

  detailsEl.innerHTML = `
    <p><strong>Status:</strong> ${escapeHtml(order.status)}</p>
    <p><strong>Recipient:</strong> ${escapeHtml(order.customer.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(order.customer.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(order.customer.phone)}</p>
    <p><strong>Address:</strong> ${escapeHtml(order.customer.address)}</p>
    <p><strong>Payment:</strong> ${escapeHtml(order.payment)}</p>
    <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
    <ul class="order-details__list">${itemsList}</ul>
  `;
}

initSuccessPage();
