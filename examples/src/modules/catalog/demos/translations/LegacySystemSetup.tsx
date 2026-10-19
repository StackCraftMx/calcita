// Calcita en un sistema que ya existe (PHP, JSP, .NET…), sin reescribirlo: entra por pedazos. Cada pedazo es una «isla» de
// React montada en un <div> de la página vieja, con su propio ToolkitProvider. Sin router y sin tocar el servidor:
//   1. createHashNavigation(): las pantallas viven después del # (/app.php#/ventas). El servidor viejo no sabe responder
//      /ventas al recargar, y lo que va después del # se queda en el navegador;
//   2. con prefijo y sin router (la app en /portal, detrás de un proxy): createBrowserNavigation({basePath: '/portal'}). Cada
//      liga recarga como una página normal;
//   3. dos islas en la misma página, cada una con su idioma y su moneda: useFormatters escribe con la de su isla (los
//      formatos sueltos, formatDate…, usan la de la última que se pintó);
//   4. un tema propio de MUI que ya tenía el sistema sirve igual: Calcita lee los colores del tema, con o sin variables CSS y
//      con el prefijo que traiga (cssVarPrefix).
// Lo que pasa adentro sale por los eventos de cada componente (onSelect, onChange…): el sistema viejo se entera sin que
// Calcita llame a ningún servidor propio.
import {createRoot} from 'react-dom/client';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import {MetricCard, ToolkitProvider, createBrowserNavigation, createHashNavigation, useFormatters} from '@stackcraftmx/calcita';

// 4. el tema que ya tenía (aquí, uno de MUI con su propio prefijo de variables)
const legacyTheme = createTheme({cssVariables: {cssVarPrefix: 'portal'}, palette: {primary: {main: '#00695C'}}});

// 1 y 2: una vez, fuera de los componentes. Elija una: con # o con prefijo
const hashNavigation = createHashNavigation();
export const prefixedNavigation = createBrowserNavigation({basePath: '/portal'});

// 3. la isla: escribe el monto con el idioma y la moneda de SU proveedor
const SalesOfTheDay = ({total, onOpen}: {total: number, onOpen: () => void}) => {
    const {formatCurrency} = useFormatters();
    return <MetricCard label="Ventas del día" value={formatCurrency(total)} onClick={onOpen} />;
};

// cada <div data-calcita="sales" data-total="2899.88" data-currency="USD" lang="en"> de la página vieja se vuelve una isla
document.querySelectorAll<HTMLElement>('[data-calcita="sales"]').forEach((element) => {
    createRoot(element).render(
        <ThemeProvider theme={legacyTheme}>
            <ToolkitProvider language={element.lang || 'es'} currency={element.dataset.currency ?? 'MXN'} navigation={hashNavigation}>
                <SalesOfTheDay total={Number(element.dataset.total)}
                               // el evento sale a la página vieja: ella decide qué hacer (aquí, su propia función)
                               onOpen={() => element.dispatchEvent(new CustomEvent('calcita:open-sales', {bubbles: true}))} />
            </ToolkitProvider>
        </ThemeProvider>,
    );
});
