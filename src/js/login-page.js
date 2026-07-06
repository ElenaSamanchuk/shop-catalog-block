import {
  generatePassword,
  getSession,
  loginUser,
  registerUser,
  validatePassword,
} from './auth.js';

let mode = 'login';

function setMode(next) {
  mode = next;
  document.querySelectorAll('[data-auth-mode]').forEach((btn) => {
    const active = btn.dataset.authMode === mode;
    btn.classList.toggle('bg-accent', active);
    btn.classList.toggle('text-accent-text', active);
    btn.classList.toggle('text-ink-muted', !active);
  });

  const nameField = document.getElementById('nameField');
  const submit = document.getElementById('authSubmit');
  if (nameField) nameField.classList.toggle('hidden', mode !== 'register');
  if (submit) submit.textContent = mode === 'register' ? 'Create account' : 'Sign in';
  setMessage('');
}

function setMessage(text, type = '') {
  const el = document.getElementById('authMessage');
  if (!el) return;
  el.textContent = text;
  el.className = 'text-sm min-h-[1.25rem] mb-4';
  if (type === 'error') el.classList.add('text-red-700');
}

function bindPasswordTools() {
  const password = document.getElementById('passwordInput');
  const toggle = document.querySelector('.toggle-pass');
  const generate = document.querySelector('.gen-pass');

  toggle?.addEventListener('click', () => {
    if (!password) return;
    password.type = password.type === 'password' ? 'text' : 'password';
  });

  generate?.addEventListener('click', () => {
    if (!password) return;
    password.value = generatePassword();
    password.type = 'text';
  });
}

export function initLoginPage() {
  const session = getSession();
  if (session) {
    window.location.href = './account.html';
    return;
  }

  document.querySelectorAll('[data-auth-mode]').forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.authMode));
  });

  bindPasswordTools();

  document.getElementById('authForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('emailInput')?.value ?? '';
    const password = document.getElementById('passwordInput')?.value ?? '';
    const name = document.getElementById('nameInput')?.value ?? '';

    if (!email.trim()) {
      setMessage('Enter your email', 'error');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setMessage(passwordError, 'error');
      return;
    }

    if (mode === 'register') {
      const result = registerUser(email, password, name);
      if (!result.ok) {
        setMessage(result.message, 'error');
        return;
      }
      window.location.href = './account.html';
      return;
    }

    const result = loginUser(email, password);
    if (!result.ok) {
      setMessage(result.message, 'error');
      return;
    }
    window.location.href = './account.html';
  });
}
