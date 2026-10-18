// El encabezado de una pantalla al estilo de las plantillas de MUI (y del PageContainer de walk-ot): las migas arriba, el
// título a la izquierda con los botones a la derecha, y una descripción corta abajo.
//
// Las migas salen SOLAS del menú de AppLayout (Inicio › Sección › Pantalla): la página no las escribe. Una pantalla que
// no está en el menú (un detalle) pasa las suyas con `breadcrumbs`; breadcrumbs={false} las quita.
// El título sube a la barra de AppLayout cuando sale de la vista al deslizar, y también es el título de la pestaña.
// Con la barra en cápsulas, sus `actions` van a la barra en su propia cápsula (BarActions), como las barras de
// herramientas de macOS; en el teléfono, y con la franja, se quedan aquí (con la franja, para no mover pantallas que ya
// existen: quien las quiera en la franja usa BarActions).
//
// Cuál usar: PageHeading en las pantallas de trabajo (listas, formularios, tableros); PageHeader (centrado) en una
// portada; DetailHeader en el detalle de un registro (título con sus insignias de estatus).
//
// Genérico del paquete: function (regla de la casa).
import {useRef} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {useAppMenu} from '@/appShell/appMenuContext.js';
import BarActions from '@/appShell/BarActions.jsx';
import {useBarActionsSlot} from '@/appShell/barActionsSlot.js';
import {menuItemLabelOf} from '@/appShell/menuItemText.js';
import {useRegisterPageTitle} from '@/appShell/pageTitle.jsx';
import {menuBreadcrumbsOf} from '@/navigation/appMenu.js';
import PageBreadcrumbs from '@/ui/navigation/PageBreadcrumbs.jsx';
import DocumentTitle from '@/ui/navigation/DocumentTitle.jsx';

// con una sola miga (estar en el inicio) no se pintan: no dicen nada
const MIN_BREADCRUMBS = 2;

/**
 * @param {object} props
 * @param {string} props.title texto ya traducido
 * @param {import('react').ReactNode} [props.description]
 * @param {Array<{label: string, to?: string}>|false} [props.breadcrumbs] por omisión, las del menú
 * @param {import('react').ReactNode} [props.actions] botones a la derecha (en el teléfono, abajo y a lo ancho)
 * @param {string} [props.documentTitle] título de la pestaña si difiere del visible
 */
export default function PageHeading({title, description, breadcrumbs, actions, documentTitle}) {
    const {t} = useToolkitTranslation('layout');
    const {useLocation} = useToolkitNavigation();
    const {pathname} = useLocation();
    const {menuItems} = useAppMenu();
    const titleRef = useRef(null);
    useRegisterPageTitle(title, titleRef);
    const {usesCapsules} = useBarActionsSlot();
    // sin cápsulas: a la derecha del título y, en el teléfono, abajo y a lo ancho
    const inlineActionsSx = {display: 'flex', gap: 1, flexWrap: 'wrap', flex: {xs: '1 1 auto', sm: '0 0 auto'}, '& > .MuiButton-root': {width: {xs: '100%', sm: 'auto'}}};
    // con cápsulas suben a la barra (escritorio) o flotan arriba (teléfono). Si no hay dónde (la barra fundida al menú), la
    // cápsula de solo íconos se queda a la derecha del título, en el mismo renglón; el título se parte si no cabe
    const isActionsCapsule = Boolean(actions) && usesCapsules;

    const crumbs = breadcrumbs === false
        ? []
        : breadcrumbs ?? menuBreadcrumbsOf(menuItems, pathname).map((menuItem) => ({label: menuItemLabelOf(menuItem, t), to: menuItem.to}));

    return (
        <Box component="header" sx={{mb: 3}}>
            <DocumentTitle title={documentTitle ?? title} />
            {crumbs.length >= MIN_BREADCRUMBS && <Box sx={{mb: 1}}><PageBreadcrumbs items={crumbs} /></Box>}
            <Stack direction={isActionsCapsule ? 'row' : {xs: 'column', sm: 'row'}} spacing={{xs: 1.5, sm: 2}}
                   sx={{alignItems: isActionsCapsule ? 'flex-start' : {xs: 'stretch', sm: 'flex-start'}, justifyContent: 'space-between'}}>
                <Typography ref={titleRef} variant="h4" component="h1" sx={{minWidth: 0}}>{title}</Typography>
                {isActionsCapsule && <BarActions label={title} inlineSx={{flexShrink: 0}}>{actions}</BarActions>}
                {actions && !usesCapsules && <Box sx={inlineActionsSx}>{actions}</Box>}
            </Stack>
            {description && (
                <Typography variant="body1" color="text.secondary" component="div" sx={{mt: 0.75, maxWidth: 760}}>{description}</Typography>
            )}
        </Box>
    );
}
