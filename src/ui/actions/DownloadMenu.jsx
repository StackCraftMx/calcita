// "Descargar ▾" con los formatos de un reporte: PDF para leer o archivar, Excel o CSV para trabajar.
//
// Un solo botón y no tres: en la barra de una pantalla tres botones de descarga compiten con la acción principal.
// Se acomoda a donde quedó, como BarActionButton: en una cápsula de la barra (las `actions` de PageHeading con cápsulas)
// es solo el ícono con su nombre en el tooltip, como las demás acciones; antes salía la píldora «Descargar ▾» dentro de
// la cápsula y se veía una cápsula dentro de otra. En el «⋯» del teléfono es un renglón que abre los formatos.
// Quien llama pasa QUÉ descargar por formato (download(format, transferOptions) → {blob, fileName}, la forma de
// un cliente HTTP que descarga). La descarga va al panel de descargas (startDownload, downloads): el diálogo se cierra al
// confirmar y el avance, el aviso de "descargado" y el error se ven allá, mientras la persona sigue trabajando.
//
// Regla de tablas: una descarga pasa por un diálogo de confirmación que dice qué se va a bajar (p. ej. que la base
// completa de clientes tarda unos minutos). Con `confirmation` el formato elegido NO se descarga de inmediato: abre
// ConfirmDialog (máquina confirmActionMachine) y solo al confirmar se pide el archivo, una sola vez aunque haya doble clic.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import {BAR_ACTIONS_PLACEMENT, useBarActionsPlacement, useCloseBarActionsMenu} from '@/appShell/barActionsSlot.js';
import {startDownload} from '@/downloads/downloadQueue.js';
import {useFileTypes} from '@/downloads/fileTypes.js';
import ConfirmDialog from '@/feedback/ConfirmDialog.jsx';
import {useConfirmAction} from '@/feedback/useConfirmAction.js';


/**
 * @param {object} props
 * @param {string[]} props.formats los tipos de archivo, en orden: los de la casa (xlsx, csv, pdf) y los que el proyecto declare
 *     en ToolkitProvider fileTypes (zip, xml…)
 * @param {(format: string, transferOptions: {signal: AbortSignal, onDownloadProgress: (progress: {loaded: number, total?: number|null}) => void}) => Promise<{blob: Blob, fileName: string}>} props.download
 * @param {string} [props.label] ya traducido; por defecto "Descargar"
 * @param {string} [props.downloadLabel] ya traducido; lo que se ve en el panel de descargas antes de saber el nombre
 *     del archivo
 * @param {boolean} [props.disabled]
 * @param {(format: string) => {title: string, description: import('react').ReactNode, confirmLabel?: string}} [props.confirmation]
 * @param {(format: string) => void} [props.onDownloaded] p. ej. volver a pedir la tabla (si la descarga cambia algo en
 *     el servidor)
 * @param {(format: string, error: unknown) => void} [props.onFailed] cuando la descarga no se pudo (el panel ya lo dice)
 * @param {(format: string) => void} [props.onCanceled] cuando la persona la canceló desde el panel
 * @param {'button'|'icon'} [props.variant] icon = solo el icono (columna de acciones de una tabla)
 * @param {string} [props.ariaLabel] ya traducido; obligatorio en la variante icon
 * @param {(format: string) => void} [props.onChooseFormat] quien llama se encarga de confirmar y descargar
 * @param {import('react').ElementType} [props.icon] ícono del botón; por defecto el de descarga. Distingue dos descargas en la
 *     misma fila
 *
 * IMPORTANTE: hay que pasar `confirmation` u `onChooseFormat`. Sin ninguno de los dos el menú no descarga nada (regla de
 * tablas: toda descarga pasa por confirmación).
 *
 * OJO onChooseFormat: dentro de una celda del DataGrid el diálogo de confirmación NO puede vivir en la celda (el grid
 * virtualiza y vuelve a pintar sus celdas; el diálogo se perdía al elegir el formato). Ahí el menú solo avisa qué formato
 * se eligió y la pantalla abre SU confirmación (useConfirmAction) fuera de la tabla.
 */
