function renderCart(items) {
  const empty = document.getElementById('cartEmpty');
  const content = document.getElementById('cartContent');
  const list = document.getElementById('cartItems');
  const summaryCount = document.getElementById('summaryCount');
  const summaryTotal = document.getElementById('summaryTotal');

  if (!empty || !content || !list) return;

  if (!items.length) {
    empty.hidden = false;
    content.hidden = true;
    list.innerHTML = '';
    return;
  }

  empty.hidden = true;
  content.hidden = false;

  list.innerHTML = items
    .map(
      (item) => `
        <article class="cart-line" data-cart-key="${escapeHtml(item.key)}">
          <div class="cart-line__media">
            <img src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async" />
          </div>
          <div class="cart-line__body">
            <h3 class="cart-line__title">${escapeHtml(item.title)}</h3>
            <p class="cart-line__meta">Size ${escapeHtml(item.size)}</p>
            <div class="cart-line__actions">
              <div class="qty-stepper">
                <button type="button" class="qty-stepper__btn cart-minus" data-cart-key="${escapeHtml(item.key)}" aria-label="Decrease quantity">−</button>
                <input class="qty-stepper__input cart-qty" type="number" min="1" max="9" value="${item.qty}" data-cart-key="${escapeHtml(item.key)}" aria-label="Quantity" />
                <button type="button" class="qty-stepper__btn cart-plus" data-cart-key="${escapeHtml(item.key)}" aria-label="Increase quantity">+</button>
              </div>
              <button type="button" class="cart-line__remove cart-remove" data-cart-key="${escapeHtml(item.key)}">Remove</button>
            </div>
          </div>
          <p class="cart-line__price">${formatPrice(item.price * item.qty)}</p>
        </article>
      `,
    )
    .join('');

  if (summaryCount) summaryCount.textContent = String(getCartCount());
  if (summaryTotal) summaryTotal.textContent = formatPrice(getCartTotal());
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
    const removeBtn = event.target.closest('.cart-remove');

    if (minus) {
      const key = minus.dataset.cartKey;
      const item = getCartItems().find((entry) => entry.key === key);
      if (item) updateCartQty(key, item.qty - 1);
      return;
    }

    if (plus) {
      const key = plus.dataset.cartKey;
      const item = getCartItems().find((entry) => entry.key === key);
      if (item) updateCartQty(key, item.qty + 1);
      return;
    }

    if (!removeBtn) return;
    removeFromCart(removeBtn.dataset.cartKey);
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

    if (errorEl) errorEl.textContent = '';

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

function initCartPage() {
  renderCart(getCartItems());
  bindCartEvents();
  onCartChange(renderCart);
}

initCartPage();
