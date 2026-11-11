// La e.firma (o el sello digital) de una persona o una empresa: el certificado (.cer), la llave privada (.key) y su
// contraseña, con lo que dice el certificado a la vista (RFC, nombre, número de certificado, vigencia), leído en el navegador
// sin subirlo.
//
// Avisa sin esperar al servidor: un .cer que no es certificado, uno vencido o que todavía no vale, y un RFC distinto al que se
// espera (expectedRfc: el de la empresa).
//
// Mientras el .cer elegido no sirva (no es certificado, venció, todavía no vale o es de otro RFC), la llave, la contraseña y
// «Revisar» se apagan, con el motivo abajo: no se pide la clave de una llave que no se va a registrar. El .cer sigue prendido
// para cambiarlo por el bueno. Sin .cer elegido, todo prendido como siempre.
//
// disabled apaga todo (true) o cada parte ({certificate, privateKey, password}): un certificado que ya está registrado y solo
// pide su llave, por ejemplo. Una llave mal escrita truena al pintar.
//
// «Revisar la e.firma» abre la llave con su contraseña y comprueba que es la de ese certificado, en el navegador
// (verifyEfirmaKey, con jsrsasign: la llave del SAT viene cifrada con 3DES, que el navegador no trae), y dice el motivo de un
// «no»: la contraseña, otra llave o un archivo que no es llave. Con onVerifyKey la revisión es del proyecto (su API con
// OpenSSL, por ejemplo). Calcita no manda la llave ni la contraseña a ningún lado por su cuenta.
//
// Controlado: value {certificateFile, keyFile, password} y onChange con el valor completo.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaEfirmaFields con defaultProps y
// styleOverrides de sus partes: root, certificate, verify.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import TextInput from '@/inputs/TextInput.jsx';
import {CERTIFICATE_STATUS, certificateStatusOf, readCertificate} from '@/mexico/certificateReader.js';
import {EfirmaKeyError, verifyEfirmaKey} from '@/mexico/efirmaKey.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import DefinitionList from '@/ui/layout/DefinitionList.jsx';
import FileInput from '@/upload/FileInput.jsx';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaEfirmaFields)
const THEME_NAME = 'CalcitaEfirmaFields';
const EfirmaRoot = piecePart(THEME_NAME, 'Root', Stack);
const EfirmaCertificate = piecePart(THEME_NAME, 'Certificate', Paper);
const EfirmaVerify = piecePart(THEME_NAME, 'Verify', Stack);

// el color del chip de la vigencia
const STATUS_COLORS = Object.freeze({
    [CERTIFICATE_STATUS.valid]: 'success', [CERTIFICATE_STATUS.expired]: 'error', [CERTIFICATE_STATUS.notYetValid]: 'warning',
});
// en qué va la revisión de la llave
const VERIFY_STATE = Object.freeze({idle: 'idle', verifying: 'verifying', verified: 'verified', failed: 'failed'});
const EMPTY_VALUE = Object.freeze({certificateFile: null, keyFile: null, password: ''});
// las partes que se apagan una por una con disabled={{…}}
const EFIRMA_PARTS = Object.freeze(['certificate', 'privateKey', 'password']);

/**
 * disabled como llega (todo o por parte) a una respuesta por parte. Una parte mal escrita truena: un {key: true} que no
 * apagara nada sin avisar dejaría escribir la contraseña que la pantalla quería apagar.
 *
 * @param {boolean|Record<string, boolean>} disabled
 * @returns {{certificate: boolean, privateKey: boolean, password: boolean}}
 */
function disabledPartsOf(disabled) {
    if (disabled === null || typeof disabled !== 'object') {
        const isOff = Boolean(disabled);
        return {certificate: isOff, privateKey: isOff, password: isOff};
    }
    const unknownParts = Object.keys(disabled).filter((part) => !EFIRMA_PARTS.includes(part));
    if (unknownParts.length > 0) {
        throw new Error(`EfirmaFields: disabled no conoce ${unknownParts.join(', ')}; las partes son ${EFIRMA_PARTS.join(', ')}.`);
    }
    return {certificate: Boolean(disabled.certificate), privateKey: Boolean(disabled.privateKey), password: Boolean(disabled.password)};
}

