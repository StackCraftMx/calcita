// Mi perfil: quién está dentro (ProfileHeader), sus preferencias (AppearanceSettings: tamaño de letra, idioma y modo de
// color, los mismos ajustes del menú de la cuenta) y cambiar su contraseña (ChangePasswordForm, con su lista de reglas).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {AppearanceSettings, ProfileHeader, SectionCard, useToolkitTranslation} from '@stackcraftmx/calcita';
import {ChangePasswordForm} from '@stackcraftmx/calcita/forms';

import {useSession} from '@/core';
import {changePassword} from '@/modules/profile/profileApi.js';

// lo ancho de los formularios: un renglón cómodo, no toda la pantalla
const FORM_MAX_WIDTH = 520;

export const ProfilePage = () => {
    const {t} = useToolkitTranslation('profile');
    const {session} = useSession();
    const {user} = session;

    return (
        <Stack spacing={3}>
            <ProfileHeader name={user.name} email={user.email} subtitle={user.subtitle} />
            <SectionCard title={t('preferences')}>
//#if darkMode
                <AppearanceSettings />
//#endif
//#if !darkMode
                <AppearanceSettings showColorScheme={false} />
//#endif
            </SectionCard>
            <SectionCard title={t('password')}>
                <Stack sx={{maxWidth: FORM_MAX_WIDTH}}>
                    <ChangePasswordForm onSubmit={changePassword} />
                </Stack>
            </SectionCard>
        </Stack>
    );
};
