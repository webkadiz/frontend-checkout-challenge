import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { createShopRouter } from './router';
import './global.scss';

const router = createShopRouter();

createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
