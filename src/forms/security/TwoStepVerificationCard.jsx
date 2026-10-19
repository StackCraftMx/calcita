// «Verificación en dos pasos» de «Mi perfil»: las llaves de acceso, la app autenticadora y los códigos de recuperación.
//
// Lo que QUITA protección (desactivar la app, quitar una llave, generar códigos nuevos) pide la contraseña: una sesión que
// alguien dejó abierta no debe bastar para desarmar la cuenta. Activar no la pide.
//
// La tarjeta no sabe del servidor: el proyecto le pasa el estado (security) y qué hacer en cada caso (actions); cada
// acción regresa {security, recoveryCodes?} y la tarjeta avisa el estado nuevo con onSecurityChange. Las llaves de acceso
// las crea el proyecto con createPasskey (@stackcraftmx/calcita/passkeys) dentro de actions.addPasskey: así esta puerta no
// carga la librería de llaves.
//
//   <TwoStepVerificationCard security={security} onSecurityChange={setSecurity} account={session.email}
//                            canUsePasskeys={passkeysSupported()} actions={securityActions} />
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaTwoStepVerification con defaultProps y
// styleOverrides de sus partes: qr, secret, secretCode, header, headerTitle, headerText, menuIcon.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {Form, Formik} from 'formik';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import PhonelinkLockOutlinedIcon from '@mui/icons-material/PhonelinkLockOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';

import {toastSuccess} from '@/feedback/toast.jsx';
import FormProblemAlert from '@/forms/FormProblemAlert.jsx';
import FormTextField from '@/forms/FormTextField.jsx';
import SubmitButton from '@/forms/SubmitButton.jsx';
import {applyServerProblem} from '@/forms/applyServerProblem.js';
import {Yup} from '@/forms/validation.js';
import {
    CURRENT_PASSWORD_MAX_LENGTH, PASSKEY_NAME_MAX_LENGTH, TOTP_CODE_MAX_LENGTH, TOTP_CODE_MIN_LENGTH, TOTP_CODE_PATTERN, normalizeTotpCode,
} from '@/forms/security/securityRules.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import RecoveryCodesDialog from '@/security/RecoveryCodesDialog.jsx';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import CopyButton from '@/ui/actions/CopyButton.jsx';
import Tag from '@/ui/labels/Tag.jsx';
import SectionCard from '@/ui/layout/SectionCard.jsx';
import ComponentTexts from '@/toolkit/ComponentTexts.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaTwoStepVerification)
const THEME_NAME = 'CalcitaTwoStepVerification';
const TwoStepQr = piecePart(THEME_NAME, 'Qr', Box);
const TwoStepSecret = piecePart(THEME_NAME, 'Secret', Stack);
const TwoStepSecretCode = piecePart(THEME_NAME, 'SecretCode', Box);
const TwoStepHeader = piecePart(THEME_NAME, 'Header', Stack);
const TwoStepHeaderTitle = piecePart(THEME_NAME, 'HeaderTitle', Stack);
const TwoStepHeaderText = piecePart(THEME_NAME, 'HeaderText', Box);
const TwoStepMenuIcon = piecePart(THEME_NAME, 'MenuIcon', ListItemIcon);

// los códigos que quedan desde donde se avisa en ámbar que ya son pocos
const FEW_CODES_LEFT = 2;
const QR_SIZE_PIXELS = 200;
const CODE_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/**
 * Lo que hace un formulario de la tarjeta con un error: un ApiError va a su campo o arriba (applyServerProblem); un
 * error del navegador (la llave de acceso) va arriba; si la persona solo canceló, nada.
 *
 * @param {Error & {cancelled?: boolean, status?: number}} error
 * @param {object} formikHelpers
 * @param {object} values
 */
function showFormError(error, formikHelpers, values) {
    if (error?.cancelled) {
        return;
    }
    if (error?.status === undefined) {
        formikHelpers.setStatus(error?.message);
        return;
    }
    applyServerProblem(error, {...formikHelpers, values});
}

/** Confirmar con la contraseña antes de quitar protección. */
function PasswordDialog({open, title, description, confirmLabel, onConfirm, onClose}) {
    const {t} = useToolkitTranslation('security');
    const passwordSchema = Yup.object({password: Yup.string().max(CURRENT_PASSWORD_MAX_LENGTH).required(t('twoStep.passwordRequired'))});

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <Formik initialValues={{password: ''}} validationSchema={passwordSchema} enableReinitialize
                    onSubmit={async (values, helpers) => {
                        try {
                            await onConfirm(values.password);
                        } catch (error) {
                            showFormError(error, helpers, values);
                        }
                    }}>
                {() => (
                    <Form noValidate>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2}>
                                <DialogContentText>{description}</DialogContentText>
                                <FormProblemAlert />
                                <FormTextField name="password" label={t('twoStep.passwordLabel')} type="password" autoComplete="current-password" autoFocus />
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose}>{t('common:actions.cancel')}</Button>
                            <SubmitButton size="medium" color="error">{confirmLabel}</SubmitButton>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
}

