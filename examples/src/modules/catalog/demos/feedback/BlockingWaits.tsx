import {useState} from 'react';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {ModalWaiting, useToolkitTranslation} from '@stackcraftmx/calcita';

// lo que dura la espera de ejemplo (milisegundos)
const WAITING_MILLISECONDS = 2000;

// para lo que no se puede interrumpir: tapa la pantalla mientras termina
const BlockingWaits = () => {
    const {t} = useToolkitTranslation('catalog');
    const [isBackdropOpen, setIsBackdropOpen] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);

    const wait = () => {
        setIsWaiting(true);
        window.setTimeout(() => setIsWaiting(false), WAITING_MILLISECONDS);
    };

    return (
        <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap'}}>
            <Button variant="outlined" onClick={() => setIsBackdropOpen(true)}>{t('feedback.blocking.backdrop')}</Button>
            <Button variant="outlined" onClick={wait}>{t('feedback.blocking.waiting')}</Button>
            <Backdrop open={isBackdropOpen} onClick={() => setIsBackdropOpen(false)}
                      sx={(theme) => ({zIndex: theme.zIndex.drawer + 2, color: 'common.white'})}>
                <Stack spacing={2} sx={{alignItems: 'center'}}>
                    <CircularProgress color="inherit" aria-label={t('feedback.progress.loading')} />
                    <Typography>{t('feedback.blocking.closeHint')}</Typography>
                </Stack>
            </Backdrop>
            <ModalWaiting open={isWaiting} />
        </Stack>
    );
};

export default BlockingWaits;
