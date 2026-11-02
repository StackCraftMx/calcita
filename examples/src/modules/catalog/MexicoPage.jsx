// Hecho en Calcita · México: el RFC, la CURP y la CLABE con su dígito verificador, la factura electrónica (CFDI) leída del XML
// y la e.firma con su certificado leído en el navegador. Son estándares del SAT, RENAPO y Banxico, no reglas de un cliente.
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import CfdiDemo from '@/modules/catalog/demos/mexico/CfdiDemo.tsx';
import EfirmaDemo from '@/modules/catalog/demos/mexico/EfirmaDemo.tsx';
import MexicoIdentifiers from '@/modules/catalog/demos/mexico/MexicoIdentifiers.tsx';

const loadIdentifiers = () => import('@/modules/catalog/demos/mexico/MexicoIdentifiers.tsx?demo-source');
const loadCfdi = () => import('@/modules/catalog/demos/mexico/CfdiDemo.tsx?demo-source');
const loadEfirma = () => import('@/modules/catalog/demos/mexico/EfirmaDemo.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogPageTexts
// (mexico.<sección>.extend.<id>)
const IDENTIFIER_EXTENSIONS = [
    {id: 'validators', option: 'isValidRfc · isValidCurp · isValidClabe', example: "isValidRfc('SAT970701NN3', {strict: true})"},
    {id: 'rules', option: 'rfcRule · curpRule · clabeRule', example: 'Yup.string().required().test(clabeRule())'},
    {id: 'kind', option: 'rfcKindOf · RFC_KIND', example: "rfcKindOf(rfc) === RFC_KIND.company  // persona moral"},
    {id: 'digits', option: 'rfcCheckDigitOf · curpCheckDigitOf · clabeCheckDigitOf', example: "clabeCheckDigitOf('03218000011835971')  // '9'"},
    {id: 'mask', option: 'MaskedInput mask={INPUT_MASK.rfc · curp · clabe}', example: '<MaskedInput label="RFC" mask={INPUT_MASK.rfc} … />'},
];
const CFDI_EXTENSIONS = [
    {id: 'read', option: 'readCfdi · readCfdiFile', example: 'const cfdi = await readCfdiFile(file);  // null si no es factura'},
    {id: 'receiver', option: 'expectedReceiverRfc', example: 'expectedReceiverRfc={company.rfc}'},
    {id: 'actions', option: 'actions · showConcepts', example: 'actions={<Button onClick={load}>Cargar</Button>} showConcepts={false}'},
    {id: 'type', option: 'CFDI_VOUCHER_TYPE', example: 'cfdi.voucherType === CFDI_VOUCHER_TYPE.expense  // nota de crédito'},
    {id: 'theme', option: 'theme.components.CalcitaCfdiSummary', example: "styleOverrides: {amounts: {gap: 4}}"},
];
const EFIRMA_EXTENSIONS = [
    {id: 'value', option: 'value · onChange', example: '{certificateFile, keyFile, password}'},
    {id: 'verify', option: 'onVerifyKey', example: 'onVerifyKey={({certificateFile, keyFile, password}) => api.verifyEfirma(…)}'},
    {id: 'expected', option: 'expectedRfc · onCertificateRead', example: 'onCertificateRead={(certificate) => setRfc(certificate?.rfc)}'},
    {id: 'reader', option: 'readCertificate · certificateStatusOf', example: 'const certificate = readCertificate(await file.arrayBuffer());'},
    {id: 'texts', option: 'verifyLabel · texts', example: 'verifyLabel="Probar el sello digital"'},
];

export const MexicoPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `mexico.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('mexico.title')} description={t('mexico.description')} />
            <DemoSection title={t('mexico.identifiers.title')} description={t('mexico.identifiers.description')}
                         extensions={rowsOf('identifiers', IDENTIFIER_EXTENSIONS)} Demo={MexicoIdentifiers} loadSource={loadIdentifiers} />
            <DemoSection title={t('mexico.cfdi.title')} description={t('mexico.cfdi.description')}
                         extensions={rowsOf('cfdi', CFDI_EXTENSIONS)} Demo={CfdiDemo} loadSource={loadCfdi} />
            <DemoSection title={t('mexico.efirma.title')} description={t('mexico.efirma.description')}
                         extensions={rowsOf('efirma', EFIRMA_EXTENSIONS)} Demo={EfirmaDemo} loadSource={loadEfirma} />
        </Stack>
    );
};
