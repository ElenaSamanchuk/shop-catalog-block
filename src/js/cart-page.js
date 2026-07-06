import { formatPrice } from './api.js';
import {
  clearCart,
  getCartCount,
  getCartItems,
  getCartTotal,
  onCartChange,
  removeFromCart,
  updateCartQty,
} from './cart-store.js';
import { createOrder, getSession } from './auth.js';
import { mountLayout, bindCartSync, showToast } from './ui.js';

function renderCart(items) {
  const empty = document.getElementById('cartEmpty');
  const content = document.getElementById('cartContent');
  const list = document.getElementById('cartItems');
  const summaryCount = document.getElementById('summaryCount');
  const summaryTotal = document.getElementById('summaryTotal');

  if (!empty || !content || !list) return;

  if (!items.length) {
    empty.classList.remove('hidden');
    content.classList.add('hidden');
    list.innerHTML = '';
    return;
  }

  empty.classList.add('hidden');
  content.classList.remove('hidden');

  list.innerHTML = items
    .map(
      (item) => `
        <article class="cart-line" data-cart-key="${item.key}">
          <div class="w-24 h-32 sm:w-28 sm:h-36 bg-line-soft shrink-0 flex items-center justify-center p-2">
            <img src="${item.image}" alt="" loading="lazy" class="max-w-full max-h-full object-contain" />
          </div>
          <div class="flex-1 min-w-0 flex flex-col py-0.5">
            <h3 class="text-sm text-ink mb-1 line-clamp-2">${item.title}</h3>
            <p class="text-xs text-ink-muted mb-4">Size ${item.size}</p>
            <div class="mt-auto flex items-center gap-3">
              <div class="qty-stepper">
                <button type="button" class="qty-stepper__btn cart-minus" data-cart-key="${item.key}">−</button>
                <input class="qty-stepper__input cart-qty" type="number" min="1" max="9" value="${item.qty}" data-cart-key="${item.key}" aria-label="Quantity" />
                <button type="button" class="qty-stepper__btn cart-plus" data-cart-key="${item.key}">+</button>
              </div>
              <button type="button" class="text-xs text-ink-muted hover:text-ink cart-remove ml-auto" data-cart-key="${item.key}">Remove</button>
            </div>
          </div>
          <p class="text-sm font-medium shrink-0 pt-0.5">${formatPrice(item.price * item.qty)}</p>
        </article>
      `,
    )
    .join('');

  const total = getCartTotal();
  const count = getCartCount();
  if (summaryCount) summaryCount.textContent = String(count);
  if (summaryTotal) summaryTotal.textContent = formatPrice(total);
}

function prefillCheckout() {
  const session = getSession();
  if (!session) return;
  const emailInput = document.getElementById('emailInput');
  const nameInput = document.getElementById('nameInput');
  if (emailInput && !emailInput.value) emailInput.value = session.email;
  if (nameInput && !nameInput.value && session.name) nameInput.value = session.name;
}

function bindCartEvents() {
  document.getElementById('cartItems')?.addEventListener('input', (event) => {
    const input = event.target.closest('.cart-qty');
    if (!input) return;
    updateCartQty(input.dataset.cartKey, Number(input.value));
  });

  document.getElementById('cartItems')?.addEventListener('click', (event) => {
    const minus = event.target.closest('.cart-minus');
    const plus = event.target.closest('.cart-plus');
    const button = event.target.closest('.cart-remove');
    if (minus) {
      const key = minus.dataset.cartKey;
      const item = getCartItems().find((i) => i.key === key);
      if (item) updateCartQty(key, item.qty - 1);
      return;
    }
    if (plus) {
      const key = plus.dataset.cartKey;
      const item = getCartItems().find((i) => i.key === key);
      if (item) updateCartQty(key, item.qty + 1);
      return;
    }
    if (!button) return;
    removeFromCart(button.dataset.cartKey);
    showToast('Removed from cart');
  });

  document.getElementById('checkoutForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const errorEl = document.getElementById('checkoutError');
    const items = getCartItems();

    if (!items.length) {
      if (errorEl) errorEl.textContent = 'Your cart is empty';
      return;
    }

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const address = form.address.value.trim();
    const payment = form.payment.value;

    if (name.length < 2 || !email || phone.length < 8 || address.length < 8) {
      if (errorEl) errorEl.textContent = 'Please fill in all fields';
      return;
    }

    const order = createOrder({
      customer: { name, email, phone, address },
      items,
      total: getCartTotal(),
      payment: payment === 'cash' ? 'Cash on delivery' : 'Credit card',
    });

    clearCart();
    window.location.href = `./success.html?order=${encodeURIComponent(order.id)}`;
  });
}

export function initCartPage() {
  mountLayout({ active: 'cart' });
  bindCartSync();
  renderCart(getCartItems());
  prefillCheckout();
  bindCartEvents();
  onCartChange(renderCart);
}
