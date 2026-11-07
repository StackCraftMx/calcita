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
<div id="root">
    <!-- calcita:boot-shell · la silueta del marco (AppLayout) mientras baja la app: la barra, el menú y el contenido en gris,
         en lugar de la pantalla en blanco. Va EN EL HTML porque si viviera en el JavaScript saldría después de bajarlo, que es
         justo el rato que se quiere tapar.
         - sale a los 250 ms: con la app en caché la carga dura un suspiro y un destello gris se siente peor que nada;
         - se va sola: React pinta dentro de #root y reemplaza lo que haya adentro (también este <style>);
         - el color sale del gusto del sistema (prefers-color-scheme) y NUNCA escribe color-scheme: MUI escucha esa misma
           consulta y, si la página la fija, la pantalla parpadea entre claro y oscuro.
         En el teléfono, el contenido y la barra de pestañas abajo; en escritorio, la barra arriba y el menú a la izquierda. -->
    <style>
        .calcita-boot{position:fixed;inset:0;box-sizing:border-box;display:grid;gap:8px;padding:8px;background:#F2F2F7;
            grid-template:"bar bar" 56px "menu main" 1fr / 240px 1fr;opacity:0;animation:calcita-boot-in .2s ease-out .25s forwards}
        .calcita-boot i{display:block;border-radius:12px;background:rgba(118,118,128,.12)}
        .calcita-boot-bar{grid-area:bar}
        .calcita-boot-menu{grid-area:menu}
        .calcita-boot-main{grid-area:main;display:flex;flex-direction:column;gap:12px;padding:16px 24px;min-height:0}
        .calcita-boot .calcita-boot-title{width:40%;height:32px}
        .calcita-boot .calcita-boot-line{width:60%;height:14px;border-radius:7px}
        .calcita-boot .calcita-boot-card{flex:1;max-height:420px}
        @media (max-width:899.95px){
            .calcita-boot{grid-template:"main" 1fr "bar" 56px / 1fr}
            .calcita-boot-menu{display:none}
            .calcita-boot .calcita-boot-bar{border-radius:28px}
            .calcita-boot-main{padding:8px}
        }
        @media (prefers-color-scheme:dark){.calcita-boot{background:#05070B}.calcita-boot i{background:rgba(118,118,128,.24)}}
        @media (prefers-reduced-motion:reduce){.calcita-boot{animation-duration:0s}}
        @keyframes calcita-boot-in{to{opacity:1}}
    </style>
    <div class="calcita-boot" aria-hidden="true">
        <i class="calcita-boot-bar"></i>
        <i class="calcita-boot-menu"></i>
        <div class="calcita-boot-main"><i class="calcita-boot-title"></i><i class="calcita-boot-line"></i><i class="calcita-boot-card"></i></div>
    </div>
    <!-- /calcita:boot-shell -->
</div>
<script type="module" src="/src/main.jsx"></script>
</body>
</html>
