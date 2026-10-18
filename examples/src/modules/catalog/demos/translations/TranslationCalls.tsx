import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const CODE_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

// Cada renglón: lo que se escribe y lo que sale con el idioma de ahorita (cámbielo en el menú de su cuenta)
const TranslationCalls = () => {
    // el namespace de este módulo; otro se pide con «namespace:llave»
    const {t} = useToolkitTranslation('catalog');

    const calls = [
        {code: "t('translations.calls.sample.greeting', {name: 'Ana'})", result: t('translations.calls.sample.greeting', {name: 'Ana'})},
        {code: "t('translations.calls.sample.pending', {count: 1})", result: t('translations.calls.sample.pending', {count: 1})},
        {code: "t('translations.calls.sample.pending', {count: 5})", result: t('translations.calls.sample.pending', {count: 5})},
        {code: "t('common:actions.cancel')", result: t('common:actions.cancel')},
        {code: "t('translations.calls.sample.missing', {defaultValue: ''})", result: t('translations.calls.sample.missing', {defaultValue: ''})},
        {code: "t('translations.calls.sample.missing')", result: t('translations.calls.sample.missing')},
    ];

    return (
        <TableContainer>
            <Table size="small" aria-label={t('translations.calls.title')}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('translations.calls.code')}</TableCell>
                        <TableCell>{t('translations.calls.result')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {calls.map(({code, result}) => (
                        <TableRow key={code}>
                            <TableCell sx={{fontFamily: CODE_FONT, fontSize: 13}}>{code}</TableCell>
                            {/* un texto vacío se enseña como «(vacío)» para que se note */}
                            <TableCell>{result || t('translations.calls.empty')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TranslationCalls;
