// Botones de ESTA pantalla arriba en la barra (BarActions). Vea arriba a la derecha: esta página puso dos grupos.
import {useState} from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import {BAR_ACTION_LABEL, BarActionButton, BarActions, BarCapsule, toastInfo, toastSuccess} from '@stackcraftmx/calcita';

const MIN_ZOOM = 1;
const MAX_ZOOM = 18;

const ScreenCapsules = () => {
    const [zoom, setZoom] = useState(12);
    // con su nombre en escritorio (showLabel desktop): con siete acciones ya no caben todas y las últimas van al «⋯»
    const [withLabels, setWithLabels] = useState(false);
    const showLabel = withLabels ? BAR_ACTION_LABEL.desktop : BAR_ACTION_LABEL.auto;
    // con tope (maxVisible): como mucho 3 en el teléfono y 5 en escritorio, contando el «⋯»
    const [isCapped, setIsCapped] = useState(false);
    const maxVisible = isCapped ? {phone: 3, desktop: 5} : undefined;

    return (
        <Stack spacing={2}>
            {/* 1. Un grupo = una cápsula. Lo que no va junto, en otro <BarActions>. `order` dice cuál va primero */}
            <BarActions label="Buscar en pedidos" order={1}>
                {/* BarActionButton: en la cápsula es solo el ícono, con su nombre en el tooltip */}
                <BarActionButton label="Buscar" icon={<SearchRoundedIcon />} onClick={() => toastInfo('Aquí abre su buscador.')} />
            </BarActions>
            {/* 2. Muchas acciones: van las que caben y las demás al menú «⋯» con su nombre. En el teléfono flotan arriba; en
                escritorio pasa con una ventana angosta, la letra grande o con su nombre (showLabel). No se programa: el marco mide */}
            <BarActions label="Acciones de pedidos" order={2} maxVisible={maxVisible}>
                <BarActionButton label="Agregar pedido" icon={<AddRoundedIcon />} showLabel={showLabel} onClick={() => toastSuccess('Aquí abre su formulario de alta.')} />
                <BarActionButton label="Exportar a Excel" icon={<FileDownloadOutlinedIcon />} showLabel={showLabel} onClick={() => toastSuccess('Se empezó a descargar el Excel.')} />
                {/* desactivado: del color de los demás, tenue (se cambia con disabledSx, aquí o en el tema) */}
                <BarActionButton label="Imprimir" icon={<PrintOutlinedIcon />} showLabel={showLabel} disabled onClick={() => toastInfo('Aquí abre la impresión.')} />
                <BarActionButton label="Compartir" icon={<ShareOutlinedIcon />} showLabel={showLabel} onClick={() => toastInfo('Aquí copia la liga para compartir.')} />
                <BarActionButton label="Enviar por correo" icon={<EmailOutlinedIcon />} showLabel={showLabel} onClick={() => toastInfo('Aquí abre el correo.')} />
                <BarActionButton label="Duplicar" icon={<ContentCopyRoundedIcon />} showLabel={showLabel} onClick={() => toastInfo('Aquí duplica el pedido.')} />
                <BarActionButton label="Archivar" icon={<ArchiveOutlinedIcon />} showLabel={showLabel} onClick={() => toastInfo('Aquí archiva el pedido.')} />
            </BarActions>

            <Typography variant="body2" color="text.secondary">
                Estos botones están arriba a la derecha: en escritorio, en la barra; en el teléfono, flotando (se quedan al bajar), y los que no caben, en el menú «⋯».
            </Typography>
            <FormControlLabel control={<Switch checked={withLabels} onChange={(event) => setWithLabels(event.target.checked)} />}
                              label="Con su nombre en escritorio (showLabel desktop)" />
            <FormControlLabel control={<Switch checked={isCapped} onChange={(event) => setIsCapped(event.target.checked)} />}
                              label="Con tope: 3 en el teléfono y 5 en escritorio, contando el «⋯» (maxVisible)" />

            {/* 3. La misma cápsula, fuera de la barra: unos controles encima de un mapa o de una imagen */}
            <BarCapsule aria-label="Acercar o alejar" sx={{alignSelf: 'flex-start'}}>
                <IconButton aria-label="Alejar" disabled={zoom <= MIN_ZOOM} onClick={() => setZoom((current) => current - 1)}><RemoveRoundedIcon /></IconButton>
                <Typography variant="body2" sx={{minWidth: 64, textAlign: 'center', fontVariantNumeric: 'tabular-nums'}}>Zoom {zoom}</Typography>
                <IconButton aria-label="Acercar" disabled={zoom >= MAX_ZOOM} onClick={() => setZoom((current) => current + 1)}><AddRoundedIcon /></IconButton>
            </BarCapsule>
        </Stack>
    );
};

export default ScreenCapsules;
