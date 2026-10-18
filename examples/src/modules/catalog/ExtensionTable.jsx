// «Cómo se extiende» de una pieza de Hecho en Calcita: una tabla con cada opción, qué hace en palabras normales y un ejemplo
// de una línea para copiar. Va debajo de la descripción de su sección (DemoSection / CodeSection, prop `extensions`).
// En el teléfono cada renglón se vuelve una tarjetita (opción arriba, explicación y ejemplo abajo): una tabla de tres
// columnas no cabe.
//
// Lo renderiza la app: arrow (regla de la casa).
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const CODE_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/**
 * Las filas de la tabla de una sección. La opción y su ejemplo son código (no se traducen); qué hace sale de los textos del
 * catálogo: <textPrefix>.extend.<id> (p. ej. 'shell.layout' → shell.layout.extend.brand).
 *
 * @param {(key: string) => string} t el traductor del catálogo
 * @param {string} textPrefix dónde están los textos de la sección
 * @param {Array<{id: string, option: string, example?: string}>} extensions
 * @returns {Array<{option: string, what: string, example?: string}>}
 */
export const extensionRowsOf = (t, textPrefix, extensions) => (
    // el id va también en el renglón: dos opciones pueden llamarse igual (fallback de Can y de RequireAccess) y la llave de
    // React tiene que ser única
    extensions.map(({id, option, example}) => ({id, option, example, what: t(`${textPrefix}.extend.${id}`)}))
);

/**
 * @param {object} props
 * @param {Array<{id?: string, option: string, what: string, example?: string}>} props.rows ya traducidos (el ejemplo es código: no se
 *     traduce)
 */
export const ExtensionTable = ({rows}) => {
    const {t} = useToolkitTranslation('catalog');
    const codeSx = {fontFamily: CODE_FONT, fontSize: '0.8125rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word'};

    return (
        <Box component="section" aria-label={t('extend.title')} sx={{mb: 2.5}}>
            <Typography variant="subtitle2" component="h3" sx={{mb: 1}}>{t('extend.title')}</Typography>
            <Box sx={{display: {xs: 'none', md: 'block'}, overflowX: 'auto'}}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('extend.option')}</TableCell>
                            <TableCell>{t('extend.what')}</TableCell>
                            <TableCell>{t('extend.example')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id ?? row.option}>
                                <TableCell sx={{...codeSx, fontWeight: 600, whiteSpace: 'nowrap'}}>{row.option}</TableCell>
                                <TableCell>{row.what}</TableCell>
                                <TableCell sx={codeSx}>{row.example}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
            {/* teléfono: un renglón por opción, apilado */}
            <Box component="ul" sx={{display: {xs: 'flex', md: 'none'}, flexDirection: 'column', gap: 1.5, listStyle: 'none', p: 0, m: 0}}>
                {rows.map((row) => (
                    <Box component="li" key={row.id ?? row.option}>
                        <Typography sx={{...codeSx, fontWeight: 600}}>{row.option}</Typography>
                        <Typography variant="body2" color="text.secondary">{row.what}</Typography>
                        {row.example && <Typography sx={{...codeSx, color: 'text.secondary'}}>{row.example}</Typography>}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};
