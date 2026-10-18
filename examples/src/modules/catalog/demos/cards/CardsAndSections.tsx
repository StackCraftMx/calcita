// Las tarjetas y secciones de la casa: SectionCard (un bloque con su título y una acción), DefinitionList (dato: valor,
// en columnas o apilado), CollapsibleSection (lo largo, plegado) y MetricCard (un número con su tendencia, que lleva a su
// lista). Con el vidrio del tema, el contenido va en material, no en vidrio (guía de Apple).
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {CollapsibleSection, DefinitionList, MetricCard, SectionCard, TREND_DIRECTION, formatNumber} from '@stackcraftmx/calcita';

const CardsAndSections = () => (
    <Stack spacing={2}>
        <Grid container spacing={2}>
            <Grid size={{xs: 12, sm: 4}}>
                <MetricCard label="Pedidos del mes" value={formatNumber(1382)} caption="contra septiembre"
                            trend={{label: '+12 %', direction: TREND_DIRECTION.up, isGood: true}} to="/orders" />
            </Grid>
            <Grid size={{xs: 12, sm: 4}}>
                <MetricCard label="Cancelados" value={formatNumber(13)} tone="error" trend={{label: '+4', direction: TREND_DIRECTION.up, isGood: false}} />
            </Grid>
            <Grid size={{xs: 12, sm: 4}}>
                <MetricCard label="Por cobrar" value="$86,420.00" tone="warning" caption="7 clientes" />
            </Grid>
        </Grid>
        <SectionCard title="Datos del pedido" action={<Button size="small">Editar</Button>}>
            <DefinitionList entries={[
                {label: 'Cliente', value: 'Luis Herrera'},
                {label: 'Entrega', value: 'Lunes 20 de octubre, antes de las 10'},
                {label: 'Forma de pago', value: 'Transferencia'},
            ]} />
        </SectionCard>
        <CollapsibleSection collapsedTitle="Ver el detalle de la validación" expandedTitle="Ocultar el detalle de la validación"
                            hint="Incluye los motivos de rechazo de cada renglón.">
            <Typography variant="body2">3 renglones sin RFC · 1 con el monto en negativo.</Typography>
        </CollapsibleSection>
    </Stack>
);

export default CardsAndSections;
