# Ejemplos de @stackcraftmx/calcita

Una app de React que usa el paquete **ya construido** (`dist/`), como lo haría un proyecto nuevo. No necesita backend:
un servidor de mentira en memoria (`src/fakeServer/`) contesta como un API de verdad, con esperas, cancelación y
errores RFC 9457 en el idioma activo. Los datos son inventados; al recargar la página todo vuelve a como estaba.

```bash
pnpm run examples   # desde la raíz: construye el paquete y abre los ejemplos en http://localhost:5173
```

## Qué hay en cada ejemplo

| Ejemplo | Dirección | Lo que enseña |
|---|---|---|
| Tabla | `/orders` | `ServerTable` paginada, filtrada y ordenada en el servidor: filtros en el encabezado, facetas, accesos rápidos con rango de fechas, chips, búsqueda y el estado en la URL. El detalle (`/orders/:id`) con `BackButton`, `DetailHeader`, `DefinitionList`, `GroupedTimeline`, `AuditTrailDialog` y la cancelación con `useConfirmAction` y su motivo |
| Formulario | `/customers/new` | formik + yup con `FormTextField`, `FormSelectField` y `SubmitButton`; `applyServerProblem` pinta el 422 en su campo y lo demás en el aviso de arriba; el id nuevo es un UUID v7 |
| Avisos | `/feedback` | una confirmación que sale bien y una que el servidor rechaza (409), cada tipo de aviso, `toastPromise`, `toastProblem` y `ModalWaiting` |
| Descargas y Excel | `/reports` | el reporte con `reportSheetOf` en pantalla, en Excel (`reportWorkbookOf`, ExcelJS cargado al pedirlo) y en CSV con `DownloadMenu`; el panel de descargas con avance, cancelación y error |
| Métricas | `/metrics` | `MetricCard` que abre la tabla ya filtrada, `ColumnChart` con meta, `PeriodRangeSelector`, `SegmentedControl`, `BarList` y `CalendarHeatmap` |

En todos: el idioma (`LanguageToggle`) y el modo claro u oscuro (`ColorSchemeToggle`) en la barra, y los importes con
`Money` (`@stackcraftmx/calcita/money`), sin pasar el dinero por decimales.

## Cómo está armado

```
src/
  main.jsx          el tema de MUI y el router
  app/              ToolkitProvider (el único punto de conexión del paquete), la barra, las rutas y los textos juntos
  core/             lo que comparten dos módulos (direcciones, el estado de un pedido); se importa de @/core
  modules/<ejemplo> un ejemplo por carpeta: sus pantallas, sus textos {es, en}, sus diccionarios y su archivo *Api.js
  fakeServer/       el servidor de mentira: los datos, las reglas y las respuestas de cada «endpoint»
```

Cada módulo llama al servidor solo desde su `*Api.js`: con un backend de verdad, solo cambia ese archivo.

## Verificación

```bash
pnpm --filter @stackcraftmx/calcita-examples run check   # pruebas (node --test) y build
```

`pnpm run check` de la raíz también lo corre, así un cambio del paquete que rompa a un proyecto real truena antes de
publicar.
