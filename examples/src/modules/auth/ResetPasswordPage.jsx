// Elegir una contraseña nueva desde el enlace del correo: ChangePasswordForm sin la contraseña actual (quien llega aquí
// la olvidó). El enlace trae su ficha (?token=) y el servidor la revisa al guardar.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import {Link as RouterLink, useSearchParams} from 'react-router';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {AuthLayout, useToolkitTranslation} from '@stackcraftmx/calcita';
import {ChangePasswordForm} from '@stackcraftmx/calcita/forms';

import {APP_PATHS} from '@/core';
import {resetPassword} from '@/modules/auth/authApi.js';
import {AuthLogo} from '@/modules/auth/AuthLogo.jsx';

export const ResetPasswordPage = () => {
    const {t} = useToolkitTranslation('authExamples');
    const [searchParams] = useSearchParams();
    const [isDone, setIsDone] = useState(false);

    const save = async ({newPassword}) => {
        await resetPassword({token: searchParams.get('token'), newPassword});
        setIsDone(true);
    };

    return (
        <AuthLayout logo={<AuthLogo />} brandName={t('shell:title')} title={t('resetTitle')} description={t('resetSubtitle')}>
            {isDone ? (
                <Stack spacing={2}>
                    <Alert severity="success" role="status">{t('resetDone')}</Alert>
                    <Button component={RouterLink} to={APP_PATHS.signIn} variant="contained">{t('goToSignIn')}</Button>
                </Stack>
            ) : (
                <ChangePasswordForm requireCurrentPassword={false} onSubmit={save} />
            )}
        </AuthLayout>
    );
};
