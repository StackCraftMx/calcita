// Aceptar los términos antes de seguir: hay que leerlos hasta el final para poder marcar «He leído y acepto». onAccept manda al
// API quién aceptó qué versión (si truena, la ventana enseña el motivo y deja intentar otra vez); «No acepto» es la otra
// salida. Escape o un clic afuera no la cierran: es una decisión.
import {useState} from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {TermsAcceptanceDialog, toastSuccess} from '@stackcraftmx/calcita';

// ─── El servidor de mentira (en su proyecto NO va: es su POST de aceptación) ───
const saveAcceptance = async (version: string) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return {version, acceptedAt: new Date().toISOString()};
};

const TermsDemo = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button variant="outlined" onClick={() => setIsOpen(true)}>Ver los términos</Button>
            <TermsAcceptanceDialog
                open={isOpen}
                version="2026-11"
                onAccept={async ({version}) => {
                    await saveAcceptance(version);
                    setIsOpen(false);
                    toastSuccess(`Quedó registrada la versión ${version}.`);
                }}
                onDecline={() => setIsOpen(false)}
            >
                <Stack spacing={2}>
                    {Array.from({length: 8}, (unused, index) => (
                        <Typography key={index} variant="body2">
                            {index + 1}. Cláusula de ejemplo: el texto de sus términos va aquí, párrafo por párrafo, con la versión que
                            el servidor dice que está vigente.
                        </Typography>
                    ))}
                </Stack>
            </TermsAcceptanceDialog>
        </>
    );
};

export default TermsDemo;
