// Una caja de búsqueda que sube a la barra de la app, como el buscador de las ventanas de macOS: sin usar se encoge a la
// lupa, al picarla (o llegar con Tab) se estira, y con texto se queda abierta. En el teléfono con cápsulas flota arriba con
// las demás; sin barra en cápsulas se queda donde la pantalla la puso. Escape borra lo escrito y la suelta.
//
//   <BarSearch value={query} onChange={setQuery} placeholder="Buscar por título o etiqueta" />
//
// La usan la tabla de servidor (searchInBar) y cualquier pantalla que busque en lo suyo (Tareas). Con inBar={false} es la
// misma caja dentro de la pantalla.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaBarSearch con defaultProps y
// styleOverrides de sus partes: field.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';

import BarActions from '@/appShell/BarActions.jsx';
import {BAR_CAPSULE_HEIGHT_PIXELS} from '@/appShell/BarCapsule.jsx';
import {PHONE_MEDIA_QUERY} from '@/appShell/shellSizes.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaBarSearch)
const THEME_NAME = 'CalcitaBarSearch';
const SearchField = piecePart(THEME_NAME, 'Field', TextField);

// ancho de la caja dentro de la pantalla en escritorio: cabe un texto de ayuda como «Buscar por pedido, cliente o producto…».
// OJO: con 280 se cortaba («…cliente o pro»); en el teléfono la caja toma todo el ancho
const SEARCH_BOX_MIN_WIDTH_PIXELS = 400;
// en la barra un poco más angosta: comparte el renglón con el título y las cápsulas
const SEARCH_IN_BAR_WIDTH_PIXELS = 380;

/**
 * @param {object} props
 * @param {string} props.value lo escrito
 * @param {(value: string) => void} props.onChange recibe el texto, no el evento
 * @param {string} props.placeholder ya traducido: qué se busca («Buscar por título o etiqueta»); también es su nombre para el
 *     lector de pantalla
 * @param {boolean} [props.inBar] en la barra de la app (por omisión) o dentro de la pantalla
 * @param {boolean} [props.collapsible] en la barra, sin usar se encoge a la lupa; por omisión sí (false: siempre abierta)
 * @param {number} [props.order] en qué lugar va entre las cápsulas de la barra (por omisión la primera)
 * @param {() => void} [props.onFocus]
 * @param {() => void} [props.onBlur]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef] la caja, para enfocarla desde afuera (un atajo «/»)
 */
export default function BarSearch(props) {
    // lo que el proyecto puso en su tema (components.CalcitaBarSearch.defaultProps) y encima lo que llega aquí
    const {value, onChange, placeholder, inBar = true, collapsible = true, order = 0, onFocus, onBlur, inputRef, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const [isFocused, setIsFocused] = useState(false);
    // en la barra, chica cuando no se usa: ni tiene el foco ni tiene texto
    const isCompact = inBar && collapsible && !isFocused && !value;
    const searchBox = (
        <SearchField
            type="search"
            size="small"
            inputRef={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => {
                setIsFocused(true);
                onFocus?.();
            }}
            onBlur={() => {
                setIsFocused(false);
                onBlur?.();
            }}
            // Escape borra lo escrito y suelta la caja (en la barra, regresa a la lupa)
            onKeyDown={(event) => {
                if (event.key === 'Escape') {
                    onChange('');
                    event.currentTarget.querySelector('input')?.blur();
                }
            }}
            placeholder={placeholder}
            ownSx={{
                minWidth: {xs: 0, md: inBar ? 0 : SEARCH_BOX_MIN_WIDTH_PIXELS},
                // la × del navegador para type="search" no va: la caja se borra con Escape
                '& input[type="search"]::-webkit-search-cancel-button': {WebkitAppearance: 'none', display: 'none'},
            }}
            slotProps={{
                input: {startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>},
                htmlInput: {'aria-label': placeholder},
            }}
        />
    );

    if (!inBar) {
        return searchBox;
    }

    // en la barra: la caja ya es su propia cápsula (bare), del alto y la forma de las demás y más angosta.
    // OJO: la barra es un Paper y el tema le pone al campo el radio de «campo dentro de tarjeta», con el lente
    // (body[data-glass-lens] .MuiPaper-root …) aún más específica: por eso las tres clases (con menos salía con esquinas de
    // 12 px y no en cápsula; medido en Chrome). La lupa no atrapa el clic: lo deja pasar a la caja, que es la que se enfoca
    return (
        <BarActions label={placeholder} bare order={order}
                    sx={(theme) => ({
                        // en el teléfono flota arriba junto a las demás cápsulas. Su lugar SIEMPRE ocupa lo libre del renglón y
                        // la caja va pegada a la derecha: así se abre de derecha a izquierda y regresa igual (el ancho pasa de 48 px
                        // a 100 % con transición). OJO: antes el lugar brincaba de golpe (flex-grow no se anima) y la caja crecía
                        // de izquierda a derecha. El hueco de la izquierda deja pasar el dedo a lo de abajo; solo la caja lo recibe
                        [PHONE_MEDIA_QUERY]: {
                            flexGrow: 1, minWidth: 0, justifyContent: 'flex-end', pointerEvents: 'none',
                            '& .MuiTextField-root': {pointerEvents: 'auto'},
                        },
                        '& .MuiTextField-root': {
                            width: isCompact ? BAR_CAPSULE_HEIGHT_PIXELS : SEARCH_IN_BAR_WIDTH_PIXELS,
                            minWidth: 0,
                            transition: theme.transitions.create('width', {duration: theme.transitions.duration.short}),
                            '@media (prefers-reduced-motion: reduce)': {transition: 'none'},
                            [PHONE_MEDIA_QUERY]: {width: isCompact ? BAR_CAPSULE_HEIGHT_PIXELS : '100%'},
                        },
                        '& .MuiFormControl-root .MuiInputBase-root.MuiOutlinedInput-root': {
                            height: BAR_CAPSULE_HEIGHT_PIXELS, borderRadius: '999px', cursor: isCompact ? 'pointer' : 'text',
                        },
                        '& .MuiInputAdornment-root': {pointerEvents: 'none'},
                        '& input::placeholder': {opacity: isCompact ? 0 : undefined},
                    })}>
            {searchBox}
        </BarActions>
    );
}