/** Activar la app: escanear el QR (o teclear la clave) y confirmar con un código. */
function TotpDialog({setup, onConfirm, onClose}) {
    const {t} = useToolkitTranslation('security');
    const codeSchema = Yup.object({
        code: Yup.string().trim().required(t('twoStep.codeRequired')).min(TOTP_CODE_MIN_LENGTH).max(TOTP_CODE_MAX_LENGTH)
            .matches(TOTP_CODE_PATTERN, t('twoStep.codeFormat')),
    });

    return (
        <Dialog open={Boolean(setup)} onClose={onClose} maxWidth="xs" fullWidth>
            <Formik initialValues={{code: ''}} validationSchema={codeSchema}
                    onSubmit={async (values, helpers) => {
                        try {
                            await onConfirm(normalizeTotpCode(values.code));
                        } catch (error) {
                            showFormError(error, helpers, values);
                        }
                    }}>
                {() => (
                    <Form noValidate>
                        <DialogTitle>{t('twoStep.totpDialogTitle')}</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2}>
                                <Typography variant="body2">{t('twoStep.totpStep1')}</Typography>
                                {setup?.qrImageUrl && (
                                    <TwoStepQr component="img" src={setup.qrImageUrl} alt={t('twoStep.totpQrAlt')}
                                         ownSx={{width: QR_SIZE_PIXELS, height: QR_SIZE_PIXELS, alignSelf: 'center', borderRadius: 1, bgcolor: 'common.white'}} />
                                )}
                                <Typography variant="caption" color="text.secondary">{t('twoStep.totpCantScan')}</Typography>
                                <TwoStepSecret direction="row" spacing={1} ownSx={{alignItems: 'center'}}>
                                    <TwoStepSecretCode component="code" ownSx={{fontFamily: CODE_FONT, fontSize: 13, wordBreak: 'break-all'}}>{setup?.secret}</TwoStepSecretCode>
                                    <CopyButton value={setup?.secret ?? ''} />
                                </TwoStepSecret>
                                <Typography variant="body2">{t('twoStep.totpStep2')}</Typography>
                                <FormProblemAlert />
                                <FormTextField name="code" label={t('twoStep.codeLabel')} autoComplete="one-time-code" clearable={false}
                                               slotProps={{htmlInput: {inputMode: 'numeric', maxLength: TOTP_CODE_MAX_LENGTH}}} />
                                {setup?.extra}
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose}>{t('common:actions.cancel')}</Button>
                            <SubmitButton size="medium">{t('twoStep.activate')}</SubmitButton>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
}

/** Nombrar y crear una llave nueva (el navegador pide la huella, el rostro o el PIN); notice va arriba del nombre. */
function PasskeyDialog({open, onAdd, onClose, notice}) {
    const {t} = useToolkitTranslation('security');
    const nameSchema = Yup.object({name: Yup.string().trim().max(PASSKEY_NAME_MAX_LENGTH)});

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <Formik initialValues={{name: ''}} validationSchema={nameSchema}
                    onSubmit={async (values, helpers) => {
                        try {
                            await onAdd(values.name.trim());
                        } catch (error) {
                            showFormError(error, helpers, values);
                        }
                    }}>
                {() => (
                    <Form noValidate>
                        <DialogTitle>{t('twoStep.passkeyDialogTitle')}</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2}>
                                <DialogContentText>{t('twoStep.passkeyDialogText')}</DialogContentText>
                                {notice && <Alert severity="info">{notice}</Alert>}
                                <FormProblemAlert />
                                <FormTextField name="name" label={t('twoStep.passkeyName')} placeholder={t('twoStep.passkeyNamePlaceholder')} autoFocus
                                               slotProps={{htmlInput: {maxLength: PASSKEY_NAME_MAX_LENGTH}}} />
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose}>{t('common:actions.cancel')}</Button>
                            <SubmitButton size="medium" startIcon={<FingerprintOutlinedIcon />}>{t('twoStep.createPasskey')}</SubmitButton>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
}

/**
 * Un renglón de la tarjeta: ícono, nombre, explicación chica y su botón a la derecha.
 *
 * @param {{Icon: import('react').ElementType, title: string, caption?: import('react').ReactNode, captionColor?: string, action?: import('react').ReactNode}} props
 */
function SettingRow({Icon, title, caption, captionColor = 'text.secondary', action}) {
    return (
        <TwoStepHeader direction="row" spacing={1} ownSx={{alignItems: 'center', justifyContent: 'space-between'}}>
            <TwoStepHeaderTitle direction="row" spacing={1.5} ownSx={{alignItems: 'center', minWidth: 0}}>
                <Icon color="action" />
                <TwoStepHeaderText ownSx={{minWidth: 0}}>
                    <Typography variant="subtitle2">{title}</Typography>
                    {caption && <Typography variant="caption" color={captionColor} component="p">{caption}</Typography>}
                </TwoStepHeaderText>
            </TwoStepHeaderTitle>
            {action}
        </TwoStepHeader>
    );
}

/**
 * @param {object} props
 * @param {{isEnabled: boolean, enabledAt?: string|null, passkeys: Array<{id: string, name: string, createdAt: string, lastUsedAt?: string|null}>, totp: {isEnabled: boolean, enabledAt?: string|null}, recoveryCodesRemaining: number}} props.security
 * @param {(security: {isEnabled: boolean, enabledAt?: string|null, passkeys: Array<{id: string, name: string, createdAt: string, lastUsedAt?: string|null}>, totp: {isEnabled: boolean, enabledAt?: string|null}, recoveryCodesRemaining: number}) => void} props.onSecurityChange
 * @param {object} props.actions lo que hace el proyecto en cada caso; cada una regresa {security, recoveryCodes?}
 * @param {(name: string) => Promise<{security: object, recoveryCodes?: string[]}>} props.actions.addPasskey crea la llave
 *     (createPasskey) y la guarda en el servidor
 * @param {(passkey: {id: string, name: string}, password: string) => Promise<{security: object}>} props.actions.removePasskey
 * @param {() => Promise<{secret: string, qrImageUrl: string, extra?: import('react').ReactNode}>} props.actions.startTotp
 *     la clave y su QR; extra va abajo del campo (p. ej. un atajo de los ejemplos)
 * @param {(code: string) => Promise<{security: object, recoveryCodes?: string[]}>} props.actions.confirmTotp
 * @param {(password: string) => Promise<{security: object}>} props.actions.disableTotp
 * @param {(password: string) => Promise<{security: object, recoveryCodes: string[]}>} props.actions.regenerateRecoveryCodes
 * @param {boolean} [props.canUsePasskeys] passkeysSupported() de /passkeys; sin él no se ofrece agregar llaves
 * @param {string} [props.account] la cuenta (el correo), para el archivo de los códigos
 * @param {import('react').ReactNode} [props.passkeyNotice] un aviso en el diálogo de crear la llave, antes de que el
 *     navegador la guarde (p. ej. el de la demostración: la llave queda de verdad en el llavero de la persona)
 * @param {object} [props.texts] los textos que cambian, con la forma de `security` en los textos del paquete
 */
export default function TwoStepVerificationCard(props) {
    // lo que el proyecto puso en su tema (components.CalcitaTwoStepVerification.defaultProps) y encima lo que llega aquí
    const {security, onSecurityChange, actions, canUsePasskeys = false, account, passkeyNotice, texts} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('security', texts);
    const {formatDateTime} = useFormatters();
    // qué diálogo está abierto: uno a la vez
    const [dialog, setDialog] = useState(null);
    const [totpSetup, setTotpSetup] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState(null);
    const [error, setError] = useState(null);

    const close = () => setDialog(null);
    // lo que regresa cada acción: el estado nuevo, los códigos si hubo, el aviso y cerrar el diálogo
    const apply = (result, message) => {
        onSecurityChange(result.security);
        if (result.recoveryCodes?.length) {
            setRecoveryCodes(result.recoveryCodes);
        }
        if (message) {
            toastSuccess(message);
        }
        close();
    };

    const startTotp = async () => {
        setError(null);
        try {
            setTotpSetup(await actions.startTotp());
        } catch (caught) {
            setError(caught.message);
        }
    };

    const passkeyBeingRemoved = dialog?.passkey;
    const codesLeft = security.recoveryCodesRemaining;

    return (
        <ComponentTexts namespace="security" texts={texts}>
            <SectionCard title={t('twoStep.title')}>
                <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">{t('twoStep.description')}</Typography>
                    <Box>
                        {security.isEnabled
                            ? <Tag label={t('twoStep.active')} color="success" tooltip={t('twoStep.activeSince', {date: formatDateTime(security.enabledAt)})} />
                            : <Tag label={t('twoStep.inactive')} color="warning" tooltip={t('twoStep.inactiveTooltip')} />}
                    </Box>
                    {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

                    <Divider />
                    <SettingRow Icon={FingerprintOutlinedIcon} title={t('twoStep.passkeysTitle')}
                                caption={security.passkeys.length === 0 ? (canUsePasskeys ? t('twoStep.passkeysEmpty') : t('passkeys.unsupported')) : null}
                                action={canUsePasskeys && <Button size="small" onClick={() => setDialog({kind: 'passkey'})}>{t('twoStep.add')}</Button>} />
                    {security.passkeys.length > 0 && (
                        <List dense disablePadding>
                            {security.passkeys.map((passkey) => (
                                <ListItem key={passkey.id} disableGutters secondaryAction={(
                                    <Tooltip title={t('twoStep.removePasskeyTooltip')}>
                                        <IconButton edge="end" aria-label={t('twoStep.removePasskey', {name: passkey.name})}
                                                    onClick={() => setDialog({kind: 'removePasskey', passkey})}>
                                            <DeleteOutlineOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}>
                                    <TwoStepMenuIcon ownSx={{minWidth: 32}}><VpnKeyOutlinedIcon fontSize="small" /></TwoStepMenuIcon>
                                    <ListItemText primary={passkey.name}
                                                  secondary={passkey.lastUsedAt
                                                      ? t('twoStep.passkeyUsed', {date: formatDateTime(passkey.lastUsedAt)})
                                                      : t('twoStep.passkeyCreated', {date: formatDateTime(passkey.createdAt)})} />
                                </ListItem>
                            ))}
                        </List>
                    )}

                    <Divider />
                    <SettingRow Icon={PhonelinkLockOutlinedIcon} title={t('twoStep.appTitle')}
                                caption={security.totp.isEnabled ? t('twoStep.appActiveSince', {date: formatDateTime(security.totp.enabledAt)}) : t('twoStep.appDescription')}
                                action={security.totp.isEnabled
                                    ? <Button size="small" color="error" onClick={() => setDialog({kind: 'disableTotp'})}>{t('twoStep.deactivate')}</Button>
                                    : <Button size="small" onClick={startTotp}>{t('twoStep.activate')}</Button>} />

                    {/* los códigos de recuperación solo existen con la verificación activa */}
                    {security.isEnabled && (
                        <>
                            <Divider />
                            <SettingRow Icon={VpnKeyOutlinedIcon} title={t('twoStep.codesTitle')}
                                        caption={codesLeft ? t('twoStep.codesRemaining', {count: codesLeft}) : t('twoStep.codesNone')}
                                        captionColor={codesLeft <= FEW_CODES_LEFT ? 'warning.main' : 'text.secondary'}
                                        action={<Button size="small" onClick={() => setDialog({kind: 'regenerateCodes'})}>{t('twoStep.regenerate')}</Button>} />
                        </>
                    )}
                </Stack>

                <PasskeyDialog open={dialog?.kind === 'passkey'} onClose={close} notice={passkeyNotice}
                               onAdd={async (name) => apply(await actions.addPasskey(name), t('twoStep.passkeyAdded'))} />
                <TotpDialog setup={totpSetup} onClose={() => setTotpSetup(null)}
                            onConfirm={async (code) => {
                                const result = await actions.confirmTotp(code);
                                setTotpSetup(null);
                                apply(result, t('twoStep.appActivated'));
                            }} />
                <PasswordDialog open={dialog?.kind === 'disableTotp'} onClose={close} title={t('twoStep.disableTitle')}
                                description={t('twoStep.disableText')} confirmLabel={t('twoStep.deactivate')}
                                onConfirm={async (password) => apply(await actions.disableTotp(password), t('twoStep.appDeactivated'))} />
                <PasswordDialog open={dialog?.kind === 'removePasskey'} onClose={close}
                                title={t('twoStep.removeTitle', {name: passkeyBeingRemoved?.name ?? ''})} description={t('twoStep.removeText')}
                                confirmLabel={t('twoStep.remove')}
                                onConfirm={async (password) => apply(await actions.removePasskey(passkeyBeingRemoved, password), t('twoStep.passkeyRemoved'))} />
                <PasswordDialog open={dialog?.kind === 'regenerateCodes'} onClose={close} title={t('twoStep.regenerateTitle')}
                                description={t('twoStep.regenerateText')} confirmLabel={t('twoStep.generate')}
                                onConfirm={async (password) => apply(await actions.regenerateRecoveryCodes(password))} />
                <RecoveryCodesDialog codes={recoveryCodes} account={account} onClose={() => setRecoveryCodes(null)} />
            </SectionCard>
        </ComponentTexts>
    );
}
