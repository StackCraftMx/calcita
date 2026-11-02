// Pestañas por ruta: cada pestaña es una dirección, así se comparte la liga a una pestaña, «atrás» regresa a la anterior y
// se abre en otra pestaña del navegador. Aquí, dentro de una misma pantalla (mode query: ?tab=pagos); con las rutas del
// proyecto cada pestaña es su página:
//
//   <RouteTabs ariaLabel="Secciones del cliente" tabs={[
//       {to: `/customers/${id}`, label: 'Resumen', exact: true},
//       {to: `/customers/${id}/payments`, label: 'Pagos', badge: 3},
//   ]} />
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';
import {ROUTE_TABS_MODE, RouteTabs, useActiveRouteTab} from '@stackcraftmx/calcita';

// 1. Las pestañas: su valor en la consulta, su texto, su ícono, un conteo y su permiso (la que no se puede ver no sale)
const CUSTOMER_TABS = [
    {value: 'summary', label: 'Resumen', icon: <SummarizeOutlinedIcon fontSize="small" />},
    {value: 'payments', label: 'Pagos', icon: <PaymentsOutlinedIcon fontSize="small" />, badge: 3},
    {value: 'files', label: 'Documentos', icon: <DescriptionOutlinedIcon fontSize="small" />, access: {ability: 'customers.create'}},
    {value: 'audit', label: 'Bitácora', disabled: true},
];
const PANELS: Record<string, string> = {
    summary: 'Lo principal del cliente: crédito, saldo y su contacto.',
    payments: 'Sus 3 pagos pendientes de conciliar.',
    files: 'Su constancia fiscal y su identificación.',
};

const RouteTabsDemo = () => {
    // 2. La activa, para pintar su panel (la misma regla que las pestañas)
    const activeTab = useActiveRouteTab(CUSTOMER_TABS, {mode: ROUTE_TABS_MODE.query});

    return (
        <Stack spacing={2}>
            <RouteTabs ariaLabel="Secciones del cliente" mode={ROUTE_TABS_MODE.query} tabs={CUSTOMER_TABS} />
            {/* 3. El panel de la pestaña activa: recargue la página y sigue en la misma */}
            <Paper variant="outlined" sx={{p: 2}}>
                <Typography>{PANELS[activeTab ?? 'summary']}</Typography>
            </Paper>
        </Stack>
    );
};

export default RouteTabsDemo;
