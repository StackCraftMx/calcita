import {useState} from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import BrightnessLowIcon from '@mui/icons-material/BrightnessLow';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// de 0 a 100 de 10 en 10, con marca en cada 25 (Apple: no hace falta etiquetar cada marca)
const SLIDER_STEP = 10;
const SLIDER_MARKS = [0, 25, 50, 75, 100].map((value) => ({value, label: `${value}`}));
const SLIDER_WIDTH = 240;

const Sliders = () => {
    const {t} = useToolkitTranslation('catalog');
    const [brightness, setBrightness] = useState(60);
    const [priceRange, setPriceRange] = useState([20, 70]);

    return (
        <Stack direction="row" spacing={4} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center', '& > *': {width: SLIDER_WIDTH}}}>
            {/* los íconos de los extremos dicen qué pasa al mover (menos y más brillo) */}
            <Stack direction="row" spacing={1.5} sx={{alignItems: 'center'}}>
                <BrightnessLowIcon aria-hidden fontSize="small" />
                <Slider value={brightness} onChange={(event, value) => setBrightness(value as number)} valueLabelDisplay="auto"
                        aria-label={t('selection.slider.brightness')} />
                <BrightnessHighIcon aria-hidden fontSize="small" />
            </Stack>
            <Box sx={{px: 1}}>
                <Slider defaultValue={50} step={SLIDER_STEP} marks={SLIDER_MARKS} valueLabelDisplay="auto" aria-label={t('selection.slider.discount')} />
            </Box>
            <Box sx={{px: 1}}>
                <Slider value={priceRange} onChange={(event, value) => setPriceRange(value as number[])} valueLabelDisplay="auto"
                        getAriaLabel={(index) => t(index === 0 ? 'selection.slider.from' : 'selection.slider.to')} />
            </Box>
            <Box sx={{px: 1}}>
                <Slider defaultValue={30} disabled aria-label={t('states.disabled')} />
            </Box>
        </Stack>
    );
};

export default Sliders;
