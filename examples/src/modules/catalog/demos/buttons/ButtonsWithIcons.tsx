import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// el ícono ayuda a reconocer la acción; el texto dice exactamente qué hace
const ButtonsWithIcons = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>{t('samples.download')}</Button>
            <Button variant="contained" endIcon={<SendIcon />}>{t('samples.send')}</Button>
            <Button variant="outlined" color="error" startIcon={<DeleteOutlineIcon />}>{t('samples.delete')}</Button>
        </Stack>
    );
};

export default ButtonsWithIcons;
