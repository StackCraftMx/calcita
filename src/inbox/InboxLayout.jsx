// El acomodo de una bandeja tipo correo: las carpetas, la lista y la lectura. En escritorio, tres columnas; en el teléfono,
// una a la vez: las carpetas como pestañas arriba de la lista y, al abrir un mensaje, la lectura con «Regresar».
//
//   <InboxLayout folders={folders} selectedFolderId={folderId} onSelectFolder={setFolderId} toolbar={<Buscar y Redactar />}
//                list={<MessageList … />} detail={<MessageView … />} isDetailOpen={Boolean(selectedId)} onCloseDetail={() => setSelectedId(null)} />
//
// Debajo de las carpetas, las etiquetas del proyecto (labels) con su punto de color, como Gmail; se eligen igual que una
// carpeta. foldersHeader pone algo arriba de las carpetas (un botón «Redactar») y texts cambia cualquier texto.
//
// Escritorio o teléfono se decide con CSS (no con useMediaQuery): así el servidor pinta lo mismo que el navegador.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaInboxLayout con defaultProps y
// styleOverrides de sus partes: labelDot, folder, folderIcon, folderCount, root, folders, foldersHeader, labelsTitle,
// listPane, phoneTabs, phoneTabBadge, listHeader, list, detail, backButton.
//
// Genérico del paquete: function (regla de la casa).
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import {DESKTOP_MEDIA_QUERY, PHONE_MEDIA_QUERY} from '@/appShell/shellSizes.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaInboxLayout)
const THEME_NAME = 'CalcitaInboxLayout';
const InboxLabelDot = piecePart(THEME_NAME, 'LabelDot', Box);
const InboxFolder = piecePart(THEME_NAME, 'Folder', ListItemButton);
const InboxFolderIcon = piecePart(THEME_NAME, 'FolderIcon', ListItemIcon);
const InboxFolderCount = piecePart(THEME_NAME, 'FolderCount', Typography);
const InboxRoot = piecePart(THEME_NAME, 'Root', Box);
const InboxFolders = piecePart(THEME_NAME, 'Folders', Paper);
const InboxFoldersHeader = piecePart(THEME_NAME, 'FoldersHeader', Box);
const InboxLabelsTitle = piecePart(THEME_NAME, 'LabelsTitle', ListSubheader);
const InboxListPane = piecePart(THEME_NAME, 'ListPane', Paper);
const InboxPhoneTabs = piecePart(THEME_NAME, 'PhoneTabs', Tabs);
const InboxPhoneTabBadge = piecePart(THEME_NAME, 'PhoneTabBadge', Badge);
const InboxListHeader = piecePart(THEME_NAME, 'ListHeader', Box);
const InboxList = piecePart(THEME_NAME, 'List', Box);
const InboxDetail = piecePart(THEME_NAME, 'Detail', Paper);
const InboxBackButton = piecePart(THEME_NAME, 'BackButton', Button);

const FOLDERS_WIDTH_PIXELS = 220;
const LIST_WIDTH_PIXELS = 380;
// la bandeja ocupa el alto de la ventana (menos la barra y el encabezado de la página): cada columna desliza por dentro
const DESKTOP_HEIGHT = 'calc(100dvh - 220px)';
const DESKTOP_MIN_HEIGHT_PIXELS = 480;
const LABEL_DOT_PIXELS = 10;

/** Un renglón de carpeta o etiqueta: su ícono (o su punto de color), su nombre y cuántos sin leer. */
function FolderRow({folder, isSelected, onSelect, t}) {
    const {id, label, Icon, color, unreadCount} = folder;
    let icon = null;
    if (Icon) {
        icon = <Icon fontSize="small" />;
    } else if (color) {
        icon = <InboxLabelDot aria-hidden="true" ownSx={{width: LABEL_DOT_PIXELS, height: LABEL_DOT_PIXELS, borderRadius: '50%', bgcolor: `${color}.main`, ml: 0.5}} />;
    }
    return (
        <InboxFolder selected={isSelected} onClick={() => onSelect(id)} ownSx={{borderRadius: 2}}>
            {icon && <InboxFolderIcon ownSx={{minWidth: 36}}>{icon}</InboxFolderIcon>}
            <ListItemText primary={label} />
            {unreadCount > 0 && <InboxFolderCount variant="caption" ownSx={{fontWeight: 700}} aria-label={t('unreadCount', {count: unreadCount})}>{unreadCount}</InboxFolderCount>}
        </InboxFolder>
    );
}

