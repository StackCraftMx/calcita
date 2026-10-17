// Los ajustes de componentes de MUI del framework (del tema de walk-ot), juntos. Un archivo por componente en
// theme/components/: para cambiar cómo se ve un componente se abre el suyo y nada más.
//
// createToolkitTheme() ya los trae. Un proyecto con su propio createTheme los puede usar sueltos:
//   createTheme({components: {...toolkitComponents(), ...losMios}})
//
// Funciones puras, sin React: function (regla de la casa).
import {MuiAppBar} from '@/theme/components/MuiAppBar.js';
import {MuiBackdrop} from '@/theme/components/MuiBackdrop.js';
import {MuiButton} from '@/theme/components/MuiButton.js';
import {MuiButtonBase} from '@/theme/components/MuiButtonBase.js';
import {MuiChip} from '@/theme/components/MuiChip.js';
import {MuiDataGrid} from '@/theme/components/MuiDataGrid.js';
import {MuiDrawer} from '@/theme/components/MuiDrawer.js';
import {MuiMenuItem} from '@/theme/components/MuiMenuItem.js';
import {MuiTypography} from '@/theme/components/MuiTypography.js';

/**
 * @returns {object} el `components` del tema de MUI
 */
export function toolkitComponents() {
    return {
        ...MuiAppBar(),
        ...MuiBackdrop(),
        ...MuiButton(),
        ...MuiButtonBase(),
        ...MuiChip(),
        ...MuiDataGrid(),
        ...MuiDrawer(),
        ...MuiMenuItem(),
        ...MuiTypography(),
    };
}
