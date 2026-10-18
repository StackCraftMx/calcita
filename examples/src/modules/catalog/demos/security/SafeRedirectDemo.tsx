import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {safeInternalPath, useToolkitTranslation} from '@stackcraftmx/calcita';

// Lo que podría venir en ?next= de una liga: solo las direcciones de la app se siguen. Una de afuera sería una liga para
// robar: «entre aquí con su usuario y lo llevo a otro sitio que se ve igual».
const CANDIDATES = [
    '/orders?page=2',
    '/profile?tab=security',
    'https://otro-sitio.com/entrar',
    '//otro-sitio.com',
    '/\\otro-sitio.com',
    'javascript:alert(1)',
];
const CODE_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

const SafeRedirectDemo = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Table size="small" aria-label={t('security.redirect.title')}>
            <TableHead>
                <TableRow>
                    <TableCell>{t('security.redirect.candidate')}</TableCell>
                    <TableCell>{t('security.redirect.result')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {CANDIDATES.map((candidate) => {
                    const safePath = safeInternalPath(candidate);
                    return (
                        <TableRow key={candidate}>
                            <TableCell sx={{fontFamily: CODE_FONT, fontSize: 13}}>{candidate}</TableCell>
                            <TableCell sx={{color: safePath ? 'success.main' : 'error.main'}}>
                                {safePath ? t('security.redirect.allowed') : t('security.redirect.blocked')}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

export default SafeRedirectDemo;
