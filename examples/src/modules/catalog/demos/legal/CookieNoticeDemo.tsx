// El aviso de cookies: sale abajo hasta que la persona acepta ESA versión en este navegador (al subir la versión vuelve a
// salir). Aquí, con su propia llave para no tocar el de la app, y un botón para volver a enseñarlo.
import {useState} from 'react';
import Button from '@mui/material/Button';
import {CookieNotice, toastSuccess} from '@stackcraftmx/calcita';

// la llave de este ejemplo: en su proyecto, una con el nombre de su app
const DEMO_STORAGE_KEY = 'calcita-examples:cookieConsentDemo';

const CookieNoticeDemo = () => {
    // cambiar la llave del componente lo vuelve a pintar desde cero (lee otra vez lo guardado)
    const [round, setRound] = useState(0);

    return (
        <>
            <Button variant="outlined" onClick={() => {
                localStorage.removeItem(DEMO_STORAGE_KEY);
                setRound((current) => current + 1);
            }}>
                Volver a enseñar el aviso
            </Button>
            <CookieNotice key={round} version="2026-11" storageKey={DEMO_STORAGE_KEY} policyHref="https://www.example.com/cookies"
                          onAccept={({version}) => toastSuccess(`Aceptó la versión ${version}.`)} />
        </>
    );
};

export default CookieNoticeDemo;
