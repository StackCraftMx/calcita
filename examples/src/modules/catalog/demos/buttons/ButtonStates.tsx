import {useState} from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import SaveIcon from '@mui/icons-material/Save';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// lo que tardaría el servidor en guardar (milisegundos)
const SAVING_MILLISECONDS = 2000;

const ButtonStates = () => {
    const {t} = useToolkitTranslation('catalog');
    const [isSaving, setIsSaving] = useState(false);

    const save = () => {
        setIsSaving(true);
        window.setTimeout(() => setIsSaving(false), SAVING_MILLISECONDS);
    };

    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
            <Button variant="contained" disabled>{t('states.disabled')}</Button>
            <Button variant="outlined" disabled>{t('states.disabled')}</Button>
            {/* mientras guarda, el botón se queda con su ancho y avisa que está esperando */}
            <Button variant="contained" loading={isSaving} loadingPosition="start" startIcon={<SaveIcon />} onClick={save}>
                {isSaving ? t('samples.saving') : t('samples.save')}
            </Button>
        </Stack>
    );
};

export default ButtonStates;
