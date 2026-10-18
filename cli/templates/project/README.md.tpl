# __APP_TITLE__

App de React + MUI armada con [Calcita](https://www.npmjs.com/package/@stackcraftmx/calcita) (`calcita new`).

## Arrancar

```bash
pnpm install
pnpm dev
```

//#if auth
Para entrar: «Entrar con la cuenta de ejemplo» (el servidor de mentira no pide contraseña).

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

## Crecer la app con el CLI

```bash
pnpm exec calcita make:module purchase-orders --label-es "Órdenes de compra" --label-en "Purchase orders"
pnpm exec calcita make:page purchase-orders OrderDetail
pnpm exec calcita make:form purchase-orders OrderForm
pnpm exec calcita make:component StatusBadge                  # en src/core
pnpm exec calcita make:component OrderTotals --module purchase-orders
```

Los formularios salen con __FORMS_LIBRARY__ (lo dice `calcita.json`, que guarda lo que se eligió al crear el proyecto).
