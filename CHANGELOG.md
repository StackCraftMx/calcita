# Cambios

Lo que cambia en Calcita en cada versión. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y las versiones, [SemVer](https://semver.org/lang/es/): mientras sea 0.x, cada versión con funciones nuevas sube el
número de en medio (0.9.0 → 0.10.0 → 0.11.0) y cada arreglo, el último.

## [0.14.0] - 2026-10-17

### Agregado

- Seguridad de la cuenta: llaves de acceso (`/passkeys`), verificación en dos pasos con app autenticadora y códigos de
  recuperación, el segundo paso al entrar, las sesiones abiertas y la bitácora de la cuenta.
- En los ejemplos, Mi perfil → Seguridad y el segundo paso al entrar, con servidor de mentira, y una página del catálogo
  sobre cómo evitar XSS.

## [0.13.0] - 2026-10-17

### Agregado

- `createApiClient`: la petición de la casa con el idioma, los errores RFC 9457 como `ApiError`, la sesión vencida, el
  CSRF de Laravel, el tiempo límite, la cancelación y las descargas con avance.
- Versión vieja en la pestaña: `StaleBuildBoundary`, `withChunkRecovery` y `RouteErrorScreen` recargan una vez
  cuando la pantalla que se pide ya no existe; `ErrorPage` con el tipo `newVersion`.

## [0.12.0] - 2026-10-17

### Agregado

- En el catálogo de los ejemplos, el código de cada ejemplo en JavaScript y TypeScript, con botón de copiar, y una página
  de cómo funcionan las traducciones (los textos del paquete, los del proyecto e i18next).

### Corregido

- Los tipos para TypeScript de los avisos (`toastSuccess`…), el `placeholder` de `TextInput` y el avance de las
  descargas.

## [0.11.1] - 2026-10-17

### Corregido

- Un globo de ayuda sin texto ya no enseña la llave: el traductor entiende el texto por omisión (`defaultValue`), como
  i18next.
- El encabezado del panel de descargas y el grupo resaltado de la línea de tiempo tienen fondo con cualquier tema de MUI.

### Quitado

- El filtro de rango de números de la tabla: ninguna columna lo pintaba.

## [0.11.0] - 2026-10-17

### Agregado

- Instalar la app (PWA): invitación abajo al centro, pasos para iPhone, iPad y Firefox de Android, el botón del
  navegador en Chrome y «Instalar la app» en el menú de la cuenta. Sin funcionar sin conexión: eso es de cada proyecto.
- Manifiesto e íconos de Stackcraft en los ejemplos.

## [0.10.0] - 2026-10-17

### Agregado

- Los ejemplos en una imagen de Docker, para probarlos sin instalar Node ni pnpm.
- Script para enseñar la demo por internet con un túnel de Cloudflare.

## [0.9.0] - 2026-10-17

### Agregado

- Proyecto de ejemplos con servidor de mentira: tabla, formularios, avisos, archivos, descargas, métricas, tablero,
  perfiles y permisos, catálogo de componentes y configurador de tema con su código en JS y TS.

## [0.8.0] - 2026-10-17

### Agregado

- Marco de la aplicación: menú lateral que se encoge, menú arriba, barra de pestañas en el teléfono, menú de la cuenta
  con los ajustes, avisos de versión nueva y contadores en el menú.

## [0.7.0] - 2026-10-17

### Agregado

- Tema con claro y oscuro, vidrio líquido según la guía de Apple y estilo minimalista.

## [0.6.0] - 2026-10-17

### Agregado

- Permisos por perfil y por regla, menú que se arma con los permisos y piezas para entrar y cambiar la contraseña.

## [0.5.0] - 2026-10-17

### Agregado

- Subir archivos con avance y cancelación, con dos motores a elegir, y reglas de tipo y peso.

## [0.4.0] - 2026-10-17

### Agregado

- Campos y formularios con formik o react-hook-form, fechas, colores, números exactos y formularios por pasos.

## [0.3.0] - 2026-10-17

### Agregado

- Dinero sin errores de decimales: suma, resta, multiplicación, división y formato por moneda.

## [0.2.0] - 2026-10-17

### Agregado

- Tabla que pagina, filtra y ordena en el servidor, con total real y la búsqueda en la dirección de la página.

## [0.1.0] - 2026-10-17

### Agregado

- Primera versión: proveedor del paquete, textos en español e inglés, formatos, fechas, errores del servidor,
  avisos y confirmaciones, encabezados, etiquetas, métricas, descargas a Excel, gráficas y adaptadores para
  react-router, i18next, Laravel y Next.js.

[0.14.0]: https://github.com/StackCraftMx/calcita/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/StackCraftMx/calcita/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/StackCraftMx/calcita/compare/v0.11.1...v0.12.0
[0.11.1]: https://github.com/StackCraftMx/calcita/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/StackCraftMx/calcita/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/StackCraftMx/calcita/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/StackCraftMx/calcita/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/StackCraftMx/calcita/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/StackCraftMx/calcita/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/StackCraftMx/calcita/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/StackCraftMx/calcita/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/StackCraftMx/calcita/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/StackCraftMx/calcita/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/StackCraftMx/calcita/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/StackCraftMx/calcita/releases/tag/v0.1.0
