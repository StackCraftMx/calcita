# __APP_TITLE__

App de React + MUI armada con [Calcita](https://www.npmjs.com/package/@stackcraftmx/calcita) (`calcita new`).

## Arrancar

```bash
pnpm install
pnpm dev
```

//#if auth
Para entrar: «Entrar con la cuenta de ejemplo» (la cuenta de demostración no pide contraseña).

## Conectar la cuenta a su backend

Entrar (con su segundo paso), «¿Olvidó su contraseña?», elegir una contraseña nueva, Mi perfil y su seguridad ya vienen
hechos en Calcita. Lo único de la app es `src/core/accountConnector.js`:

- Sin `VITE_API_URL` trabaja con la cuenta de demostración, en este navegador.
- Con la dirección del API en `.env.local` (`VITE_API_URL=https://api.mi-tienda.com`) usa el backend de verdad. Si el
  backend sigue el contrato REST de Calcita (README de Calcita, «La cuenta completa: conectar su backend»), no hay nada más que
  hacer; si alguna ruta o respuesta es distinta, se cambia solo esa función en `accountConnector.js`.

//#endif
## Cómo está armado

```
src/
  main.jsx            el tema y el router
  app/                el único lugar donde se conecta el framework: proveedores, marco, rutas, tema y textos
  core/               lo que comparten dos o más módulos (se importa de '@/core')
  fakeServer/         el servidor de mentira: datos en memoria con la forma del API de verdad
  modules/<módulo>/   cada módulo en su carpeta: menu.js, routes.js, sus pantallas, su *Api.js y sus *Texts.js
```

- **Un módulo nuevo no edita nada fuera de su carpeta**: el menú, las rutas y los textos se descubren solos.
- **Una pantalla solo habla con el servidor por el `*Api.js` de su módulo.** Hoy esas llamadas van a `src/fakeServer`;
  para conectar el backend de verdad, cada una cambia por su petición con `apiClient` (`src/core/apiClient.js`) y la
  pantalla no se toca.
- **Textos en español e inglés** en los `*Texts.js` de cada módulo; los de los componentes de Calcita (tablas, diálogos,
  validaciones) ya vienen.
- **Imports con el alias `@/`** (= `src/`), declarado en `vite.config.js` y en `jsconfig.json`.

## Publicar una versión nueva

`pnpm build` deja la app en `dist/`, con `version.json` (la versión de esa compilación). La app publicada lo vuelve a leer al
abrirla y cada tanto: si ya hay otra, se recarga sola cuando estuvo fuera 15 minutos o más (una pestaña de ayer, la app
anclada al inicio del iPhone) y, si no, enseña el aviso «Versión nueva» con su botón. Para que funcione, el servidor no
debe guardar `index.html` ni `version.json` (`Cache-Control: no-cache`); los archivos de `dist/assets/` sí, un año.

## Crecer la app con el CLI

```bash
pnpm exec calcita make:module purchase-orders --label-es "Órdenes de compra" --label-en "Purchase orders"
pnpm exec calcita make:page purchase-orders OrderDetail
pnpm exec calcita make:form purchase-orders OrderForm
pnpm exec calcita make:component StatusBadge                  # en src/core
pnpm exec calcita make:component OrderTotals --module purchase-orders
```

Los formularios salen con __FORMS_LIBRARY__ (lo dice `calcita.json`, que guarda lo que se eligió al crear el proyecto).
