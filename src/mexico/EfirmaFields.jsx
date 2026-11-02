// La e.firma (o el sello digital) de una persona o una empresa: el certificado (.cer), la llave privada (.key) y su
// contraseña, con lo que dice el certificado a la vista (RFC, nombre, número de certificado, vigencia), leído en el navegador
// sin subirlo.
//
// Avisa sin esperar al servidor: un .cer que no es certificado, uno vencido o que todavía no vale, y un RFC distinto al que se
// espera (expectedRfc: el de la empresa).
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
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
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
 * @param {boolean} [props.disabled]
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `mexico` en los textos del paquete
 */
export default function EfirmaFields(props) {
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
    const canVerify = Boolean(certificate && value.keyFile && value.password) && status === CERTIFICATE_STATUS.valid && !disabled;

    return (
        <EfirmaRoot ownSx={{gap: 1}} sx={sx}>
            <FileInput label={t('efirma.certificate')} value={value.certificateFile} onChange={chooseCertificate} accept=".cer" disabled={disabled}
                       error={readError ?? undefined} helperText={t('efirma.certificateHelp')} texts={texts} />
            <FileInput label={t('efirma.privateKey')} value={value.keyFile} onChange={(keyFile) => change({keyFile})} accept=".key" disabled={disabled}
                       helperText={t('efirma.privateKeyHelp')} texts={texts} />
            <TextInput label={t('efirma.password')} type="password" value={value.password} onChange={(password) => change({password})}
                       autoComplete="off" disabled={disabled} helperText={t('efirma.passwordHelp')} />

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
