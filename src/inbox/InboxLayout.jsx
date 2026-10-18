// El acomodo de una bandeja tipo correo: las carpetas, la lista y la lectura. En escritorio, tres columnas; en el teléfono,
// una a la vez: las carpetas como pestañas arriba de la lista y, al abrir un mensaje, la lectura con «Regresar».
//
//   <InboxLayout folders={folders} selectedFolderId={folderId} onSelectFolder={setFolderId} toolbar={<Buscar y Redactar />}
//                list={<MessageList … />} detail={<MessageView … />} isDetailOpen={Boolean(selectedId)} onCloseDetail={() => setSelectedId(null)} />
//
// Escritorio o teléfono se decide con CSS (no con useMediaQuery): así el servidor pinta lo mismo que el navegador.
//
// Genérico del paquete: function (regla de la casa).
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import {DESKTOP_MEDIA_QUERY, PHONE_MEDIA_QUERY} from '@/appShell/shellSizes.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

const FOLDERS_WIDTH_PIXELS = 220;
const LIST_WIDTH_PIXELS = 380;
// la bandeja ocupa el alto de la ventana (menos la barra y el encabezado de la página): cada columna desliza por dentro
const DESKTOP_HEIGHT = 'calc(100dvh - 220px)';
const DESKTOP_MIN_HEIGHT_PIXELS = 480;

/**
 * @param {object} props
 * @param {Array<{id: string, label: string, Icon?: import('react').ElementType, unreadCount?: number}>} props.folders
 * @param {string} props.selectedFolderId
 * @param {(folderId: string) => void} props.onSelectFolder
 * @param {import('react').ReactNode} [props.toolbar] arriba de la lista (buscar, redactar)
 * @param {import('react').ReactNode} props.list normalmente MessageList
 * @param {import('react').ReactNode} props.detail normalmente MessageView
 * @param {boolean} [props.isDetailOpen] en el teléfono, se ve la lectura en lugar de la lista
 * @param {() => void} [props.onCloseDetail] «Regresar» del teléfono
 */
export default function InboxLayout({folders, selectedFolderId, onSelectFolder, toolbar, list, detail, isDetailOpen = false, onCloseDetail}) {
    const {t} = useToolkitTranslation('inbox');

    return (
        <Box sx={{
            display: 'grid', gap: 2,
            [DESKTOP_MEDIA_QUERY]: {
                gridTemplateColumns: `${FOLDERS_WIDTH_PIXELS}px ${LIST_WIDTH_PIXELS}px minmax(0, 1fr)`, height: DESKTOP_HEIGHT, minHeight: DESKTOP_MIN_HEIGHT_PIXELS,
            },
        }}>
            {/* las carpetas: columna en escritorio */}
            <Paper variant="outlined" component="nav" aria-label={t('folders')} sx={{p: 1, overflowY: 'auto', borderRadius: 3, [PHONE_MEDIA_QUERY]: {display: 'none'}}}>
                <List disablePadding>
                    {folders.map(({id, label, Icon, unreadCount}) => (
                        <ListItemButton key={id} selected={id === selectedFolderId} onClick={() => onSelectFolder(id)} sx={{borderRadius: 2}}>
                            {Icon && <ListItemIcon sx={{minWidth: 36}}><Icon fontSize="small" /></ListItemIcon>}
                            <ListItemText primary={label} />
                            {unreadCount > 0 && <Typography variant="caption" sx={{fontWeight: 700}} aria-label={t('unreadCount', {count: unreadCount})}>{unreadCount}</Typography>}
                        </ListItemButton>
                    ))}
                </List>
            </Paper>

            {/* la lista, con las carpetas como pestañas en el teléfono */}
            <Paper variant="outlined" sx={{display: 'flex', flexDirection: 'column', minHeight: 0, borderRadius: 3, overflow: 'hidden',
                [PHONE_MEDIA_QUERY]: isDetailOpen ? {display: 'none'} : {}}}>
                <Tabs value={selectedFolderId} onChange={(event, folderId) => onSelectFolder(folderId)} variant="scrollable" aria-label={t('folders')}
                      sx={{px: 1, [DESKTOP_MEDIA_QUERY]: {display: 'none'}}}>
                    {folders.map(({id, label, unreadCount}) => (
                        <Tab key={id} value={id} label={unreadCount > 0 ? <Badge color="primary" badgeContent={unreadCount} sx={{pr: 1.5}}>{label}</Badge> : label} />
                    ))}
                </Tabs>
                {toolbar && <Box sx={{p: 1.5, pb: 1}}>{toolbar}</Box>}
                <Box sx={{flex: 1, minHeight: 0, overflowY: 'auto', px: 1, pb: 1}}>{list}</Box>
            </Paper>

            {/* la lectura: en el teléfono solo con un mensaje abierto, con su «Regresar» */}
            <Paper variant="outlined" sx={{p: {xs: 2, md: 3}, overflowY: 'auto', borderRadius: 3, [PHONE_MEDIA_QUERY]: isDetailOpen ? {} : {display: 'none'}}}>
                {onCloseDetail && (
                    <Button startIcon={<ArrowBackRoundedIcon />} onClick={onCloseDetail} sx={{mb: 1, [DESKTOP_MEDIA_QUERY]: {display: 'none'}}}>{t('back')}</Button>
                )}
                {detail}
            </Paper>
        </Box>
    );
}
