// La cuenta de quien está dentro, arriba a la derecha (como en las plantillas de MUI): un avatar con sus iniciales (o su
// foto) que abre un menú con su nombre y correo, Mi perfil, lo que el proyecto agregue (accountMenuItems: Facturación,
// Mis llaves…) y Salir.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaAccountMenu con defaultProps y
// styleOverrides de sus partes: button, avatar, header, name, settings.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
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

import {initialsOf} from '@/appShell/menuItemText.js';
import {barMenuPlacementOf} from '@/appShell/barMenuPlacement.js';
import MenuLinks from '@/appShell/MenuLinks.jsx';
import {MONOGRAM_GRAY, WHITE_LABEL} from '@/theme/components/glassComponents.js';
import {isGlassTheme} from '@/theme/glassSurface.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaAccountMenu)
const THEME_NAME = 'CalcitaAccountMenu';
const AccountButton = piecePart(THEME_NAME, 'Button', IconButton);
const AccountAvatar = piecePart(THEME_NAME, 'Avatar', Avatar);
const AccountHeader = piecePart(THEME_NAME, 'Header', Box);
const AccountName = piecePart(THEME_NAME, 'Name', Typography);
const AccountSettings = piecePart(THEME_NAME, 'Settings', Box);

/**
 * @param {object} props
 * @param {{name: string, email?: string, subtitle?: string, avatarUrl?: string}} props.user
 * @param {string} [props.profilePath] sin ella no sale «Mi perfil»
 * @param {Array<{to?: string, onClick?: Function, label?: string, labelKey?: string, Icon?: import('react').ElementType}>} [props.accountMenuItems]
 * @param {() => void} [props.onSignOut] sin él no sale «Salir»
 * @param {boolean} [props.isSigningOut]
 * @param {import('react').ReactNode} [props.settings] los ajustes de la app, entre los datos de la persona y sus ligas
 */
export default function AccountMenu(props) {
    // lo que el proyecto puso en su tema (components.CalcitaAccountMenu.defaultProps) y encima lo que llega aquí
    const {user, profilePath, accountMenuItems = [], onSignOut, isSigningOut = false, settings, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('layout');
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
                <AccountButton size="small" aria-label={t('account.open')} aria-haspopup="menu" onClick={(event) => setAnchorElement(event.currentTarget)} ownSx={{p: 0.5}}>
                    <AccountAvatar src={user.avatarUrl} alt="" ownSx={(theme) => ({
                        width: 32, height: 32, fontSize: '0.875rem', bgcolor: 'secondary.main', color: 'secondary.contrastText',
                        // con vidrio, en oscuro el monograma de Apple (gris oscuro con letra blanca), el que se aprobó. Antes lo
                        // ponía el tema porque su regla de oscuro le ganaba a este sx; ahora el sx gana en los dos modos
                        ...(isGlassTheme(theme) && theme.applyStyles('dark', {bgcolor: MONOGRAM_GRAY.dark, color: WHITE_LABEL})),
                    })}>
                        {initialsOf(user.name)}
                    </AccountAvatar>
                </AccountButton>
            </Tooltip>
            <Menu anchorEl={anchorElement} open={Boolean(anchorElement)} onClose={closeMenu}
                  anchorOrigin={placement.anchorOrigin} transformOrigin={placement.transformOrigin}
                  slotProps={{paper: {sx: {minWidth: settings ? 300 : 240, maxWidth: 360, ...placement.gapSx}}}}>
                <AccountHeader ownSx={{px: 2, py: 1.25}}>
                    <AccountName variant="subtitle2" noWrap ownSx={{fontWeight: 600}}>{user.name}</AccountName>
                    {user.email && <Typography variant="body2" color="text.secondary" noWrap>{user.email}</Typography>}
                    {user.subtitle && <Typography variant="caption" color="text.secondary" component="p" noWrap>{user.subtitle}</Typography>}
                </AccountHeader>
                {/* los ajustes de la app (letra, idioma, claro u oscuro y los del proyecto): en la cuenta y no sueltos en la barra */}
                {settings && <Divider />}
                {settings && <AccountSettings ownSx={{py: 0.5}}>{settings}</AccountSettings>}
                {menuLinks.length > 0 && <Divider />}
                <MenuLinks links={menuLinks} onClose={closeMenu} />
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
