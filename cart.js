const CART_KEY = 'still-catalog-block-cart';
const ORDERS_KEY = 'still-catalog-block-orders';

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
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
  updateCartBadge();
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

function getCartItems() {
  return readCart();
}

function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return readCart().reduce((sum, item) => sum + item.price * item.qty, 0);
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

function updateCartQty(key, qty) {
  const items = readCart();
  const item = items.find((entry) => entry.key === key);
  if (!item) return items;

  if (qty <= 0) {
    writeCart(items.filter((entry) => entry.key !== key));
    return getCartItems();
  }

  item.qty = Math.max(1, Math.min(9, qty));
  writeCart(items);
  return items;
}

function removeFromCart(key) {
  const items = readCart().filter((entry) => entry.key !== key);
  writeCart(items);
  return items;
}

function clearCart() {
  writeCart([]);
}

function onCartChange(callback) {
  const handler = (event) => callback(event.detail.items);
  window.addEventListener('cart:updated', handler);
  return () => window.removeEventListener('cart:updated', handler);
}

function createOrder({ customer, items, total, payment }) {
  const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const order = {
    id,
    createdAt: new Date().toISOString(),
    customer,
    items,
    total,
    payment,
    status: 'Processing',
  };

  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]');
    if (!Array.isArray(orders)) orders = [];
  } catch {
    orders = [];
  }

  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 20)));
  return order;
}

function getOrder(orderId) {
  try {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]');
    if (!Array.isArray(orders)) return null;
    return orders.find((entry) => entry.id === orderId) ?? null;
  } catch {
    return null;
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;

  const count = getCartCount();
  badge.textContent = String(count);
  badge.hidden = count === 0;
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

function bindCartBadge() {
  updateCartBadge();
  onCartChange(() => updateCartBadge());
}

document.addEventListener('DOMContentLoaded', bindCartBadge);
