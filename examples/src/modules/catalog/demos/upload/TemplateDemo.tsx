// «Descargar la plantilla»: el formato que el archivo debe seguir. Con href baja un archivo fijo con un enlace; con request
// lo pide al API y sale en el panel de descargas con su avance (y su motivo, si el servidor dice que no). Los cargadores lo
// ponen en su lugar con `template`; aquí va suelto.
import Stack from '@mui/material/Stack';
import {TemplateDownloadButton} from '@stackcraftmx/calcita';

// ─── Lo de mentira (en su proyecto NO va): un archivo fijo sería '/plantillas/inventario.csv' y request, su API ───
const FIXED_TEMPLATE = `data:text/csv;charset=utf-8,${encodeURIComponent('Clave,Producto,Existencia\nLAM-01,Lámpara,12\n')}`;
const fakeTemplateFromApi = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {blob: new Blob(['Fecha,Referencia,Importe\n'], {type: 'text/csv'}), fileName: 'plantilla-pagos.csv'};
};

const TemplateDemo = () => (
    <Stack direction={{xs: 'column', sm: 'row'}} spacing={1.5}>
        {/* 1. Un archivo fijo: un enlace de descarga con su nombre */}
        <TemplateDownloadButton href={FIXED_TEMPLATE} fileName="plantilla-inventario.csv" label="Plantilla del inventario" variant="outlined" />
        {/* 2. La da el API: va al panel de descargas */}
        <TemplateDownloadButton request={fakeTemplateFromApi} format="csv" label="Plantilla de pagos" variant="outlined" />
    </Stack>
);

export default TemplateDemo;
