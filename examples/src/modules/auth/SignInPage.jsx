// Iniciar sesión: SignInScreen del framework (la contraseña y, si la cuenta tiene verificación en dos pasos, el segundo
// paso). Lo del servidor sale del conector de la cuenta (app/accountConnector.js); aquí solo va lo propio de los ejemplos:
// abajo, «Entrar como…» con las tres personas, para ver cómo cambia el menú según el perfil sin escribir nada.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo, useState} from 'react';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useToolkitTranslation} from '@stackcraftmx/calcita';
import {SignInScreen} from '@stackcraftmx/calcita/account';

import {APP_PATHS} from '@/core';
import {DEMO_PASSWORD, demoPeopleOf} from '@/modules/auth/authApi.js';
import {AuthLogo} from '@/modules/auth/AuthLogo.jsx';

/** Los botones de «Entrar como…»: entran con el mismo camino del formulario (y el mismo segundo paso). */
const DemoPeople = ({signIn}) => {
    // el idioma en que se piden: el nombre del perfil llega en el idioma activo
    const {t, language} = useToolkitTranslation('authExamples');
    const demoPeople = useMemo(() => demoPeopleOf(), [language]);
    const [busyEmail, setBusyEmail] = useState(null);

    const enterAs = async (email) => {
        setBusyEmail(email);
        try {
            await signIn({email, password: DEMO_PASSWORD});
        } finally {
            setBusyEmail(null);
        }
    };

    return (
        <Paper variant="outlined" sx={{p: 2}}>
            <Typography variant="subtitle2">{t('demoTitle')}</Typography>
            <Typography variant="caption" color="text.secondary" component="p" sx={{mb: 1.5}}>{t('demoText')}</Typography>
            <Stack spacing={1}>
                {demoPeople.map((person) => (
                    <Button key={person.userId} variant="outlined" onClick={() => enterAs(person.email)} disabled={Boolean(busyEmail)}
                            sx={{justifyContent: 'space-between'}}>
                        <span>{person.name}</span>
                        <Typography component="span" variant="caption" color="text.secondary">{person.profileName}</Typography>
                    </Button>
                ))}
            </Stack>
        </Paper>
    );
};

export const SignInPage = () => {
    const {t} = useToolkitTranslation('shell');
    return (
        <SignInScreen logo={<AuthLogo />} brandName={t('title')} forgotPasswordPath={APP_PATHS.forgotPassword}
                      footer={({signIn}) => <DemoPeople signIn={signIn} />} />
    );
};
