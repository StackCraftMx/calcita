<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
//#if pwa
    <!-- para instalarla como app (PWA): el nombre, los íconos y los colores van en el manifiesto; el nombre corto, bajo el
         ícono del iPhone -->
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="__APP_TITLE__" />
//#endif
    <title>__APP_TITLE__</title>
</head>
<body>
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
</body>
</html>
