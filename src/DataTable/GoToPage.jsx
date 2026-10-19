// "Ir a la página N", como un selector con búsqueda.
//
// Con cientos de páginas, llegar a la 137 a punta de flechita no es navegar. Un Autocomplete dice las tres cosas sin
// explicarlas: se abre y se ve la lista, se teclea y se filtra, se elige y ya.
//
// Tres detalles:
//   1. la lista se recorta a RENDER_LIMIT opciones en el DOM; lo demás se alcanza tecleando;
//   2. filtra por PREFIJO primero (teclear 13 da 13, 130, 131...) y luego por "contiene";
//   3. con una sola página no se pinta: sería un control que no lleva a ningún lado.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaGoToPage con defaultProps y
// styleOverrides de sus partes: root, field.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {useFormatters} from '@/toolkit/useFormatters.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaGoToPage)
const THEME_NAME = 'CalcitaGoToPage';
const GoToRoot = piecePart(THEME_NAME, 'Root', Stack);
const GoToField = piecePart(THEME_NAME, 'Field', Autocomplete);

// tope del DOM, no de la navegación
const RENDER_LIMIT = 100;

function filterPages(pageNumbers, {inputValue}) {
    const typedText = inputValue.trim();
    if (!typedText) {
        return pageNumbers.slice(0, RENDER_LIMIT);
    }
    const startingWith = pageNumbers.filter((pageNumber) => String(pageNumber).startsWith(typedText));
    const containing = pageNumbers.filter((pageNumber) => !String(pageNumber).startsWith(typedText) && String(pageNumber).includes(typedText));
    return [...startingWith, ...containing].slice(0, RENDER_LIMIT);
}

/**
 * @param {object} props
 * @param {number} props.page cuenta desde 0
 * @param {number} props.pageCount
 * @param {(page: number) => void} props.onChange
 * @param {object} [props.texts] los textos que cambian, con la forma de `table` en los textos del paquete
 */
export default function GoToPage(props) {
    // lo que el proyecto puso en su tema (components.CalcitaGoToPage.defaultProps) y encima lo que llega aquí
    const {page, pageCount, onChange, texts} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('table', texts);
    const {formatNumber} = useFormatters();

    // guard clause: con una página no hay a dónde ir
    if (pageCount <= 1) {
        return null;
    }

    // la persona cuenta desde 1 y el estado de la tabla desde 0: la conversión vive AQUÍ y en ningún otro lado
    const pageNumbers = Array.from({length: pageCount}, (unused, position) => position + 1);

    return (
        <GoToRoot direction="row" spacing={0.75} ownSx={{alignItems: 'baseline'}}>
            <Typography variant="body2" color="text.secondary" noWrap>{t('goToPage.page')}</Typography>
            <GoToField
                size="small"
                disableClearable
                openOnFocus
                autoHighlight
                options={pageNumbers}
                filterOptions={filterPages}
                value={page + 1}
                isOptionEqualToValue={(option, selectedValue) => option === selectedValue}
                getOptionLabel={(option) => String(option)}
                onChange={(event, selectedPageNumber) => {
                    if (selectedPageNumber !== null && selectedPageNumber - 1 !== page) {
                        onChange(selectedPageNumber - 1);
                    }
                }}
                ownSx={{width: 78, '& .MuiAutocomplete-endAdornment': {right: 0}}}
                slotProps={{listbox: {sx: {maxHeight: 240}}}}
                renderInput={(params) => (
                    <TextField {...params} variant="standard"
                               slotProps={{htmlInput: {...params.inputProps, inputMode: 'numeric', 'aria-label': t('goToPage.ariaLabel')}}} />
                )}
            />
            <Typography variant="body2" color="text.secondary" noWrap>
                {t('goToPage.of', {count: pageCount, total: formatNumber(pageCount)})}
            </Typography>
        </GoToRoot>
    );
}
