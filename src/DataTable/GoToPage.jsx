// "Ir a la página N", como un selector con búsqueda.
//
// Con cientos de páginas, llegar a la 137 a punta de flechita no es navegar. Un Autocomplete dice las tres cosas sin
// explicarlas: se abre y se ve la lista, se teclea y se filtra, se elige y ya.
//
// Cuatro detalles:
//   1. la lista trae TODAS las páginas, pero pinta solo las que se ven (react-window, el «Virtualization» de la
//      documentación del Autocomplete de MUI): con decenas de miles de páginas abre igual de rápido y se desliza hasta la
//      última. Antes se cortaba en 100 y la 101 solo se alcanzaba tecleando;
//   2. abre en la página donde está la tabla, no en la 1;
//   3. filtra por PREFIJO primero (teclear 13 da 13, 130, 131...) y luego por "contiene" (goToPageOptions.js);
//   4. con una sola página no se pinta: sería un control que no lleva a ningún lado.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaGoToPage con defaultProps y
// styleOverrides de sus partes: root, field.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useMemo, useRef} from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import {List} from 'react-window';

import {filterPages, pageNumbersOf} from '@/DataTable/goToPageOptions.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaGoToPage)
const THEME_NAME = 'CalcitaGoToPage';
const GoToRoot = piecePart(THEME_NAME, 'Root', Stack);
const GoToField = piecePart(THEME_NAME, 'Field', Autocomplete);

// alto de cada página en la lista: el de una opción de MUI, 36 px desde «sm» y 48 en el teléfono (MUI les da 48 de alto
// mínimo ahí). OJO: react-window acomoda cada renglón con este número; si no es el alto real, se encimarían
const OPTION_HEIGHT = 36;
const PHONE_OPTION_HEIGHT = 48;
// lo más alto que crece la lista y el margen de arriba y abajo que MUI les da a sus listas
const LISTBOX_MAX_HEIGHT = 240;
const LISTBOX_PADDING = 8;
// renglones de más que se pintan arriba y abajo de lo visible, para que no parpadee al deslizar
const OVERSCAN_ROWS = 5;

/**
 * Un renglón de la lista: la opción que armó MUI (role="option", resaltado, clic) acomodada donde dice react-window.
 *
 * @param {{index: number, style: object, pageOptions: Array<[object, number]>}} props
 */
function PageOption({index, style, pageOptions}) {
    const [{key, ...optionProps}, pageNumber] = pageOptions[index];

    return (
        <Typography key={key} component="li" {...optionProps} noWrap style={{...style, top: (style.top ?? 0) + LISTBOX_PADDING}}>
            {pageNumber}
        </Typography>
    );
}

/**
 * La lista del Autocomplete con react-window (el adaptador de la documentación de MUI).
 *
 * MUI le pasa sus props de lista (role="listbox", id, eventos) y cada opción ya armada como [props, página] (ver
 * renderOption en GoToPage). Al abrir, se acomoda en la página elegida.
 *
 * @param {object} props
 * @param {Array<[object, number]>} props.children las opciones ya armadas por MUI
 * @param {import('react').Ref<HTMLDivElement>} [props.ref]
 * @param {number} props.pageCount cuántas páginas tiene la tabla: con todas en la lista, nadie ha tecleado
 * @param {{current: object|null}} props.pageListRef la API de react-window, para deslizar hasta una página
 * @param {{current: Map<number, number>}} props.pageIndexesRef se llena con página → lugar en la lista, para seguir con el
 *     teclado a la resaltada
 * @param {string} [props.className]
 */
