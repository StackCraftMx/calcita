import {useState} from 'react';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const ALIGNMENTS = [
    {value: 'left', Icon: FormatAlignLeftIcon},
    {value: 'center', Icon: FormatAlignCenterIcon},
    {value: 'right', Icon: FormatAlignRightIcon},
];
const FORMATS = [
    {value: 'bold', Icon: FormatBoldIcon},
    {value: 'italic', Icon: FormatItalicIcon},
    {value: 'underline', Icon: FormatUnderlinedIcon},
];
const PERIODS = ['day', 'week', 'month'];

const ToggleButtons = () => {
    const {t} = useToolkitTranslation('catalog');
    const [alignment, setAlignment] = useState('left');
    const [formats, setFormats] = useState<string[]>(['bold']);
    const [period, setPeriod] = useState('week');

    // en los de una sola elección, un clic en la elegida manda null: se queda la que estaba
    return (
        <Stack direction="row" spacing={3} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'flex-start'}}>
            <ToggleButtonGroup exclusive value={alignment} onChange={(event, value) => value && setAlignment(value)} aria-label={t('selection.toggle.alignment')}>
                {ALIGNMENTS.map(({value, Icon}) => (
                    <ToggleButton key={value} value={value} aria-label={t(`selection.toggle.align.${value}`)}><Icon /></ToggleButton>
                ))}
            </ToggleButtonGroup>
            <ToggleButtonGroup value={formats} onChange={(event, value) => setFormats(value)} aria-label={t('selection.toggle.format')}>
                {FORMATS.map(({value, Icon}) => (
                    <ToggleButton key={value} value={value} aria-label={t(`selection.toggle.formats.${value}`)}><Icon /></ToggleButton>
                ))}
            </ToggleButtonGroup>
            <ToggleButtonGroup exclusive size="small" value={period} onChange={(event, value) => value && setPeriod(value)} aria-label={t('selection.toggle.period')}>
                {PERIODS.map((value) => <ToggleButton key={value} value={value}>{t(`selection.periods.${value}`)}</ToggleButton>)}
            </ToggleButtonGroup>
            <ToggleButtonGroup exclusive orientation="vertical" value={alignment} onChange={(event, value) => value && setAlignment(value)}
                               aria-label={t('selection.toggle.alignment')}>
                {ALIGNMENTS.map(({value, Icon}) => (
                    <ToggleButton key={value} value={value} aria-label={t(`selection.toggle.align.${value}`)}><Icon /></ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Stack>
    );
};

export default ToggleButtons;
