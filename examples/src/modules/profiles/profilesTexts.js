// Los textos de «Perfiles y permisos» (namespace profiles).
export const profilesTexts = {
    es: {
        profiles: {
            menu: {
                label: 'Perfiles y permisos',
                description: 'Qué puede ver y hacer cada perfil. El menú de quien entra cambia solo.',
            },
            permissions: {
                manage: 'Administrar perfiles',
                manageDescription: 'Cambiar qué puede ver y hacer cada perfil.',
            },
            page: {
                title: 'Perfiles y permisos',
                subtitle: 'Cada módulo declara sus permisos en su menu.js y aquí se juntan solos. Si cambia los de su propio perfil, su menú cambia al guardar.',
                loading: 'Cargando los perfiles',
                listLabel: 'Perfiles',
                usersCount_one: '{{count}} persona',
                usersCount_other: '{{count}} personas',
                yours: 'El suyo',
                locked: 'El perfil de administración siempre tiene todos los permisos: así nadie se queda sin poder entrar a esta pantalla.',
                save: 'Guardar permisos',
                discard: 'Descartar cambios',
                unsaved: 'Hay cambios sin guardar.',
            },
        },
    },
    en: {
        profiles: {
            menu: {
                label: 'Profiles and permissions',
                description: 'What each profile can see and do. The menu of whoever signs in changes on its own.',
            },
            permissions: {
                manage: 'Manage profiles',
                manageDescription: 'Change what each profile can see and do.',
            },
            page: {
                title: 'Profiles and permissions',
                subtitle: 'Each module declares its permissions in its menu.js and they come together here on their own. If you change your own profile, your menu changes when you save.',
                loading: 'Loading the profiles',
                listLabel: 'Profiles',
                usersCount_one: '{{count}} person',
                usersCount_other: '{{count}} people',
                yours: 'Yours',
                locked: 'The administration profile always has every permission, so nobody is locked out of this screen.',
                save: 'Save permissions',
                discard: 'Discard changes',
                unsaved: 'There are unsaved changes.',
            },
        },
    },
};
