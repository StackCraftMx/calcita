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
            legal: {
                privacyTitle: 'Aviso de privacidad (ejemplo)',
                termsTitle: 'Términos de uso de la tienda de ejemplo',
                termsAccepted: 'Gracias: quedó registrado que aceptó la versión {{version}}.',
                terms: {
                    intro: 'Estos términos son de mentira: sirven para enseñar cómo se pide aceptarlos antes de seguir. Léalos hasta el final para poder aceptar.',
                    use: '1. Uso de la app. La app es para registrar pedidos, clientes y entregas de la tienda. Cada persona entra con su propia cuenta y es responsable de lo que hace con ella.',
                    data: '2. Datos. Lo que se escribe en la app se guarda para operar la tienda. Nadie fuera de la tienda lo ve. El aviso de privacidad dice qué se guarda y para qué.',
                    security: '3. Seguridad. No comparta su contraseña. Active la verificación en dos pasos en Mi perfil si maneja dinero o datos de clientes.',
                    changes: '4. Cambios. Cuando estos términos cambien, la app se los volverá a enseñar al entrar y tendrá que aceptarlos otra vez.',
                    closing: '5. Si no acepta, la app cierra su sesión. Puede volver a entrar cuando quiera y aceptarlos entonces.',
                },
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
            legal: {
                privacyTitle: 'Privacy notice (sample)',
                termsTitle: 'Terms of use of the sample store',
                termsAccepted: 'Thank you: it was recorded that you accepted version {{version}}.',
                terms: {
                    intro: 'These terms are fake: they show how acceptance is requested before going on. Read them to the end to be able to accept.',
                    use: '1. Use of the app. The app is for recording the store orders, customers and deliveries. Each person signs in with their own account and is responsible for what they do with it.',
                    data: '2. Data. What is written in the app is kept to run the store. Nobody outside the store sees it. The privacy notice says what is kept and why.',
                    security: '3. Security. Do not share your password. Turn on two-step verification in My profile if you handle money or customer data.',
                    changes: '4. Changes. When these terms change, the app will show them again when you sign in and you will have to accept them again.',
                    closing: '5. If you do not accept, the app signs you out. You can sign in again whenever you want and accept them then.',
                },
            },
        },
    },
};
