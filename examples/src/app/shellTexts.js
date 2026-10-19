// Los textos del marco de la app de ejemplos (namespace shell): el nombre, las secciones del menú lateral, el botón del
// vidrio y la tarjeta de abajo del menú.
export const shellTexts = {
    es: {
        // un tipo de archivo propio de la app (APP_FILE_TYPES): su nombre y su ayuda en el menú «Descargar»
        common: {download: {formats: {json: {label: 'Datos (JSON)', hint: 'Las cifras tal cual, para otro sistema'}}}},
        shell: {
            errorPages: {
                goOrders: 'Ver los pedidos',
                requestAccess: 'Pedir acceso',
                accessRequested: 'Se avisó a administración: le escriben cuando tenga acceso a esta pantalla.',
                support: '¿Llegó por una liga? Avísenos y la corregimos.',
            },
            title: 'Calcita',
            caption: 'Ejemplos sin backend',
            sections: {
                operation: 'Operación',
                files: 'Archivos y reportes',
                interface: 'Interfaz',
                workspace: 'Trabajo en equipo',
                admin: 'Administración',
            },
            glass: {
                label: 'Estilo',
                off: 'Sin vidrio',
                floating: 'En lo que flota',
                surfaces: 'También en las tarjetas',
                // en el menú de la cuenta: tres botones en un renglón, nombres cortos
                short: {off: 'Sin vidrio', floating: 'Vidrio', minimal: 'Mínimo'},
                surfacesWarning: 'Vidrio también en las tarjetas: pesa más en equipos modestos y Apple pide el contenido sin vidrio.',
                bar: {label: 'Barra de arriba', capsules: 'Cápsulas', band: 'Franja'},
            },
            footer: {
                title: 'Ejemplos sin backend',
                text: 'Los datos son de mentira y viven en la memoria del navegador.',
            },
            account: {
                switchProfile: 'Entrar con otro perfil',
            },
        },
    },
    en: {
        // un tipo de archivo propio de la app (APP_FILE_TYPES): su nombre y su ayuda en el menú «Descargar»
        common: {download: {formats: {json: {label: 'Data (JSON)', hint: 'The figures as they are, for another system'}}}},
        shell: {
            errorPages: {
                goOrders: 'See the orders',
                requestAccess: 'Request access',
                accessRequested: 'Administration was notified: they will write to you when you have access to this screen.',
                support: 'Did you come from a link? Let us know and we will fix it.',
            },
            title: 'Calcita',
            caption: 'Examples without a backend',
            sections: {
                operation: 'Operations',
                files: 'Files and reports',
                interface: 'Interface',
                workspace: 'Teamwork',
                admin: 'Administration',
            },
            glass: {
                label: 'Style',
                off: 'No glass',
                floating: 'On what floats',
                surfaces: 'On cards too',
                short: {off: 'No glass', floating: 'Glass', minimal: 'Minimal'},
                surfacesWarning: 'Glass on cards too: heavier on modest devices, and Apple keeps content without glass.',
                bar: {label: 'Top bar', capsules: 'Capsules', band: 'Band'},
            },
            footer: {
                title: 'Examples without a backend',
                text: 'The data is fake and lives in the browser memory.',
            },
            account: {
                switchProfile: 'Sign in with another profile',
            },
        },
    },
};
