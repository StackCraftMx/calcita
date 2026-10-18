// Botones de ESTA pantalla arriba en la barra (BarActions). Vea arriba a la derecha: esta página puso dos grupos.
import {useState} from 'react';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
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
import {BarActionButton, BarActions, BarCapsule, toastInfo, toastSuccess} from '@stackcraftmx/calcita';

const MIN_ZOOM = 1;
const MAX_ZOOM = 18;

const ScreenCapsules = () => {
    const [zoom, setZoom] = useState(12);

    return (
        <Stack spacing={2}>
            {/* 1. Un grupo = una cápsula. Lo que no va junto, en otro <BarActions>. `order` dice cuál va primero */}
            <BarActions label="Buscar en pedidos" order={1}>
                {/* BarActionButton: en la cápsula es solo el ícono, con su nombre en el tooltip */}
                <BarActionButton label="Buscar" icon={<SearchRoundedIcon />} onClick={() => toastInfo('Aquí abre su buscador.')} />
            </BarActions>
            {/* 2. Muchas acciones: en escritorio van todas en la barra; en el teléfono flotan arriba las que caben y las demás van
                al menú «⋯» con su nombre. No se programa: el marco mide el ancho */}
            <BarActions label="Acciones de pedidos" order={2}>
                <BarActionButton label="Agregar pedido" icon={<AddRoundedIcon />} onClick={() => toastSuccess('Aquí abre su formulario de alta.')} />
                <BarActionButton label="Exportar a Excel" icon={<FileDownloadOutlinedIcon />} onClick={() => toastSuccess('Se empezó a descargar el Excel.')} />
                <BarActionButton label="Imprimir" icon={<PrintOutlinedIcon />} onClick={() => toastInfo('Aquí abre la impresión.')} />
                <BarActionButton label="Compartir" icon={<ShareOutlinedIcon />} onClick={() => toastInfo('Aquí copia la liga para compartir.')} />
                <BarActionButton label="Enviar por correo" icon={<EmailOutlinedIcon />} onClick={() => toastInfo('Aquí abre el correo.')} />
                <BarActionButton label="Duplicar" icon={<ContentCopyRoundedIcon />} onClick={() => toastInfo('Aquí duplica el pedido.')} />
                <BarActionButton label="Archivar" icon={<ArchiveOutlinedIcon />} onClick={() => toastInfo('Aquí archiva el pedido.')} />
            </BarActions>

            <Typography variant="body2" color="text.secondary">
                Estos botones están arriba a la derecha: en escritorio, en la barra; en el teléfono, flotando (se quedan al bajar), y los que no caben, en el menú «⋯».
            </Typography>

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
