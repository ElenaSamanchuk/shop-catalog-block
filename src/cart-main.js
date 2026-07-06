import 'flowbite';
import './styles/load-themes.js';
import './styles/store.css';
import { initDesign } from './js/design.js';
import { mountLayout } from './js/ui.js';
import { initCartPage } from './js/cart-page.js';

initDesign();
initCartPage();
window.addEventListener('designchange', () => mountLayout({ active: 'cart' }));
