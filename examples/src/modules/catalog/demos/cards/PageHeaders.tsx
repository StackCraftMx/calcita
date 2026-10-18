// Los encabezados de página: cada uno pone también el título de la pestaña y lo sube a la barra al deslizar.
//   - PageHeading: el de una pantalla normal; las migas salen solas del menú;
//   - PageHeader: el de una portada, con su renglón de arriba y la acción principal;
//   - DetailHeader: el de un detalle, con sus insignias (el estado) y sus botones.
import Button from '@mui/material/Button';
import {DetailHeader, PageHeader, PageHeading, StatusChip, dictionaryEntryOf} from '@stackcraftmx/calcita';

const ORDER_STATUS = {paid: dictionaryEntryOf('paid', 'orderStatus.paid', 'default')};

export const OrdersListHeader = () => (
    <PageHeading title="Pedidos" description="Todos los pedidos de la tienda; filtre por estado o busque por cliente." />
);

export const HomeHeader = () => (
    <PageHeader eyebrow="Octubre de 2026" title="Buenos días, Ana" subtitle="Hay 13 pedidos por cobrar."
                action={<Button variant="contained">Nuevo pedido</Button>} />
);

export const OrderDetailHeader = () => (
    <DetailHeader eyebrow="Pedido" title="P-2375 · Luis Herrera" badges={<StatusChip dictionary={ORDER_STATUS} value="paid" variant="chip" />}
                  actions={<Button variant="outlined" color="error">Cancelar</Button>} />
);
