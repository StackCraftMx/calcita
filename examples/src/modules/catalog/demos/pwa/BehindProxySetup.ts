// Detrás de un proxy con prefijo (miempresa.com/ventas/, sin subdominio): el prefijo se da UNA vez, al construir, con
// ASSET_URL=/ventas, la misma línea que lleva el .env del servidor. Sin ella, todo en la raíz como siempre. La demo pública
// de Calcita vive así: calcita.stackcraft.com.mx/demo/.
//
//   1. vite.config.js:  export default defineConfig({base: basePathOf(process.env.ASSET_URL), …});
//      Vite pide sus archivos con el prefijo, se lo pone a las rutas de index.html (<link href="/manifest.webmanifest">
//      se escribe desde la raíz) y lo deja en import.meta.env.BASE_URL para lo demás;
//   2. el router con el mismo prefijo (abajo): las pantallas siguen escribiendo sus rutas desde la raíz ('/orders');
//   3. lo de public/ y version.json con el prefijo (abajo): una dirección escrita a mano desde la raíz se rompe detrás del proxy;
//   4. manifest.webmanifest relativo: "start_url": "./", "scope": "./", "src": "icons/icon-192.png";
//   5. el servidor: cada dirección bajo el prefijo que no sea un archivo regresa su index.html (el nginx de abajo).
//      Con otro prefijo se vuelve a construir.
//
//   location /ventas/ {
//       try_files $uri $uri/ /ventas/index.html;
//   }
import {createBrowserRouter} from 'react-router';
import type {RouteObject} from 'react-router';

// las rutas de su app (aquí solo su forma)
declare const routes: RouteObject[];

// 1. '/ventas' → '/ventas/'; vacío → '/' (la raíz)
export const basePathOf = (assetUrl?: string) => {
    const prefix = (assetUrl ?? '').trim().replace(/^\/+|\/+$/g, '');
    return prefix ? `/${prefix}/` : '/';
};

// 2. el router quita el prefijo al leer la dirección y lo pone en cada liga
export const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
export const appRouter = createBrowserRouter(routes, {basename: ROUTER_BASENAME});

// 3. 'branding/logo.svg' → '/ventas/branding/logo.svg'
export const publicUrlOf = (path: string) => `${import.meta.env.BASE_URL}${path}`;
export const BUILD_VERSION_URL = publicUrlOf('version.json');
