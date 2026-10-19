// Las migas de una pantalla (Inicio › Catálogos › Productos): cada una lleva a su pantalla menos la última, que es donde
// ya está la persona. En el teléfono no se parten en dos renglones: se deslizan de lado en la misma tira que los filtros
// rápidos (ScrollableRow: sin barra de desplazamiento, la orilla donde hay más se desvanece y se arrastra con el mouse).
// Antes deslizaba la lista de MUI y salía la barra gris del navegador debajo de las migas.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaPageBreadcrumbs con defaultProps y
// styleOverrides de sus partes: root, link, current.
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
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaPageBreadcrumbs)
const THEME_NAME = 'CalcitaPageBreadcrumbs';
const BreadcrumbsRoot = piecePart(THEME_NAME, 'Root', Breadcrumbs);
const BreadcrumbsLink = piecePart(THEME_NAME, 'Link', Link);
const BreadcrumbsCurrent = piecePart(THEME_NAME, 'Current', Typography);

/**
 * @param {object} props
 * @param {Array<{label: string, to?: string}>} props.items textos ya traducidos
 * @param {object} [props.texts] los textos que cambian, con la forma de `layout` en los textos del paquete
 */
export default function PageBreadcrumbs(props) {
    // lo que el proyecto puso en su tema (components.CalcitaPageBreadcrumbs.defaultProps) y encima lo que llega aquí
    const {items, texts} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('layout', texts);
    const {Link: RouterLink} = useToolkitNavigation();
    if (items.length === 0) {
        return null;
    }
    return (
        <ScrollableRow py={0}>
            <BreadcrumbsRoot aria-label={t('breadcrumbs')} separator={<NavigateNextIcon fontSize="small" />}
                         ownSx={{...textSizeOf(13), color: 'text.secondary', flex: '0 0 auto', '& .MuiBreadcrumbs-ol': {flexWrap: 'nowrap'},
                              '& .MuiBreadcrumbs-li': {flex: '0 0 auto'}}}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    if (!isLast && item.to) {
                        return (
                            <BreadcrumbsLink key={`${item.to}-${index}`} component={RouterLink} to={item.to} underline="hover" color="inherit" ownSx={{fontSize: 'inherit'}}>
                                {item.label}
                            </BreadcrumbsLink>
                        );
                    }
                    return (
                        <BreadcrumbsCurrent key={`${item.label}-${index}`} component="span" aria-current={isLast ? 'page' : undefined}
                                    ownSx={{fontSize: 'inherit', fontWeight: isLast ? 500 : 400, color: isLast ? 'text.primary' : 'text.secondary'}}>
                            {item.label}
                        </BreadcrumbsCurrent>
                    );
                })}
            </BreadcrumbsRoot>
        </ScrollableRow>
    );
}
