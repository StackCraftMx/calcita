// Las migas de una pantalla (Inicio › Catálogos › Productos): cada una lleva a su pantalla menos la última, que es donde
// ya está la persona. En el teléfono no se parten en dos renglones: se deslizan de lado.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {textSizeOf} from '@/theme/appleTracking.js';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * @param {{items: Array<{label: string, to?: string}>}} props textos ya traducidos
 */
export default function PageBreadcrumbs({items}) {
    const {t} = useToolkitTranslation('layout');
    const {Link: RouterLink} = useToolkitNavigation();
    if (items.length === 0) {
        return null;
    }
    return (
        <Breadcrumbs aria-label={t('breadcrumbs')} separator={<NavigateNextIcon fontSize="small" />}
                     sx={{...textSizeOf(13), color: 'text.secondary', '& .MuiBreadcrumbs-ol': {flexWrap: 'nowrap', overflowX: 'auto'},
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
    );
}
