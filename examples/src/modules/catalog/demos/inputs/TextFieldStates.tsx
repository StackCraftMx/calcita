import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const FIELD_WIDTH = 240;

const TextFieldStates = () => {
    const {t} = useToolkitTranslation('catalog');
    const fieldSx = {width: FIELD_WIDTH};
    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'flex-start'}}>
            <TextField label={t('samples.email')} helperText={t('inputs.states.helperText')} sx={fieldSx} />
            {/* el error dice qué falta, no solo que algo está mal */}
            <TextField label={t('samples.email')} defaultValue="ana@" error helperText={t('inputs.states.errorText')} sx={fieldSx} />
            <TextField label={t('states.required')} required sx={fieldSx} />
            <TextField label={t('states.disabled')} defaultValue={t('samples.personName')} disabled sx={fieldSx} />
            <TextField label={t('states.readOnly')} defaultValue="P-2375" slotProps={{htmlInput: {readOnly: true}}} sx={fieldSx} />
            <TextField label={t('sizes.small')} size="small" sx={fieldSx} />
        </Stack>
    );
};

export default TextFieldStates;
