// Varios archivos como en un correo: «Adjuntar», cada uno en su chip con su ×, y cuántos van y cuánto pesan contra el tope.
// Revisa el tipo y el peso de cada uno, cuántos y cuánto pesan juntos; uno con el mismo nombre reemplaza al que ya estaba.
// La lista mezcla lo nuevo (File) con lo que ya está guardado ({id, name, size}).
import {useState} from 'react';
import {AttachmentsInput, toastSuccess} from '@stackcraftmx/calcita';

type Attachment = File | {id: string, name: string, size?: number};

const AttachmentsDemo = () => {
    // 1. Lo que ya estaba guardado llega con su id; lo nuevo se suma como File
    const [attachments, setAttachments] = useState<Attachment[]>([{id: 'att-1', name: 'contrato-firmado.pdf', size: 245_000}]);

    return (
        <AttachmentsInput
            label="Documentos del pedido"
            value={attachments}
            onChange={setAttachments}
            // 2. Los topes: tipo, peso de cada uno, cuántos y cuánto entre todos
            accept={['pdf', 'image']}
            maxSize="2 MB"
            maxFiles={5}
            maxTotalSize="5 MB"
            // 3. Quitar uno que ya estaba guardado: aquí se le avisaría a su API
            onRemove={(file: Attachment) => {
                if (!(file instanceof File)) {
                    toastSuccess(`«${file.name}» se borrará del servidor al guardar.`);
                }
            }}
            helperText="PDF o imágenes, hasta 2 MB cada uno."
        />
    );
};

export default AttachmentsDemo;
