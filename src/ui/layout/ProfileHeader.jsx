// El encabezado de una persona («Mi perfil», el detalle de un usuario): una franja de color arriba, el avatar grande
// (su foto o sus iniciales) montado sobre la franja, el nombre, el correo, sus perfiles como etiquetas y, a la derecha,
// las acciones (editar, desactivar…). Como el de las plantillas de tablero de MUI.
//
// En el teléfono las acciones bajan debajo del nombre. El nombre es el título de la página (h1) y sube a la barra al
// deslizar, como el de PageHeading.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaProfileHeader con defaultProps y
// styleOverrides de sus partes: root, cover, body, avatar, text, name, chips, actions.
//
// Genérico del paquete: function (regla de la casa). No sabe de negocio: todo llega ya traducido.
import {useRef} from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {initialsOf} from '@/appShell/menuItemText.js';
import {useRegisterPageTitle} from '@/appShell/pageTitle.jsx';
import {paletteOf} from '@/theme/components/paletteOf.js';
import DocumentTitle from '@/ui/navigation/DocumentTitle.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaProfileHeader)
const THEME_NAME = 'CalcitaProfileHeader';
const ProfileRoot = piecePart(THEME_NAME, 'Root', Paper);
const ProfileCover = piecePart(THEME_NAME, 'Cover', Box);
const ProfileBody = piecePart(THEME_NAME, 'Body', Stack);
const ProfileAvatar = piecePart(THEME_NAME, 'Avatar', Avatar);
const ProfileText = piecePart(THEME_NAME, 'Text', Box);
const ProfileName = piecePart(THEME_NAME, 'Name', Typography);
const ProfileChips = piecePart(THEME_NAME, 'Chips', Stack);
const ProfileActions = piecePart(THEME_NAME, 'Actions', Stack);

// la franja de arriba y el avatar que se monta en ella (la mitad del avatar sobre la franja)
const COVER_HEIGHT_PIXELS = 112;
const AVATAR_SIZE_PIXELS = 96;
const AVATAR_BORDER_PIXELS = 4;

/**
 * La franja de color: el principal del tema, más oscuro hacia la derecha, con un brillo suave.
 *
 * @param {object} theme
 * @returns {object}
 */
const coverOf = (theme) => {
    const palette = paletteOf(theme);
    return {
        height: COVER_HEIGHT_PIXELS,
        backgroundColor: palette.primary.main,
        backgroundImage: `radial-gradient(80% 140% at 85% 0%, color-mix(in srgb, ${palette.primary.light} 70%, transparent), transparent 60%), `
            + `linear-gradient(120deg, ${palette.primary.main}, ${palette.primary.dark})`,
    };
};

/**
 * @param {object} props
 * @param {string} props.name el nombre de la persona
 * @param {string} [props.email]
 * @param {string} [props.subtitle] el renglón de abajo (puesto · sucursal)
 * @param {string} [props.avatarUrl] su foto; sin ella, sus iniciales
 * @param {string[]} [props.chips] sus perfiles o etiquetas, ya traducidos
 * @param {import('react').ReactNode} [props.actions] los botones de la derecha
 */
export default function ProfileHeader(props) {
    // lo que el proyecto puso en su tema (components.CalcitaProfileHeader.defaultProps) y encima lo que llega aquí
    const {name, email, subtitle, avatarUrl, chips = [], actions} = usePieceProps(props, THEME_NAME);
    const titleRef = useRef(null);
    useRegisterPageTitle(name, titleRef);

    return (
        <ProfileRoot variant="outlined" ownSx={{overflow: 'hidden', mb: 3}}>
            <DocumentTitle title={name} />
            <ProfileCover ownSx={coverOf} />
            <ProfileBody direction={{xs: 'column', sm: 'row'}} spacing={2} ownSx={{px: {xs: 2, md: 3}, pb: 2.5, alignItems: {sm: 'flex-end'}}}>
                <ProfileAvatar src={avatarUrl} alt={name}
                        ownSx={{
                            width: AVATAR_SIZE_PIXELS, height: AVATAR_SIZE_PIXELS, mt: `-${AVATAR_SIZE_PIXELS / 2}px`, fontSize: '2rem', fontWeight: 600,
                            border: `${AVATAR_BORDER_PIXELS}px solid`, borderColor: 'background.paper', bgcolor: 'secondary.main', color: 'secondary.contrastText',
                        }}>
                    {initialsOf(name)}
                </ProfileAvatar>
                <ProfileText ownSx={{flexGrow: 1, minWidth: 0}}>
                    <ProfileName ref={titleRef} variant="h5" component="h1" ownSx={{fontWeight: 600}}>{name}</ProfileName>
                    {email && <Typography variant="body2" color="text.secondary">{email}</Typography>}
                    {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
                    {chips.length > 0 && (
                        <ProfileChips direction="row" spacing={1} useFlexGap ownSx={{flexWrap: 'wrap', mt: 1}}>
                            {chips.map((chip) => <Chip key={chip} label={chip} size="small" color="primary" variant="outlined" />)}
                        </ProfileChips>
                    )}
                </ProfileText>
                {actions && <ProfileActions direction="row" spacing={1} useFlexGap ownSx={{flexWrap: 'wrap', flexShrink: 0}}>{actions}</ProfileActions>}
            </ProfileBody>
        </ProfileRoot>
    );
}
