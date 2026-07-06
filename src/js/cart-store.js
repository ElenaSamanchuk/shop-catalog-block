import { CART_KEY } from './storage-keys.js';

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
}

export function getCartItems() {
  return readCart();
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + item.qty, 0);
}

export function getCartTotal() {
  return readCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function addToCart(product, { size = 'M', qty = 1 } = {}) {
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

export function updateCartQty(key, qty) {
  const items = readCart();
  const item = items.find((entry) => entry.key === key);
  if (!item) return items;

  if (qty <= 0) {
    writeCart(items.filter((entry) => entry.key !== key));
    return getCartItems();
  }

  item.qty = qty;
  writeCart(items);
  return items;
}

export function removeFromCart(key) {
  const items = readCart().filter((entry) => entry.key !== key);
  writeCart(items);
  return items;
}

export function clearCart() {
  writeCart([]);
}

export function onCartChange(callback) {
  const handler = (event) => callback(event.detail.items);
  window.addEventListener('cart:updated', handler);
  return () => window.removeEventListener('cart:updated', handler);
}