/**
 * @param {object} props
 * @param {{certificateFile: File|null, keyFile: File|null, password: string}} [props.value]
 * @param {(value: {certificateFile: File|null, keyFile: File|null, password: string}) => void} props.onChange el valor completo
 * @param {string} [props.expectedRfc] el RFC que debe traer el certificado (el de la empresa); si es otro, se avisa
 * @param {(certificate: ReturnType<typeof import('@/mexico/certificateReader.js').readCertificate>|null) => void} [props.onCertificateRead] lo que dice el certificado al elegirlo (null al quitarlo
 *     o si no se pudo leer)
 * @param {(input: {certificateFile: File, keyFile: File, password: string, certificate: ReturnType<typeof import('@/mexico/certificateReader.js').readCertificate>}) => Promise<void>} [props.onVerifyKey]
 *     la revisión del proyecto (su API); si truena, su mensaje se enseña. Sin él, se abre en el navegador con jsrsasign
 * @param {string} [props.verifyLabel] ya traducido; por omisión «Revisar la e.firma»
 * @param {boolean|{certificate?: boolean, privateKey?: boolean, password?: boolean}} [props.disabled] true apaga todo; con un
 *     objeto, cada parte
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `mexico` en los textos del paquete
 */
function EfirmaFieldsContent(props) {
    const {
        value = EMPTY_VALUE, onChange, expectedRfc, onCertificateRead, onVerifyKey, verifyLabel, disabled = false, sx, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('mexico', texts);
    const {formatDate} = useFormatters();
    const [certificate, setCertificate] = useState(null);
    const [readError, setReadError] = useState(null);
    const [verify, setVerify] = useState({state: VERIFY_STATE.idle, message: null});

    // cualquier cambio deja la revisión de la llave sin hacer: ya no es la misma combinación
    const change = (changes) => {
        setVerify({state: VERIFY_STATE.idle, message: null});
        onChange({...value, ...changes});
    };

    const chooseCertificate = async (certificateFile) => {
        change({certificateFile});
        setReadError(null);
        if (!certificateFile) {
            setCertificate(null);
            onCertificateRead?.(null);
            return;
        }
        try {
            const read = readCertificate(new Uint8Array(await certificateFile.arrayBuffer()));
            setCertificate(read);
            onCertificateRead?.(read);
        } catch {
            setCertificate(null);
            setReadError(t('efirma.notCertificate'));
            onCertificateRead?.(null);
        }
    };

    // sin revisión del proyecto, la del navegador, con el motivo de un «no» en palabras de la persona
    const verifyInBrowser = async ({certificateFile, keyFile, password}) => {
        try {
            await verifyEfirmaKey({certificateBytes: await certificateFile.arrayBuffer(), keyBytes: await keyFile.arrayBuffer(), password});
        } catch (error) {
            throw new Error(error instanceof EfirmaKeyError ? t(`efirma.problems.${error.reason}`) : t('efirma.verifyFailed'));
        }
    };

    const verifyKey = async () => {
        setVerify({state: VERIFY_STATE.verifying, message: null});
        try {
            await (onVerifyKey ?? verifyInBrowser)({
                certificateFile: value.certificateFile, keyFile: value.keyFile, password: value.password, certificate,
            });
            setVerify({state: VERIFY_STATE.verified, message: null});
        } catch (error) {
            setVerify({state: VERIFY_STATE.failed, message: error?.message ?? t('efirma.verifyFailed')});
        }
    };

    const status = certificate ? certificateStatusOf(certificate) : null;
    const isOtherRfc = Boolean(certificate && expectedRfc) && certificate.rfc?.toUpperCase() !== expectedRfc.toUpperCase();
    const disabledParts = disabledPartsOf(disabled);
    // el .cer elegido no sirve: la llave y la contraseña esperan al bueno (con el motivo abajo)
    const lockReason = (() => {
        if (readError || (certificate && status !== CERTIFICATE_STATUS.valid)) {
            return t('efirma.lockedNotValid');
        }
        return isOtherRfc ? t('efirma.lockedOtherRfc', {expected: expectedRfc}) : null;
    })();
    const isKeyOff = disabledParts.privateKey || Boolean(lockReason);
    const isPasswordOff = disabledParts.password || Boolean(lockReason);
    const canVerify = Boolean(certificate && value.keyFile && value.password) && status === CERTIFICATE_STATUS.valid && !isOtherRfc
        && !isKeyOff && !isPasswordOff;

    return (
        <EfirmaRoot ownSx={{gap: 1}} sx={sx}>
            <FileInput label={t('efirma.certificate')} value={value.certificateFile} onChange={chooseCertificate} accept=".cer"
                       disabled={disabledParts.certificate} error={readError ?? undefined} helperText={t('efirma.certificateHelp')} texts={texts} />
            <FileInput label={t('efirma.privateKey')} value={value.keyFile} onChange={(keyFile) => change({keyFile})} accept=".key" disabled={isKeyOff}
                       helperText={lockReason ?? t('efirma.privateKeyHelp')} texts={texts} />
            <TextInput label={t('efirma.password')} type="password" value={value.password} onChange={(password) => change({password})}
                       autoComplete="off" disabled={isPasswordOff} helperText={lockReason ?? t('efirma.passwordHelp')} />

            {certificate && (
                <EfirmaCertificate variant="outlined" ownSx={{p: 2, borderRadius: 2}}>
                    <Stack direction="row" sx={{alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap'}}>
                        <Typography variant="subtitle1" component="p" sx={{mr: 'auto'}}>{certificate.name ?? certificate.organization ?? '—'}</Typography>
                        <Chip size="small" color={STATUS_COLORS[status]} label={t(`efirma.status.${status}`)} />
                    </Stack>
                    {isOtherRfc && <Alert severity="warning" sx={{mb: 1.5}}>{t('efirma.otherRfc', {rfc: certificate.rfc, expected: expectedRfc})}</Alert>}
                    <DefinitionList entries={[
                        {label: t('efirma.rfc'), value: certificate.rfc ?? '—'},
                        ...(certificate.representativeRfc ? [{label: t('efirma.representative'), value: [certificate.representativeRfc, certificate.representativeCurp].filter(Boolean).join(' · ')}] : []),
                        ...(certificate.curp ? [{label: t('efirma.curp'), value: certificate.curp}] : []),
                        {label: t('efirma.certificateNumber'), value: certificate.certificateNumber},
                        {label: t('efirma.validity'), value: t('efirma.validityRange', {from: formatDate(certificate.validFrom), to: formatDate(certificate.validTo)})},
                        ...(certificate.branch ? [{label: t('efirma.branch'), value: certificate.branch}] : []),
                    ]} />
                </EfirmaCertificate>
            )}

            <EfirmaVerify direction="row" ownSx={{gap: 1.5, alignItems: 'center', flexWrap: 'wrap', mt: 1}}>
                <Button variant="outlined" onClick={verifyKey} disabled={!canVerify || verify.state === VERIFY_STATE.verifying}
                        loading={verify.state === VERIFY_STATE.verifying}>
                    {verifyLabel ?? t('efirma.verify')}
                </Button>
                {verify.state === VERIFY_STATE.verified && <Alert severity="success" sx={{py: 0}}>{t('efirma.verified')}</Alert>}
                {verify.state === VERIFY_STATE.failed && <Alert severity="error" role="alert" sx={{py: 0}}>{verify.message}</Alert>}
            </EfirmaVerify>
        </EfirmaRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const EfirmaFields = withPieceSlots(EfirmaFieldsContent, THEME_NAME);
export default EfirmaFields;
