// "Ir a la página N", como un selector con búsqueda.
//
// Con cientos de páginas, llegar a la 137 a punta de flechita no es navegar. Un Autocomplete dice las tres cosas sin
// explicarlas: se abre y se ve la lista, se teclea y se filtra, se elige y ya.
//
// Cuatro detalles:
//   1. la lista trae TODAS las páginas, pero pinta solo las que se ven (react-window, el «Virtualization» de la
//      documentación del Autocomplete de MUI): con decenas de miles de páginas abre igual de rápido y se desliza hasta la
//      última. Antes se cortaba en 100 y la 101 solo se alcanzaba tecleando. La lista mide lo que el número más largo, no
//      lo que el campo: con el campo angosto cortaba el «12» y se deslizaba de lado;
//   2. abre en la página donde está la tabla, no en la 1;
//   3. filtra por PREFIJO primero (teclear 13 da 13, 130, 131...) y luego por "contiene" (goToPageOptions.js);
//   4. con una sola página no se pinta: sería un control que no lleva a ningún lado;
//   5. se ve igual que «Filas por página», que va a su lado: el número sin raya, con la letra de la fila, y la flechita de
//      las listas para elegir. Con vidrio el tema le pone a un Autocomplete el botón cuadrado de color del «combo box» de
//      Apple, hecho para los campos en cápsula; en este campo chico se veía fuera de lugar (lo reportaron: «se ve feo»), así
//      que aquí va la flechita doble ⌃⌄ del Select. Sigue siendo el Autocomplete: se teclea, se filtra y se elige.
//      Las mismas reglas de letra que la paginación de MUI (TablePagination): las palabras en body2 del color del texto y el
//      número del tamaño de la fila (14 px). Con gris en las palabras y 15 px en el número se veía chueco junto a «Filas por
//      página» (lo reportaron). OJO: con el dedo el número va en 16, porque el iPhone hace zoom al tocar un campo de letra
//      más chica.
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
import {popUpChevronStylesOf} from '@/theme/components/glassComponents.js';
import {isGlassTheme} from '@/theme/glassSurface.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
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
// lo que ocupa la flechita a la derecha del número (px): el campo mide lo que el número más largo («56», «1200») y esto
const CHEVRON_ROOM_PIXELS = 22;
// la letra del número con el dedo: el iPhone hace zoom al tocar un campo de menos de 16 px
const TOUCH_INPUT_FONT_PIXELS = 16;
// la letra de la fila de la paginación: la que pone MUI en TablePagination (pxToRem(14)), para que el número salga igual
// que el de «Filas por página»
const PAGINATION_FONT_PIXELS = 14;

/**
 * Con vidrio, el botón de la lista es la flechita doble ⌃⌄ del Select (como «Filas por página») y no el botón cuadrado de
 * color del «combo box» que el tema le pone a un Autocomplete. Sin vidrio se queda el ▾ de MUI, igual que el Select.
 *
 * @param {object} theme
 * @returns {object}
 */
function popupIndicatorStylesOf(theme) {
    if (!isGlassTheme(theme)) {
        return {};
    }
    return {
        width: 'auto', height: 'auto', padding: '2px', borderRadius: 0,
        backgroundColor: 'transparent', backgroundImage: 'none', boxShadow: 'none',
        color: (theme.vars ?? theme).palette.action.active,
        '&:hover': {backgroundColor: 'transparent'},
        '&::after': {content: '""', ...popUpChevronStylesOf()},
    };
}
// lo más alto que crece la lista y el margen de arriba y abajo que MUI les da a sus listas
const LISTBOX_MAX_HEIGHT = 240;
const LISTBOX_PADDING = 8;
// lo que la lista necesita además del número (px): los 16 de cada lado que MUI les da a sus opciones y la barra para
// deslizar, que con un ratón en Windows o con «mostrar siempre» en la Mac mide unos 16
const LIST_ROOM_BESIDE_NUMBER_PIXELS = 2 * 16 + 16;
// renglones de más que se pintan arriba y abajo de lo visible, para que no parpadee al deslizar
const OVERSCAN_ROWS = 5;

