// La cuenta de quien está dentro, arriba a la derecha (como en las plantillas de MUI): un avatar con sus iniciales (o su
// foto) que abre un menú con su nombre y correo, Mi perfil, lo que el proyecto agregue (accountMenuItems: Facturación,
// Mis llaves…) y Salir.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import {initialsOf, menuItemLabelOf} from '@/appShell/menuItemText.js';
import {barMenuPlacementOf} from '@/appShell/barMenuPlacement.js';

/**
 * @param {object} props
 * @param {{name: string, email?: string, subtitle?: string, avatarUrl?: string}} props.user
 * @param {string} [props.profilePath] sin ella no sale «Mi perfil»
 * @param {Array<{to?: string, onClick?: Function, label?: string, labelKey?: string, Icon?: import('react').ElementType}>} [props.accountMenuItems]
 * @param {() => void} [props.onSignOut] sin él no sale «Salir»
 * @param {boolean} [props.isSigningOut]
 * @param {import('react').ReactNode} [props.settings] los ajustes de la app, entre los datos de la persona y sus ligas
 */
export default function AccountMenu({user, profilePath, accountMenuItems = [], onSignOut, isSigningOut = false, settings}) {
    const {t} = useToolkitTranslation('layout');
    const {Link: RouterLink} = useToolkitNavigation();
    const [anchorElement, setAnchorElement] = useState(null);
    const closeMenu = () => setAnchorElement(null);
    const menuLinks = [
        ...(profilePath ? [{to: profilePath, labelKey: 'layout:account.myProfile', Icon: PersonOutlineIcon}] : []),
        ...accountMenuItems,
    ];

    // hacia arriba si la barra está abajo (teléfono con vidrio)
    const placement = barMenuPlacementOf(anchorElement);

    const signOut = () => {
        closeMenu();
        onSignOut();
    };

    return (
        <>
            <Tooltip title={t('account.open')}>
                <IconButton size="small" aria-label={t('account.open')} aria-haspopup="menu" onClick={(event) => setAnchorElement(event.currentTarget)} sx={{p: 0.5}}>
                    <Avatar src={user.avatarUrl} alt="" sx={{width: 32, height: 32, fontSize: '0.875rem', bgcolor: 'secondary.main', color: 'secondary.contrastText'}}>
                        {initialsOf(user.name)}
                    </Avatar>
                </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorElement} open={Boolean(anchorElement)} onClose={closeMenu}
                  anchorOrigin={placement.anchorOrigin} transformOrigin={placement.transformOrigin}
                  slotProps={{paper: {sx: {minWidth: settings ? 300 : 240, maxWidth: 360, ...placement.gapSx}}}}>
                <Box sx={{px: 2, py: 1.25}}>
                    <Typography variant="subtitle2" noWrap sx={{fontWeight: 600}}>{user.name}</Typography>
                    {user.email && <Typography variant="body2" color="text.secondary" noWrap>{user.email}</Typography>}
                    {user.subtitle && <Typography variant="caption" color="text.secondary" component="p" noWrap>{user.subtitle}</Typography>}
                </Box>
                {/* los ajustes de la app (letra, idioma, claro u oscuro y los del proyecto): en la cuenta y no sueltos en la barra */}
                {settings && <Divider />}
                {settings && <Box sx={{py: 0.5}}>{settings}</Box>}
                {menuLinks.length > 0 && <Divider />}
                {menuLinks.map((menuLink) => {
                    const Icon = menuLink.Icon;
                    const linkProps = menuLink.to ? {component: RouterLink, to: menuLink.to} : {};
                    return (
                        <MenuItem key={menuLink.to ?? menuItemLabelOf(menuLink, t)} {...linkProps}
                                  onClick={() => {
                                      closeMenu();
                                      menuLink.onClick?.();
                                  }}>
                            {Icon && <ListItemIcon><Icon fontSize="small" /></ListItemIcon>}
                            <ListItemText primary={menuItemLabelOf(menuLink, t)} />
                        </MenuItem>
                    );
                })}
                {onSignOut && <Divider />}
                {onSignOut && (
                    <MenuItem onClick={signOut} disabled={isSigningOut}>
                        <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary={t('signOut')} />
                    </MenuItem>
                )}
            </Menu>
        </>
    );
}
