// Documentos fiscales de la tienda de ejemplo, con /mexico del paquete:
//   - facturas de proveedores: el XML se lee en el navegador (readCfdiFile) y se enseña su resumen (CfdiSummary) con el aviso
//     si no es para la tienda; «Cargar» la manda al servidor, que vuelve a revisar y no deja cargar dos veces el mismo folio
//     fiscal (409);
//   - la e.firma de la empresa: EfirmaFields lee el .cer aquí mismo (RFC, nombre, número, vigencia) y abre la llave con su
//     contraseña también aquí, para saber si está bien antes de guardarla;
//   - los archivos de ejemplo (de mentira) para probar, con TemplateDownloadButton.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useCallback, useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
    FileInput, PageHeading, SectionCard, TemplateDownloadButton, formatDateTime, toastProblem, toastSuccess, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {CfdiSummary, EfirmaFields, readCfdiFile} from '@stackcraftmx/calcita/mexico';
import {Money} from '@stackcraftmx/calcita/money';

import {publicUrlOf} from '@/core';
import {STORE_RFC, listInvoices, uploadInvoice} from '@/modules/fiscal/fiscalApi.js';

// ─── Los archivos de ejemplo (de mentira: certificado hecho con openssl, factura inventada) y la contraseña de su llave ───
const SAMPLE_FILES = Object.freeze([
    {labelKey: 'samples.invoice', path: 'docs/factura-ejemplo.xml'},
    {labelKey: 'samples.certificate', path: 'docs/efirma-ejemplo.cer'},
    {labelKey: 'samples.key', path: 'docs/efirma-ejemplo.key'},
]);
const SAMPLE_KEY_PASSWORD = 'Ejemplo2026';
const EMPTY_EFIRMA = Object.freeze({certificateFile: null, keyFile: null, password: ''});

export const FiscalPage = () => {
    const {t} = useToolkitTranslation('fiscal');
    const [invoiceFile, setInvoiceFile] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [invoiceError, setInvoiceError] = useState(null);
    const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
    const [loadedInvoices, setLoadedInvoices] = useState(null);
    const [efirma, setEfirma] = useState(EMPTY_EFIRMA);

    const reload = useCallback((signal) => listInvoices(signal).then(setLoadedInvoices).catch((error) => error.name !== 'AbortError' && toastProblem(error)), []);
    useEffect(() => {
        const controller = new AbortController();
        reload(controller.signal);
        return () => controller.abort();
    }, [reload]);

    // el XML se lee aquí: si no es factura se dice en el campo, sin mandar nada
    const chooseInvoice = async (file) => {
        setInvoiceFile(file);
        setInvoice(null);
        setInvoiceError(null);
        if (!file) {
            return;
        }
        const cfdi = await readCfdiFile(file);
        if (cfdi) {
            setInvoice(cfdi);
        } else {
            setInvoiceError(t('invoices.notCfdi'));
        }
    };

    const loadInvoice = async () => {
        setIsLoadingInvoice(true);
        try {
            const {message} = await uploadInvoice({
                uuid: invoice.stamp?.uuid, issuerRfc: invoice.issuer.rfc, issuerName: invoice.issuer.name, receiverRfc: invoice.receiver.rfc,
                total: invoice.total, currency: invoice.currency, issuedAt: invoice.issuedAt,
            });
            toastSuccess(message);
            setInvoiceFile(null);
            setInvoice(null);
            reload();
        } catch (error) {
            toastProblem(error);
        } finally {
            setIsLoadingInvoice(false);
        }
    };

    return (
        <Stack spacing={3}>
            <PageHeading title={t('page.title')} description={t('page.subtitle')} />

            <SectionCard title={t('samples.title')}>
                <Typography variant="body2" color="text.secondary" sx={{mb: 1.5}}>{t('samples.text', {password: SAMPLE_KEY_PASSWORD})}</Typography>
                <Stack direction="row" sx={{gap: 1, flexWrap: 'wrap'}}>
                    {SAMPLE_FILES.map(({labelKey, path}) => (
                        <TemplateDownloadButton key={path} href={publicUrlOf(path)} fileName={path.split('/').pop()} label={t(labelKey)} variant="outlined" size="small" />
                    ))}
                </Stack>
            </SectionCard>

            <SectionCard title={t('invoices.title')}>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('invoices.text')}</Typography>
                <FileInput label={t('invoices.file')} value={invoiceFile} onChange={chooseInvoice} accept=".xml" error={invoiceError ?? undefined}
                           helperText={t('invoices.fileHelp')} />
                {invoice && (
                    <CfdiSummary cfdi={invoice} expectedReceiverRfc={STORE_RFC} sx={{mt: 1}}
                                 actions={(
                                     <Button variant="contained" onClick={loadInvoice} loading={isLoadingInvoice} disabled={!invoice.stamp}>
                                         {t('invoices.load')}
                                     </Button>
                                 )} />
                )}
                <Typography variant="subtitle2" sx={{mt: 3}}>{t('invoices.loadedTitle')}</Typography>
                {loadedInvoices?.length === 0 && <Typography variant="body2" color="text.secondary">{t('invoices.empty')}</Typography>}
                <List dense>
                    {(loadedInvoices ?? []).map((loaded) => (
                        <ListItem key={loaded.uuid} disableGutters>
                            <ListItemText
                                primary={`${loaded.issuer_name} · ${Money.fromString(loaded.total, {currency: loaded.currency}).format()}`}
                                secondary={`${loaded.uuid} · ${t('invoices.loadedAt', {date: formatDateTime(loaded.loaded_at)})}`}
                                slotProps={{secondary: {sx: {overflowWrap: 'anywhere'}}}}
                            />
                        </ListItem>
                    ))}
                </List>
            </SectionCard>

            <SectionCard title={t('efirma.title')}>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('efirma.text')}</Typography>
                {/* «Revisar la e.firma» abre la llave en el navegador (jsrsasign): nada viaja al servidor */}
                <EfirmaFields value={efirma} onChange={setEfirma} expectedRfc={STORE_RFC} />
            </SectionCard>
        </Stack>
    );
};
