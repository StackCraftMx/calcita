// La ayuda en carrusel: unos cuantos pasos para explicar una pantalla la primera vez que se entra (o cuando cambia). Sale
// sola si no se ha visto (aquí apagado con autoOpen: false) y se vuelve a abrir con el «?». Terminarla la recuerda;
// cerrarla antes, solo con «No volver a mostrar». Siguiente, los puntos, las flechas del teclado o deslizar con el dedo.
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import {HelpButton, HelpCarouselDialog, toastSuccess, useHelpCarousel} from '@stackcraftmx/calcita';

// 1. Los pasos: título, texto y una ilustración (o image con su dirección)
const big = {fontSize: 72, color: 'primary.main'};
const REPORT_HELP = [
    {title: 'Su reporte en una tabla', content: 'Cada renglón es un pedido; ordene picando el encabezado de una columna.', media: <TableChartOutlinedIcon sx={big} />},
    {title: 'Filtre lo que necesita', content: 'Los filtros de arriba se guardan en la dirección: comparta la liga y se abre igual.', media: <FilterAltOutlinedIcon sx={big} />},
    {title: 'Llévelo a Excel', content: 'Descargue lo que ve con sus filtros; el archivo llega al panel de descargas.', media: <IosShareRoundedIcon sx={big} />},
];

const HelpCarouselDemo = () => {
    // 2. Cuándo sale: una llave por ayuda y su versión (súbala cuando la ayuda cambie)
    const help = useHelpCarousel({helpKey: 'reports-demo', version: '1', autoOpen: false});

    return (
        <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
            <Button variant="outlined" onClick={help.openHelp}>Ver la ayuda</Button>
            <HelpButton onClick={help.openHelp} />
            <Typography variant="body2" color="text.secondary">{help.wasSeen ? 'Ya la vio en este navegador.' : 'Todavía no la ve.'}</Typography>
            {/* 3. La ventana: avisa cómo se cerró (para guardarlo también en su servidor, si quiere) */}
            <HelpCarouselDialog open={help.open} title="Reportes" steps={REPORT_HELP}
                                onClose={(reason, details) => {
                                    help.closeHelp(reason, details);
                                    toastSuccess(reason === 'finished' ? 'Terminó la ayuda.' : 'Cerró la ayuda.');
                                }} />
        </Stack>
    );
};

export default HelpCarouselDemo;
