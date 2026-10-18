// Las rutas de __LABEL_ES__. Cada pantalla viaja en su propio archivo (lazy): se descarga hasta que alguien la abre.
// «calcita make:page __kebab__ <Pantalla>» agrega aquí la suya.
export const __NAME___PATH = '/__kebab__';

export const routes = [
    {path: __NAME___PATH, lazy: async () => ({Component: (await import('@/modules/__name__/__Name__Page.jsx')).__Name__Page})},
];
