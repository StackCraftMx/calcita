// Las ligas propias de la app en el menú de la cuenta o en el del engrane (accountMenuItems): Mi perfil, Facturación,
// «Regresar al sistema»… Una liga de la app (to) navega con el router; una de otro sistema (href) es una dirección normal;
// sin ninguna de las dos, solo hace lo suyo (onClick). El ícono es un componente (Icon) o uno ya pintado (icon).
//
// Una sola pieza para los dos menús: sin sesión las ligas siguen a la mano detrás del engrane (en un sistema que ya existía,
// «Regresar» se perdía porque solo lo pintaba la cuenta).
//
// Genérico del paquete: function (regla de la casa).
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';

import {menuItemLabelOf} from '@/appShell/menuItemText.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {object} props
 * @param {Array<{to?: string, href?: string, onClick?: Function, label?: string, labelKey?: string, Icon?: import('react').ElementType, icon?: import('react').ReactNode}>} props.links
 * @param {() => void} props.onClose cierra el menú al elegir
 */
export default function MenuLinks({links, onClose, ...unknownProps}) {
    warnUnknownProps('MenuLinks', unknownProps);
    const {t} = useToolkitTranslation('layout');
    const {Link: RouterLink} = useToolkitNavigation();
    return links.map((menuLink) => {
        const Icon = menuLink.Icon;
        const linkProps = menuLink.to ? {component: RouterLink, to: menuLink.to} : menuLink.href ? {component: 'a', href: menuLink.href} : {};
        const label = menuItemLabelOf(menuLink, t);
        return (
            <MenuItem key={menuLink.to ?? menuLink.href ?? label} {...linkProps}
                      onClick={() => {
                          onClose();
                          menuLink.onClick?.();
                      }}>
                {(Icon || menuLink.icon) && <ListItemIcon>{Icon ? <Icon fontSize="small" /> : menuLink.icon}</ListItemIcon>}
                <ListItemText primary={label} />
            </MenuItem>
        );
    });
}
