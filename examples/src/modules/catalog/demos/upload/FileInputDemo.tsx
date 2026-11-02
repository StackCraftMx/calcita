// Un archivo del tamaño de un campo, dentro de un formulario: la etiqueta a la izquierda (en una FormSection), «Elegir
// archivo», el elegido en su chip con la ×, y abajo la ayuda o el error. Revisa tipo y peso como la zona grande. El segundo
// ya trae un archivo guardado (al editar un registro) y ofrece su plantilla.
import {useState} from 'react';
import {FileInput, FormSection, toastSuccess} from '@stackcraftmx/calcita';

// ─── La plantilla de mentira (en su proyecto NO va: la da su API o es un archivo fijo con href) ───
const fakeTemplate = async () => ({blob: new Blob(['Nombre,Correo\n'], {type: 'text/csv'}), fileName: 'plantilla-contactos.csv'});

const FileInputDemo = () => {
    const [certificate, setCertificate] = useState<File | null>(null);
    // al editar: lo que ya está guardado llega como {name, size}; si se elige otro, llega el File nuevo
    const [contacts, setContacts] = useState<File | {name: string, size?: number} | null>({name: 'contactos-octubre.csv', size: 18_400});

    return (
        <FormSection title="Documentos" footer="Se puede soltar el archivo encima del renglón.">
            {/* 1. Solo PDF de hasta 2 MB; lo demás se rechaza con su motivo antes de subirlo */}
            <FileInput label="Constancia fiscal" value={certificate} onChange={setCertificate} accept="pdf" maxSize="2 MB"
                       helperText="PDF de hasta 2 MB" />
            {/* 2. Con un archivo ya guardado, su plantilla junto al botón y un aviso al cambiarlo */}
            <FileInput label="Contactos" value={contacts} accept="csv" template={{request: fakeTemplate, format: 'csv'}}
                       onChange={(file) => {
                           setContacts(file);
                           if (file) {
                               toastSuccess(`Se subirá «${file.name}» al guardar.`);
                           }
                       }} />
        </FormSection>
    );
};

export default FileInputDemo;
