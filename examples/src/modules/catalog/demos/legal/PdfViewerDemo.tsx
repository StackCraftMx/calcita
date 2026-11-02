// Un PDF en una ventana con el visor del navegador, sin librerías: «Abrir en otra pestaña» y «Descargar» siempre a la vista
// (en el iPhone el visor dentro de la página enseña solo la primera hoja). src es la dirección o el archivo (un Blob del API).
import {useState} from 'react';
import Button from '@mui/material/Button';
import {PdfViewerDialog} from '@stackcraftmx/calcita';

// ─── El PDF de ejemplo (en su proyecto NO va: es la dirección del suyo o el Blob que mandó su API) ───
const SAMPLE_PDF_URL = `${import.meta.env.BASE_URL}docs/aviso-de-privacidad-ejemplo.pdf`;

const PdfViewerDemo = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button variant="outlined" onClick={() => setIsOpen(true)}>Ver el aviso de privacidad</Button>
            <PdfViewerDialog open={isOpen} onClose={() => setIsOpen(false)} title="Aviso de privacidad (ejemplo)" src={SAMPLE_PDF_URL}
                             fileName="aviso-de-privacidad.pdf" />
        </>
    );
};

export default PdfViewerDemo;