function PageListbox({children: pageOptions, ref, pageCount, pageListRef, pageIndexesRef, className, style, ...listboxProps}) {
    const isWideScreen = useMediaQuery((theme) => theme.breakpoints.up('sm'), {noSsr: true});
    const optionHeight = isWideScreen ? OPTION_HEIGHT : PHONE_OPTION_HEIGHT;
    const listHeight = Math.min(pageOptions.length * optionHeight, LISTBOX_MAX_HEIGHT);

    // dónde quedó cada página en la lista filtrada
    useEffect(() => {
        const pageIndexes = new Map();
        pageOptions.forEach(([, pageNumber], pageIndex) => pageIndexes.set(pageNumber, pageIndex));
        pageIndexesRef.current = pageIndexes;
    }, [pageOptions, pageIndexesRef]);

    // al abrir sin teclear (la lista trae TODAS las páginas) se acomoda en la página elegida, la opción que MUI marca como
    // seleccionada; tecleando se queda arriba, en la primera que coincide.
    // OJO: no va en un useEffect al montar: en ese momento react-window todavía no guarda su contenedor y scrollToRow no
    // hace nada. Se hace cuando react-window entrega su API ya con el contenedor (listRef como función), una sola vez por
    // lista armada: después no pelea con quien desliza
    const placedListElementsRef = useRef(new WeakSet());
    const keepListApi = (listApi) => {
        pageListRef.current = listApi;
        const listElement = listApi?.element;
        if (!listElement || placedListElementsRef.current.has(listElement)) {
            return;
        }
        placedListElementsRef.current.add(listElement);
        if (pageOptions.length !== pageCount) {
            return;
        }
        const selectedIndex = pageOptions.findIndex(([optionProps]) => optionProps['aria-selected'] === true);
        if (selectedIndex >= 0) {
            listApi.scrollToRow({index: selectedIndex, align: 'center'});
        }
    };

    return (
        <div ref={ref} {...listboxProps}>
            <List
                // OJO: react-window le pone role="list" a su contenedor; las opciones tienen que ser de la lista de MUI
                // (role="listbox", el div de afuera) para que un lector de pantalla las anuncie como opciones del selector
                role="none"
                className={className}
                listRef={keepListApi}
                // OJO: otra cantidad de páginas (al teclear) arma la lista de nuevo y la regresa arriba
                key={pageOptions.length}
                rowCount={pageOptions.length}
                rowHeight={optionHeight}
                rowComponent={PageOption}
                rowProps={{pageOptions}}
                style={{height: listHeight + 2 * LISTBOX_PADDING, width: '100%', boxSizing: 'border-box'}}
                overscanCount={OVERSCAN_ROWS}
                tagName="ul"
            />
        </div>
    );
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
    const {page, pageCount, onChange, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('table', texts);
    const {formatNumber} = useFormatters();
    // la persona cuenta desde 1 y el estado de la tabla desde 0: la conversión vive AQUÍ y en ningún otro lado
    const pageNumbers = useMemo(() => pageNumbersOf(pageCount), [pageCount]);
    const pageListRef = useRef(null);
    const pageIndexesRef = useRef(new Map());

    // guard clause: con una página no hay a dónde ir
    if (pageCount <= 1) {
        return null;
    }

    // con las flechas del teclado, la lista desliza hasta la página resaltada (react-window no la tiene pintada)
    const scrollToHighlightedPage = (event, highlightedPageNumber) => {
        const highlightedIndex = pageIndexesRef.current.get(highlightedPageNumber);
        if (highlightedIndex !== undefined) {
            pageListRef.current?.scrollToRow({index: highlightedIndex, align: 'auto'});
        }
    };

    return (
        <GoToRoot direction="row" spacing={0.75} ownSx={{alignItems: 'baseline'}}>
            <Typography variant="body2" color="text.secondary" noWrap>{t('goToPage.page')}</Typography>
            <GoToField
                size="small"
                disableClearable
                disableListWrap
                openOnFocus
                autoHighlight
                options={pageNumbers}
                filterOptions={filterPages}
                value={page + 1}
                isOptionEqualToValue={(option, selectedValue) => option === selectedValue}
                getOptionLabel={(option) => String(option)}
                // cada opción viaja armada a PageListbox, que pinta solo las que se ven
                renderOption={(optionProps, pageNumber) => [optionProps, pageNumber]}
                onHighlightChange={scrollToHighlightedPage}
                onChange={(event, selectedPageNumber) => {
                    if (selectedPageNumber !== null && selectedPageNumber - 1 !== page) {
                        onChange(selectedPageNumber - 1);
                    }
                }}
                ownSx={{width: 78, '& .MuiAutocomplete-endAdornment': {right: 0}}}
                slotProps={{listbox: {component: PageListbox, pageCount, pageListRef, pageIndexesRef}}}
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