export default function DownloadMenu({
    formats, download, label, downloadLabel, disabled = false, confirmation, onDownloaded, onFailed, onCanceled, variant = 'button', ariaLabel,
    onChooseFormat, icon: ButtonIcon = FileDownloadOutlinedIcon,
}) {
    const {t} = useToolkitTranslation('common');
    const fileTypes = useFileTypes();
    // de dónde sale el menú de formatos: del botón, o (desde el «⋯» del teléfono, que se cierra) de donde estaba el renglón
    const [anchorElement, setAnchorElement] = useState(null);
    const [anchorPosition, setAnchorPosition] = useState(null);
    const placement = useBarActionsPlacement();
    const closeMoreMenu = useCloseBarActionsMenu();
    const closeFormats = () => {
        setAnchorElement(null);
        setAnchorPosition(null);
    };

    // no se espera a que termine: la descarga sigue en el panel y el diálogo de confirmación se cierra de inmediato
    const runDownload = (format) => {
        startDownload({
            label: downloadLabel ?? label ?? ariaLabel ?? t('actions.download'),
            format,
            request: (transferOptions) => download(format, transferOptions),
            onCompleted: () => onDownloaded?.(format),
            onFailed: (error) => onFailed?.(format, error),
            onCanceled: () => onCanceled?.(format),
        });
    };

    const confirmedDownload = useConfirmAction({run: ({subject}) => runDownload(subject.format)});

    const chooseFormat = (format) => {
        closeFormats();
        if (onChooseFormat) {
            onChooseFormat(format);
            return;
        }
        if (confirmation) {
            confirmedDownload.open({format});
            return;
        }
        // Regla de tablas: nada se descarga con un solo clic. Sin confirmation ni onChooseFormat es un error de quien
        // llama, no un camino válido: lo decimos en la consola y no descargamos
        console.error('DownloadMenu: falta confirmation u onChooseFormat; toda descarga pasa por un diálogo de confirmación');
    };

    const buttonLabel = label ?? t('actions.download');
    const openMenu = (event) => setAnchorElement(event.currentTarget);
    // desde el «⋯»: se cierra ese menú y los formatos salen donde estaba el renglón
    const openFromMoreMenu = (event) => {
        const {bottom, right} = event.currentTarget.getBoundingClientRect();
        closeMoreMenu();
        setAnchorPosition({top: bottom, left: right});
    };
    const isFormatsOpen = Boolean(anchorElement || anchorPosition);
    const confirmationTexts = confirmedDownload.subject ? confirmation?.(confirmedDownload.subject.format) : null;

    return (
        <>
            {placement === BAR_ACTIONS_PLACEMENT.menu && (
                <MenuItem disabled={disabled} aria-haspopup="menu" onClick={openFromMoreMenu}>
                    <ListItemIcon><ButtonIcon /></ListItemIcon>
                    <ListItemText>{buttonLabel}</ListItemText>
                </MenuItem>
            )}
            {placement === BAR_ACTIONS_PLACEMENT.capsule && (
                // en la cápsula, del tamaño y color de las demás acciones (BarActionButton)
                <Tooltip title={buttonLabel} describeChild>
                    <span>
                        <IconButton color="primary" aria-label={buttonLabel} aria-haspopup="menu" aria-expanded={isFormatsOpen}
                                    disabled={disabled} onClick={openMenu}>
                            <ButtonIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
            {placement === BAR_ACTIONS_PLACEMENT.inline && (variant === 'icon' ? (
                // describeChild: el nombre accesible ya lo trae el botón; sin esto el Tooltip le pone el mismo aria-label al
                // span y un lector de pantalla (o una prueba) encuentra dos "botones" con el mismo nombre
                <Tooltip title={ariaLabel ?? buttonLabel} describeChild>
                    {/* el span deja que el tooltip funcione con el botón inhabilitado */}
                    <span>
                        <IconButton size="small" aria-label={ariaLabel ?? buttonLabel} aria-haspopup="menu"
                                    disabled={disabled} onClick={openMenu}>
                            <ButtonIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            ) : (
                <Button variant="outlined" startIcon={<ButtonIcon />} endIcon={<ArrowDropDownIcon />}
                        sx={{flexShrink: 0}} disabled={disabled} aria-haspopup="menu" onClick={openMenu}>
                    {buttonLabel}
                </Button>
            ))}
            <Menu open={isFormatsOpen} onClose={closeFormats}
                  anchorReference={anchorPosition ? 'anchorPosition' : 'anchorEl'} anchorEl={anchorElement} anchorPosition={anchorPosition ?? undefined}
                  anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} transformOrigin={{vertical: 'top', horizontal: 'right'}}>
                {formats.map((format) => {
                    const fileType = fileTypes[format];
                    const Icon = fileType?.Icon ?? FileDownloadOutlinedIcon;
                    return (
                        <MenuItem key={format} onClick={() => chooseFormat(format)}>
                            <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
                            {/* los de la casa con sus textos; los del proyecto con su label y hint (o esas llaves en sus texts) */}
                            <ListItemText primary={t(`download.formats.${format}.label`, {defaultValue: fileType?.label ?? format.toUpperCase()})}
                                          secondary={t(`download.formats.${format}.hint`, {defaultValue: fileType?.hint ?? ''})}
                                          slotProps={{secondary: {variant: 'caption'}}} />
                        </MenuItem>
                    );
                })}
            </Menu>
            {confirmation && (
                <ConfirmDialog
                    {...confirmedDownload.dialogProps}
                    title={confirmationTexts?.title ?? ''}
                    description={confirmationTexts?.description}
                    confirmLabel={confirmationTexts?.confirmLabel ?? t('actions.download')}
                />
            )}
        </>
    );
}
