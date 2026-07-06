const API = 'https://fakestoreapi.com';

export async function fetchCategories() {
  const res = await fetch(`${API}/products/categories`);
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export async function fetchProducts(category = 'all') {
  const url =
    category === 'all' ? `${API}/products` : `${API}/products/category/${encodeURIComponent(category)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`${API}/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export function formatCategory(label) {
  return label
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export function ratingBadgeClass(rate) {
  if (rate >= 4.5) return 'bg-green-100 text-green-800';
  if (rate >= 3.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}