/**
 * Un renglón de la lista: la opción que armó MUI (role="option", resaltado, clic) acomodada donde dice react-window.
 *
 * @param {{index: number, style: object, pageOptions: Array<[object, number]>}} props
 */
function PageOption({index, style, pageOptions}) {
    const [{key, ...optionProps}, pageNumber] = pageOptions[index];

    // OJO: react-window le da al renglón el 100 % de ancho; con el margen de los lados que el vidrio les pone a las opciones
    // (4 px) se pasaba a la derecha y la lista se deslizaba de lado. De orilla a orilla (left y right en 0) el margen
    // queda adentro, igual por los dos lados
    return (
        <Typography key={key} component="li" {...optionProps} noWrap style={{...style, width: 'auto', right: 0, top: (style.top ?? 0) + LISTBOX_PADDING}}>
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
                // OJO: la clase de lista de MUI le pone overflow auto a los dos lados; de lado nunca se desliza
                style={{height: listHeight + 2 * LISTBOX_PADDING, width: '100%', boxSizing: 'border-box', overflowX: 'hidden'}}
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
 * @param {import('@mui/material').SxProps<import('@mui/material').Theme>} [props.sx] los estilos de esta pantalla, encima de los del tema (en su parte root)
 */
function GoToPageContent(props) {
    // lo que el proyecto puso en su tema (components.CalcitaGoToPage.defaultProps) y encima lo que llega aquí
    const {page, pageCount, onChange, texts, sx, ...unknownProps} = usePieceProps(props, THEME_NAME);
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
        // centrado como la fila de la paginación de MUI («Filas por página» y su lista): con baseline el número quedaba más
        // abajo que «Página»
        <GoToRoot sx={sx} direction="row" spacing={0.75} ownSx={(theme) => ({alignItems: 'center', fontSize: theme.typography.pxToRem(PAGINATION_FONT_PIXELS)})}>
            <Typography variant="body2" noWrap>{t('goToPage.page')}</Typography>
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
                // lo ancho del número más largo y su flechita; la letra de la fila, salvo con el dedo (ver el OJO de arriba)
                ownSx={{
                    width: `calc(${String(pageCount).length}ch + ${CHEVRON_ROOM_PIXELS}px)`,
                    '& .MuiAutocomplete-endAdornment': {right: 0},
                    '&.MuiAutocomplete-hasPopupIcon .MuiAutocomplete-inputRoot': {paddingRight: `${CHEVRON_ROOM_PIXELS}px`},
                    // sin el ancho mínimo de MUI (30 px): con él sobraba espacio entre el número y su flechita. OJO: con dos
                    // clases (inputRoot e input), porque la regla de MUI tiene el mismo peso y se escribe después
                    '& .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {minWidth: 0},
                    // el número del tamaño de la fila, como el de «Filas por página» (MUI le pone fontSize: inherit)
                    '& .MuiInputBase-root': {fontSize: 'inherit', '@media (pointer: coarse)': {fontSize: TOUCH_INPUT_FONT_PIXELS}},
                }}
                slotProps={{
                    listbox: {component: PageListbox, pageCount, pageListRef, pageIndexesRef},
                    popupIndicator: {sx: popupIndicatorStylesOf},
                    // la lista mide lo que el número más largo y no solo lo que el campo (MUI le da el ancho del campo)
                    popper: {sx: {minWidth: `calc(${String(pageCount).length}ch + ${LIST_ROOM_BESIDE_NUMBER_PIXELS}px)`}},
                }}
                renderInput={(params) => (
                    <TextField {...params} variant="standard"
                               slotProps={{
                                   // sin la raya de abajo, como el Select de «Filas por página»
                                   input: {...params.InputProps, disableUnderline: true},
                                   htmlInput: {...params.inputProps, inputMode: 'numeric', 'aria-label': t('goToPage.ariaLabel')},
                               }} />
                )}
            />
            <Typography variant="body2" noWrap>
                {t('goToPage.of', {count: pageCount, total: formatNumber(pageCount)})}
            </Typography>
        </GoToRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const GoToPage = withPieceSlots(GoToPageContent, THEME_NAME);
export default GoToPage;
