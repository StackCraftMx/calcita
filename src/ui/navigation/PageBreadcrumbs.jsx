// Las migas de una pantalla (Inicio › Catálogos › Productos): cada una lleva a su pantalla menos la última, que es donde
// ya está la persona. En el teléfono no se parten en dos renglones: se deslizan de lado en la misma tira que los filtros
// rápidos (ScrollableRow: sin barra de desplazamiento, la orilla donde hay más se desvanece y se arrastra con el mouse).
// Antes deslizaba la lista de MUI y salía la barra gris del navegador debajo de las migas.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {textSizeOf} from '@/theme/appleTracking.js';
import ScrollableRow from '@/ui/layout/ScrollableRow.jsx';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * @param {object} props
 * @param {Array<{label: string, to?: string}>} props.items textos ya traducidos
 * @param {object} [props.texts] los textos que cambian, con la forma de `layout` en los textos del paquete
 */
export default function PageBreadcrumbs({items, texts}) {
    const {t} = useToolkitTranslation('layout', texts);
    const {Link: RouterLink} = useToolkitNavigation();
    if (items.length === 0) {
        return null;
    }
    return (
        <ScrollableRow py={0}>
            <Breadcrumbs aria-label={t('breadcrumbs')} separator={<NavigateNextIcon fontSize="small" />}
                         sx={{...textSizeOf(13), color: 'text.secondary', flex: '0 0 auto', '& .MuiBreadcrumbs-ol': {flexWrap: 'nowrap'},
                              '& .MuiBreadcrumbs-li': {flex: '0 0 auto'}}}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    if (!isLast && item.to) {
                        return (
                            <Link key={`${item.to}-${index}`} component={RouterLink} to={item.to} underline="hover" color="inherit" sx={{fontSize: 'inherit'}}>
                                {item.label}
                            </Link>
                        );
                    }
                    return (
                        <Typography key={`${item.label}-${index}`} component="span" aria-current={isLast ? 'page' : undefined}
                                    sx={{fontSize: 'inherit', fontWeight: isLast ? 500 : 400, color: isLast ? 'text.primary' : 'text.secondary'}}>
                            {item.label}
                        </Typography>
                    );
                })}
            </Breadcrumbs>
        </ScrollableRow>
    );
}
