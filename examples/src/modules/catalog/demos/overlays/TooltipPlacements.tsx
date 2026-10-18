import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const PLACEMENTS = ['top', 'right', 'bottom', 'left'] as const;

// el globo explica; lo que hace el botón lo dice su texto
const TooltipPlacements = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap'}}>
            {PLACEMENTS.map((placement) => (
                <Tooltip key={placement} title={t('overlays.tooltips.sample')} placement={placement}>
                    <Button variant="text">{t(`overlays.tooltips.placements.${placement}`)}</Button>
                </Tooltip>
            ))}
            <Tooltip title={t('overlays.tooltips.sample')} arrow>
                <Button variant="text">{t('overlays.tooltips.arrow')}</Button>
            </Tooltip>
        </Stack>
    );
};

export default TooltipPlacements;
