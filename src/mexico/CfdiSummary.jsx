// El resumen de una factura (lo que regresa readCfdi): quién la emite y a quién, cuándo, de qué tipo, cuánto, sus conceptos y
// su folio fiscal con el botón de copiar. Si la pantalla dice qué RFC debe recibirla (expectedReceiverRfc) y no es, lo avisa
// arriba: es el error más común al cargar facturas de proveedores.
//
// Los montos se escriben con Money (sin redondeos de float) en la moneda de la factura.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaCfdiSummary con defaultProps y
// styleOverrides de sus partes: root, header, amounts, concepts.
//
// Genérico del paquete: function (regla de la casa).
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import {Money} from '@/money/money.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import CopyButton from '@/ui/actions/CopyButton.jsx';
import DefinitionList from '@/ui/layout/DefinitionList.jsx';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaCfdiSummary)
const THEME_NAME = 'CalcitaCfdiSummary';
const SummaryRoot = piecePart(THEME_NAME, 'Root', Paper);
const SummaryHeader = piecePart(THEME_NAME, 'Header', Stack);
const SummaryAmounts = piecePart(THEME_NAME, 'Amounts', Stack);
const SummaryConcepts = piecePart(THEME_NAME, 'Concepts', Box);

const DEFAULT_CURRENCY = 'MXN';

/**
 * @param {object} props
 * @param {import('@/mexico/cfdiReader.js').Cfdi} props.cfdi lo que regresa readCfdi
 * @param {string} [props.expectedReceiverRfc] el RFC que debe recibirla (el de la empresa); si es otro, se avisa
 * @param {boolean} [props.showConcepts] por omisión, sí
 * @param {import('react').ReactNode} [props.actions] botones suyos abajo («Cargar la factura»)
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `mexico` en los textos del paquete
 */
export default function CfdiSummary(props) {
    const {cfdi, expectedReceiverRfc, showConcepts = true, actions, sx, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('mexico', texts);
    const {formatDateTime} = useFormatters();
    const currency = cfdi.currency && cfdi.currency !== 'XXX' ? cfdi.currency : DEFAULT_CURRENCY;
    const moneyOf = (amount) => (amount ? Money.fromString(amount, {currency}).format() : '—');
    const isOtherReceiver = Boolean(expectedReceiverRfc) && cfdi.receiver.rfc?.toUpperCase() !== expectedReceiverRfc.toUpperCase();
    const voucherTypeLabel = cfdi.voucherType ? t(`cfdi.voucherTypes.${cfdi.voucherType}`, {defaultValue: cfdi.voucherType}) : '—';

    return (
        <SummaryRoot variant="outlined" ownSx={{p: {xs: 2, sm: 2.5}, borderRadius: 2}} sx={sx}>
            {isOtherReceiver && (
                <Alert severity="warning" sx={{mb: 2}}>{t('cfdi.otherReceiver', {rfc: cfdi.receiver.rfc, expected: expectedReceiverRfc})}</Alert>
            )}
            {!cfdi.stamp && <Alert severity="warning" sx={{mb: 2}}>{t('cfdi.notStamped')}</Alert>}
            <SummaryHeader direction="row" ownSx={{gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1.5}}>
                <Typography variant="h6" component="p" sx={{mr: 'auto'}}>
                    {[cfdi.series, cfdi.folio].filter(Boolean).join('-') || t('cfdi.withoutFolio')}
                </Typography>
                <Chip size="small" label={voucherTypeLabel} />
                {cfdi.version && <Chip size="small" variant="outlined" label={t('cfdi.version', {version: cfdi.version})} />}
            </SummaryHeader>
            <DefinitionList entries={[
                {label: t('cfdi.issuer'), value: `${cfdi.issuer.name ?? '—'} · ${cfdi.issuer.rfc ?? '—'}`},
                {label: t('cfdi.receiver'), value: `${cfdi.receiver.name ?? '—'} · ${cfdi.receiver.rfc ?? '—'}`},
                {label: t('cfdi.issuedAt'), value: cfdi.issuedAt ? formatDateTime(cfdi.issuedAt) : '—'},
                ...(cfdi.stamp ? [{
                    label: t('cfdi.uuid'),
                    value: (
                        <Stack direction="row" sx={{alignItems: 'center', gap: 0.5}}>
                            <Box component="span" sx={{fontFamily: 'monospace', overflowWrap: 'anywhere'}}>{cfdi.stamp.uuid}</Box>
                            <CopyButton value={cfdi.stamp.uuid} label={t('cfdi.copyUuid')} />
                        </Stack>
                    ),
                }] : []),
            ]} />
            <SummaryAmounts direction="row" ownSx={{gap: 3, flexWrap: 'wrap', mt: 2}}>
                {[['subtotal', cfdi.subtotal], ['taxes', cfdi.taxes.transferred], ['total', cfdi.total]].map(([key, amount]) => (
                    <Box key={key}>
                        <Typography variant="caption" color="text.secondary" component="p">{t(`cfdi.${key}`)}</Typography>
                        <Typography variant={key === 'total' ? 'h6' : 'body1'} component="p" sx={{fontVariantNumeric: 'tabular-nums'}}>
                            {moneyOf(amount)}
                        </Typography>
                    </Box>
                ))}
            </SummaryAmounts>
            {showConcepts && cfdi.concepts.length > 0 && (
                <SummaryConcepts ownSx={{mt: 2, overflowX: 'auto'}}>
                    <Table size="small" aria-label={t('cfdi.concepts')}>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('cfdi.description')}</TableCell>
                                <TableCell align="right">{t('cfdi.quantity')}</TableCell>
                                <TableCell align="right">{t('cfdi.amount')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cfdi.concepts.map((concept, index) => (
                                // OJO: dos conceptos pueden decir lo mismo; el lugar en la factura es lo único seguro
                                <TableRow key={index}>
                                    <TableCell>{concept.description}</TableCell>
                                    <TableCell align="right">{concept.quantity}</TableCell>
                                    <TableCell align="right" sx={{whiteSpace: 'nowrap'}}>{moneyOf(concept.amount)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </SummaryConcepts>
            )}
            {actions && <Stack direction="row" sx={{gap: 1, justifyContent: 'flex-end', mt: 2}}>{actions}</Stack>}
        </SummaryRoot>
    );
}
