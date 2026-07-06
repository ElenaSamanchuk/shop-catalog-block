import 'flowbite';
import './styles/load-themes.js';
import './styles/store.css';
import { initDesign } from './js/design.js';
import { mountLayout } from './js/ui.js';
import { initSuccessPage } from './js/success-page.js';

initDesign();
initSuccessPage();
window.addEventListener('designchange', () => mountLayout({ active: 'cart' }));
