// Iniciar sesión: AuthLayout y SignInForm del framework. La pantalla solo dice qué hacer con los datos (signIn) y a dónde
// ir después: a la pantalla que se quería abrir (?next=) o al inicio.
//
// Abajo, solo en los ejemplos, «Entrar como…» con las tres personas: así se ve cómo cambia el menú según el perfil, sin
// escribir contraseñas.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo, useState} from 'react';
import {Navigate, useNavigate, useSearchParams} from 'react-router';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {AuthLayout, useToolkitTranslation} from '@stackcraftmx/calcita';
import {SignInForm} from '@stackcraftmx/calcita/forms';

import {APP_PATHS, useSession} from '@/core';
import {demoPeopleOf, signIn, signInAs} from '@/modules/auth/authApi.js';
import {AuthLogo} from '@/modules/auth/AuthLogo.jsx';

/**
 * A dónde ir al entrar: la pantalla de ?next= solo si es de esta app (una dirección de afuera sería una liga para robar
 * sesiones: «entra aquí y te llevo a otro sitio»).
 *
 * @param {string|null} next
 * @returns {string}
 */
const destinationOf = (next) => (next?.startsWith('/') && !next.startsWith('//') ? next : APP_PATHS.home);

/** Los botones de «Entrar como…» de los ejemplos. */
const DemoPeople = ({onChoose, busyUserId}) => {
    // el idioma en que se piden: el nombre del perfil llega en el idioma activo
    const {t, language} = useToolkitTranslation('authExamples');
    const demoPeople = useMemo(() => demoPeopleOf(), [language]);
    return (
        <Paper variant="outlined" sx={{p: 2}}>
            <Typography variant="subtitle2">{t('demoTitle')}</Typography>
            <Typography variant="caption" color="text.secondary" component="p" sx={{mb: 1.5}}>{t('demoText')}</Typography>
            <Stack spacing={1}>
                {demoPeople.map((person) => (
                    <Button key={person.userId} variant="outlined" onClick={() => onChoose(person.userId)} disabled={Boolean(busyUserId)}
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
    const {t} = useToolkitTranslation('auth');
    const {session, refreshSession} = useSession();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [busyUserId, setBusyUserId] = useState(null);
    const destination = destinationOf(searchParams.get('next'));

    const enter = async () => {
        await refreshSession();
        navigate(destination, {replace: true});
    };

    const signInWithForm = async (credentials) => {
        await signIn(credentials);
        await enter();
    };

    const signInAsPerson = async (userId) => {
        setBusyUserId(userId);
        await signInAs(userId);
        await enter();
    };

    // guard clause: ya hay sesión (alguien abrió esta pantalla estando dentro)
    if (session && !busyUserId) {
        return <Navigate to={destination} replace />;
    }

    return (
        <AuthLayout logo={<AuthLogo />} brandName={t('shell:title')} title={t('signIn.title')} description={t('signIn.subtitle')}
                    footer={<DemoPeople onChoose={signInAsPerson} busyUserId={busyUserId} />}>
            <SignInForm onSubmit={signInWithForm} forgotPasswordPath={APP_PATHS.forgotPassword} />
        </AuthLayout>
    );
};
