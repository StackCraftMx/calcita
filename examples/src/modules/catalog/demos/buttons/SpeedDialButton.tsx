import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// lo justo para que las acciones se abran a la derecha sin taparse (px)
const SPEED_DIAL_BOX_HEIGHT = 96;

const SPEED_DIAL_ACTIONS = [
    {key: 'copy', Icon: ContentCopyIcon},
    {key: 'save', Icon: SaveIcon},
    {key: 'share', Icon: ShareIcon},
] as const;

const SpeedDialButton = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Box sx={{position: 'relative', height: SPEED_DIAL_BOX_HEIGHT}}>
            <SpeedDial ariaLabel={t('buttons.speedDial.ariaLabel')} direction="right" icon={<SpeedDialIcon />}
                       sx={{position: 'absolute', left: 0, top: 0}}>
                {SPEED_DIAL_ACTIONS.map(({key, Icon}) => (
                    <SpeedDialAction key={key} icon={<Icon />} slotProps={{tooltip: {title: t(`samples.${key}`)}}} />
                ))}
            </SpeedDial>
        </Box>
    );
};

export default SpeedDialButton;
