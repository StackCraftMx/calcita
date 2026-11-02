// La ayuda del tablero en carrusel (HelpCarouselDialog del paquete): sale sola la primera vez que se entra a Tareas y se
// vuelve a abrir con el «?» del encabezado. Cada paso con una ilustración (un ícono grande de su color), su título y su texto.
//
// Lo renderiza la app: arrow (regla de la casa).
import Box from '@mui/material/Box';
import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import {HelpCarouselDialog, useToolkitTranslation} from '@stackcraftmx/calcita';

// los pasos: su ícono y el color de su ilustración (los textos van en tasksTexts, help.steps.<key>)
const HELP_STEPS = Object.freeze([
    {key: 'move', Icon: DragIndicatorRoundedIcon, tone: 'primary.main'},
    {key: 'add', Icon: AddCircleOutlineRoundedIcon, tone: 'info.main'},
    {key: 'complete', Icon: TaskAltRoundedIcon, tone: 'success.main'},
    {key: 'icebox', Icon: AcUnitRoundedIcon, tone: 'info.dark'},
]);

/**
 * La ilustración de un paso: su ícono grande en un círculo tenue de su color.
 *
 * @param {{Icon: import('react').ElementType, tone: string}} props
 */
const StepIllustration = ({Icon, tone}) => (
    <Box sx={{width: 112, height: 112, borderRadius: '50%', display: 'grid', placeItems: 'center', color: tone,
        bgcolor: (theme) => `color-mix(in srgb, currentColor 14%, ${theme.palette.background.paper})`}}>
        <Icon sx={{fontSize: 56}} />
    </Box>
);

/**
 * @param {{open: boolean, onClose: Function}} props lo que da useHelpCarousel
 */
export const TasksHelp = ({open, onClose}) => {
    const {t} = useToolkitTranslation('tasks');
    return (
        <HelpCarouselDialog
            open={open}
            onClose={onClose}
            title={t('help.title')}
            steps={HELP_STEPS.map(({key, Icon, tone}) => ({
                title: t(`help.steps.${key}.title`), content: t(`help.steps.${key}.text`), media: <StepIllustration Icon={Icon} tone={tone} />,
            }))}
        />
    );
};