/**
 * @param {object} props
 * @param {Array<{id: string, label: string, Icon?: import('react').ElementType, unreadCount?: number}>} props.folders
 * @param {Array<{id: string, label: string, color?: string, unreadCount?: number}>} [props.labels] las etiquetas, debajo de las
 *     carpetas con su punto de color (un color del tema); su id no debe repetir el de una carpeta
 * @param {string} props.selectedFolderId la carpeta o etiqueta elegida
 * @param {(folderId: string) => void} props.onSelectFolder
 * @param {import('react').ReactNode} [props.toolbar] arriba de la lista (buscar, redactar)
 * @param {import('react').ReactNode} props.list normalmente MessageList
 * @param {import('react').ReactNode} props.detail normalmente MessageView
 * @param {boolean} [props.isDetailOpen] en el teléfono, se ve la lectura en lugar de la lista
 * @param {() => void} [props.onCloseDetail] «Regresar» del teléfono
 * @param {import('react').ReactNode} [props.foldersHeader] arriba de las carpetas en escritorio (un botón «Redactar»)
 * @param {object} [props.texts] los textos que cambian, con la forma de `inbox` en los textos del paquete
 */
export default function InboxLayout(props) {
    // lo que el proyecto puso en su tema (components.CalcitaInboxLayout.defaultProps) y encima lo que llega aquí
    const {
    folders, labels = [], selectedFolderId, onSelectFolder, toolbar, list, detail, isDetailOpen = false, onCloseDetail, foldersHeader, texts,
} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('inbox', texts);

    return (
        <InboxRoot ownSx={{
            display: 'grid', gap: 2,
            [DESKTOP_MEDIA_QUERY]: {
                gridTemplateColumns: `${FOLDERS_WIDTH_PIXELS}px ${LIST_WIDTH_PIXELS}px minmax(0, 1fr)`, height: DESKTOP_HEIGHT, minHeight: DESKTOP_MIN_HEIGHT_PIXELS,
            },
        }}>
            {/* las carpetas: columna en escritorio */}
            <InboxFolders variant="outlined" component="nav" aria-label={t('folders')} ownSx={{p: 1, overflowY: 'auto', borderRadius: 3, [PHONE_MEDIA_QUERY]: {display: 'none'}}}>
                {foldersHeader && <InboxFoldersHeader ownSx={{p: 0.5, pb: 1}}>{foldersHeader}</InboxFoldersHeader>}
                <List disablePadding>
                    {folders.map((folder) => (
                        <FolderRow key={folder.id} folder={folder} isSelected={folder.id === selectedFolderId} onSelect={onSelectFolder} t={t} />
                    ))}
                </List>
                {labels.length > 0 && (
                    <List disablePadding aria-label={t('labels')}
                          subheader={<InboxLabelsTitle disableSticky ownSx={{bgcolor: 'transparent', lineHeight: 2.5, mt: 1}}>{t('labels')}</InboxLabelsTitle>}>
                        {labels.map((label) => (
                            <FolderRow key={label.id} folder={label} isSelected={label.id === selectedFolderId} onSelect={onSelectFolder} t={t} />
                        ))}
                    </List>
                )}
            </InboxFolders>

            {/* la lista, con las carpetas como pestañas en el teléfono */}
            <InboxListPane variant="outlined" ownSx={{display: 'flex', flexDirection: 'column', minHeight: 0, borderRadius: 3, overflow: 'hidden',
                [PHONE_MEDIA_QUERY]: isDetailOpen ? {display: 'none'} : {}}}>
                <InboxPhoneTabs value={selectedFolderId} onChange={(event, folderId) => onSelectFolder(folderId)} variant="scrollable" aria-label={t('folders')}
                      ownSx={{px: 1, [DESKTOP_MEDIA_QUERY]: {display: 'none'}}}>
                    {[...folders, ...labels].map(({id, label, unreadCount}) => (
                        <Tab key={id} value={id} label={unreadCount > 0 ? <InboxPhoneTabBadge color="primary" badgeContent={unreadCount} ownSx={{pr: 1.5}}>{label}</InboxPhoneTabBadge> : label} />
                    ))}
                </InboxPhoneTabs>
                {toolbar && <InboxListHeader ownSx={{p: 1.5, pb: 1}}>{toolbar}</InboxListHeader>}
                <InboxList ownSx={{flex: 1, minHeight: 0, overflowY: 'auto', px: 1, pb: 1}}>{list}</InboxList>
            </InboxListPane>

            {/* la lectura: en el teléfono solo con un mensaje abierto, con su «Regresar» */}
            <InboxDetail variant="outlined" ownSx={{p: {xs: 2, md: 3}, overflowY: 'auto', borderRadius: 3, [PHONE_MEDIA_QUERY]: isDetailOpen ? {} : {display: 'none'}}}>
                {onCloseDetail && (
                    <InboxBackButton startIcon={<ArrowBackRoundedIcon />} onClick={onCloseDetail} ownSx={{mb: 1, [DESKTOP_MEDIA_QUERY]: {display: 'none'}}}>{t('back')}</InboxBackButton>
                )}
                {detail}
            </InboxDetail>
        </InboxRoot>
    );
}
