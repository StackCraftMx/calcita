// Los filtros activos, a la vista y desarmables de a uno.
//
// Un filtro que solo se ve como un icono encendido en el encabezado se olvida: alguien filtra, se va al detalle,
// regresa y lee el total como si fuera el de todo. Por eso los filtros puestos se dicen con todas sus letras arriba de
// la tabla.
//
// Van en UNA tira que se desliza (ScrollableRow), no envolviéndose en renglones que empujan la tabla fuera de la
// pantalla. La cuenta y "Limpiar todo" van en su propio renglón, arriba, para no tener que deslizar hasta encontrarlo.
// Sin filtros activos no se pinta nada (ni el hueco).
//
// Los accesos rápidos cuentan aunque no tengan chip aquí: su propio chip encendido ya dice qué está elegido.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaFilterChips con defaultProps y
// styleOverrides de sus partes: root, header, clearButton.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ClearAllIcon from '@mui/icons-material/ClearAll';

import ScrollableRow from '@/ui/layout/ScrollableRow.jsx';
import Tag from '@/ui/labels/Tag.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaFilterChips)
const THEME_NAME = 'CalcitaFilterChips';
const ChipsRoot = piecePart(THEME_NAME, 'Root', Box);
const ChipsHeader = piecePart(THEME_NAME, 'Header', Stack);
const ChipsClearButton = piecePart(THEME_NAME, 'ClearButton', Button);

/**
 * @param {object} props
 * @param {Array<object>} props.chipConfig lo que arma buildChipConfig
 * @param {object} props.filters
 * @param {(field: string, value: unknown) => void} props.onSetFilter
 * @param {() => void} props.onClearAll
 * @param {number} [props.quickActiveCount] accesos rápidos puestos que no tienen chip aquí
 * @param {object} [props.texts] los textos que cambian, con la forma de `table` en los textos del paquete
 */
export default function FilterChips(props) {
    // lo que el proyecto puso en su tema (components.CalcitaFilterChips.defaultProps) y encima lo que llega aquí
    const {chipConfig, filters, onSetFilter, onClearAll, quickActiveCount = 0, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('table', texts);
    const chips = chipConfig
        .filter((chipDeclaration) => chipDeclaration.isActive(filters[chipDeclaration.key]))
        .flatMap((chipDeclaration) => chipDeclaration.chipsFor(filters[chipDeclaration.key], onSetFilter));

    const activeCount = chips.length + quickActiveCount;
    // guard clause: sin filtros no se pinta nada
    if (activeCount === 0) {
        return null;
    }

    return (
        <ChipsRoot ownSx={{mb: 1.5, minWidth: 0}}>
            <ChipsHeader direction="row" spacing={1} ownSx={{px: 0.25, alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {t('chips.applied', {count: activeCount})}
                </Typography>
                <ChipsClearButton size="small" color="error" startIcon={<ClearAllIcon fontSize="small" />} onClick={onClearAll}
                        ownSx={{flexShrink: 0}}>
                    {t('chips.clearAll')}
                </ChipsClearButton>
            </ChipsHeader>

            {chips.length > 0 && (
                <ScrollableRow>
                    {chips.map(({id, label, onDelete}) => (
                        <Tag key={id} label={label} color="primary" onDelete={onDelete} sx={{flex: '0 0 auto'}} />
                    ))}
                </ScrollableRow>
            )}
        </ChipsRoot>
    );
}
