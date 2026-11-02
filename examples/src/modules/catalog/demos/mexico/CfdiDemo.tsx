// Una factura (CFDI) leída en el navegador, sin subirla: quién la emite y a quién, cuánto, sus conceptos y su folio fiscal, con
// el aviso si no es para la empresa. Elija un XML o use el de ejemplo.
import {useState} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {FileInput} from '@stackcraftmx/calcita';
import {CfdiSummary, readCfdi, readCfdiFile} from '@stackcraftmx/calcita/mexico';
import type {Cfdi} from '@stackcraftmx/calcita/mexico';

// ─── Lo de mentira (en su proyecto NO va): la factura de ejemplo y el RFC de su empresa ───
const SAMPLE_INVOICE_URL = `${import.meta.env.BASE_URL}docs/factura-ejemplo.xml`;
const COMPANY_RFC = 'AAA010101AAA';

const CfdiDemo = () => {
    const [file, setFile] = useState<File | null>(null);
    const [cfdi, setCfdi] = useState<Cfdi | null>(null);
    const [isNotCfdi, setIsNotCfdi] = useState(false);

    // 1. Leer el XML elegido: si no es factura se dice, sin mandar nada
    const show = (read: Cfdi | null) => {
        setCfdi(read);
        setIsNotCfdi(!read);
    };
    const choose = async (chosen: File | null) => {
        setFile(chosen);
        if (chosen) {
            show(await readCfdiFile(chosen));
        } else {
            setCfdi(null);
            setIsNotCfdi(false);
        }
    };

    return (
        <Stack spacing={1.5} sx={{maxWidth: 640}}>
            <FileInput label="Factura (XML)" value={file} onChange={choose} accept=".xml"
                       actions={<Button size="small" onClick={async () => show(readCfdi(await (await fetch(SAMPLE_INVOICE_URL)).text()))}>Usar la de ejemplo</Button>} />
            {isNotCfdi && <Alert severity="error">El archivo no es una factura (CFDI).</Alert>}
            {/* 2. El resumen, con el aviso si no es para su empresa */}
            {cfdi && <CfdiSummary cfdi={cfdi} expectedReceiverRfc={COMPANY_RFC} />}
        </Stack>
    );
};

export default CfdiDemo;
