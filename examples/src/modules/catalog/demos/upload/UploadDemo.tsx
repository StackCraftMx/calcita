// Subir un archivo: FileDropzone revisa el tipo y el peso ANTES de subir (lo que no cumple se avisa sin viajar) y
// uploadWithProgress lo manda con su avance (fetch no da el avance de subida; este usa XMLHttpRequest). Mientras sube, la
// zona queda con candado. Abajo, «Subirlo a su API», la llamada real.
import {useState} from 'react';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import {FileDropzone, toastSuccess} from '@stackcraftmx/calcita';

// ─── El servidor de mentira (en su proyecto NO va: es uploadWithProgress, abajo) ───
const fakeUpload = async (file: File, onProgress: (percent: number) => void) => {
    for (let percent = 10; percent <= 100; percent += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        onProgress(percent);
    }
    return {message: `Se recibió «${file.name}».`};
};

const UploadDemo = () => {
    const [file, setFile] = useState<File | null>(null);
    const [percent, setPercent] = useState<number | null>(null);

    // 2. Al picar «Subir»: el avance y, al terminar, el aviso. En su proyecto es uploadInventory (sección 2)
    const upload = async () => {
        if (!file) {
            return;
        }
        setPercent(0);
        const response = await fakeUpload(file, setPercent);
        toastSuccess(response.message);
        setPercent(null);
        setFile(null);
    };

    return (
        <Stack spacing={2} sx={{maxWidth: 520}}>
            {/* 1. La zona: qué acepta y cuánto pesa como máximo; lo que no cumple se explica sin subirlo */}
            <FileDropzone value={file} onChange={setFile} accept={['excel', 'csv']} maxSize="5 MB" busy={percent !== null}
                          hint="Arrastre aquí el inventario (Excel o CSV, hasta 5 MB)" />
            {percent !== null && <LinearProgress variant="determinate" value={percent} />}
            <Button variant="contained" disabled={!file || percent !== null} onClick={upload} sx={{alignSelf: 'flex-start'}}>Subir</Button>
        </Stack>
    );
};

export default UploadDemo;
