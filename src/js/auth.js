import { ORDERS_KEY, SESSION_KEY, USERS_KEY } from './storage-keys.js';

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(email, password, name = '') {
  const users = readUsers();
  const normalized = email.trim().toLowerCase();
  if (users[normalized]) {
    return { ok: false, message: 'An account with this email already exists' };
  }
  users[normalized] = { password, name: name.trim() || normalized.split('@')[0] };
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: normalized, name: users[normalized].name }));
  return { ok: true };
}

export function loginUser(email, password) {
  const users = readUsers();
  const normalized = email.trim().toLowerCase();
  const user = users[normalized];
  if (!user) return { ok: false, message: 'User not found. Create an account.' };
  if (user.password !== password) return { ok: false, message: 'Incorrect password' };
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: normalized, name: user.name }));
  return { ok: true };
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function createOrder({ customer, items, total, payment }) {
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

export function getOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]');
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

export function getOrder(id) {
  return getOrders().find((order) => order.id === id) ?? null;
}

export function getOrdersForEmail(email) {
  const normalized = email.trim().toLowerCase();
  return getOrders().filter((order) => order.customer?.email?.toLowerCase() === normalized);
}

export function validatePassword(password) {
  if (password.length < 7 || password.length > 15) {
    return 'Password must be 7–15 characters';
  }
  if (!/[A-Z]/.test(password)) return 'Include an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Include a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Include a number';
  if (!/[!@#$%^&*()]/.test(password)) return 'Include a special character !@#$%^&*()';
  if (/[^!@#$%^&*()A-Za-z0-9]/.test(password)) return 'Password contains invalid characters';
  return null;
}

export function generatePassword(length = 10) {
  const chars = 'QWERTYUIOPqwertyuiop1234567890!@#$%^&*()';
  let pass = '';
  for (let i = 0; i < length; i += 1) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}
