// La lista de transferencia: dos columnas, «Disponibles» y «Elegidos», y botones para pasar de una a otra. Para elegir
// muchos de una lista larga viendo siempre qué quedó de cada lado (los compradores de una subasta, las sucursales donde
// puede comprar un cliente). Al formulario llega la lista de los elegidos, en el orden en que se pasaron.
//
// Cada columna trae su título con cuántos tiene, su buscador (searchable) y su casilla de «todos los que se ven» (con algo
// buscado, solo esos). Se marcan los que se quieren pasar (clic o espacio) y se pasan con ›; » pasa todos los de la
// columna. Doble clic pasa uno directo. En el teléfono las columnas van una debajo de otra y los botones apuntan hacia
// abajo y arriba. Va fuera de una FormSection: necesita el ancho completo.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaTransferListInput con defaultProps y
// styleOverrides de sus partes: root, list, actions.
//
// Genérico del paquete: function (regla de la casa).
import {useId, useState} from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {selectAllStateOf} from '@/inputs/selectAllState.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// lo alto de cada columna antes de deslizar
const DEFAULT_LIST_HEIGHT = 280;
// en el teléfono los botones apuntan hacia abajo (pasar) y hacia arriba (regresar)
const PHONE_ROTATION = Object.freeze({transform: {xs: 'rotate(90deg)', md: 'none'}});

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaTransferListInput)
const THEME_NAME = 'CalcitaTransferListInput';
const TransferRoot = piecePart(THEME_NAME, 'Root', Stack);
const TransferList = piecePart(THEME_NAME, 'List', Paper);
const TransferActions = piecePart(THEME_NAME, 'Actions', Stack);

/**
 * Un texto sin acentos ni mayúsculas, para que «queretaro» encuentre «Querétaro».
 *
 * @param {unknown} text
 * @returns {string}
 */
function plainTextOf(text) {
    return String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/**
 * Una columna: su título con cuántos tiene, su buscador, su casilla de «todos los que se ven» y sus renglones.
 *
 * @param {object} props
 */
function TransferColumn({title, items, markedValues, onMark, onMarkMany, onMoveOne, searchable, searchLabel, emptyText, listHeight, disabled, t}) {
    const titleId = useId();
    const [searchText, setSearchText] = useState('');
    const wantedText = plainTextOf(searchText);
    const visibleItems = wantedText
        ? items.filter((item) => plainTextOf(`${item.label} ${item.description ?? ''}`).includes(wantedText))
        : items;
    const visibleValues = visibleItems.filter((item) => !item.disabled).map((item) => item.value);
    const markState = selectAllStateOf(markedValues, visibleValues);

    return (
        <TransferList variant="outlined" ownSx={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
            <Stack direction="row" sx={{alignItems: 'center', gap: 1, px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider'}}>
                <Checkbox size="small" sx={{p: 0.5}} disabled={disabled || visibleValues.length === 0}
                          checked={markState.allChosen} indeterminate={markState.someChosen}
                          onChange={() => onMarkMany(markState.toggled())}
                          slotProps={{input: {'aria-label': t('transfer.markVisible', {list: title})}}} />
                <Typography id={titleId} variant="subtitle2" sx={{flexGrow: 1}}>{title}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {markedValues.length > 0 ? t('transfer.markedOf', {marked: markedValues.length, count: items.length}) : items.length}
                </Typography>
            </Stack>
            {searchable && (
                <TextField size="small" type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)}
                           placeholder={searchLabel} disabled={disabled} sx={{m: 1}}
                           slotProps={{htmlInput: {'aria-label': `${searchLabel} · ${title}`}}} />
            )}
            <List dense role="listbox" aria-labelledby={titleId} aria-multiselectable="true"
                  sx={{height: listHeight, overflowY: 'auto', py: 0}}>
                {visibleItems.length === 0 && (
                    // vacía de verdad o vacía por lo buscado: no es lo mismo y se dice distinto
                    <Typography variant="body2" color="text.secondary" sx={{px: 2, py: 1.5}}>
                        {items.length > 0 ? t('transfer.noMatches', {text: searchText.trim()}) : emptyText}
                    </Typography>
                )}
                {visibleItems.map((item) => {
                    const isMarked = markedValues.includes(item.value);
                    return (
                        <ListItemButton key={item.value} role="option" aria-selected={isMarked} disabled={disabled || item.disabled}
                                        onClick={() => onMark(item.value)} onDoubleClick={() => onMoveOne(item.value)} sx={{py: 0.25}}>
                            <ListItemIcon sx={{minWidth: 32}}>
                                <Checkbox size="small" edge="start" tabIndex={-1} disableRipple checked={isMarked} sx={{p: 0.5}} />
                            </ListItemIcon>
                            <ListItemText primary={item.label} secondary={item.description} />
                        </ListItemButton>
                    );
                })}
            </List>
        </TransferList>
    );
}

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {import('react').ReactNode} [props.label] ya traducida
 * @param {Array<string|number>|null|undefined} props.value los elegidos
 * @param {(values: Array<string|number>) => void} props.onChange
 * @param {() => void} [props.onBlur]
 * @param {Array<{value: string|number, label: string, description?: string, disabled?: boolean}>} props.options todos
 * @param {string} [props.availableTitle] ya traducido; por omisión «Disponibles»
 * @param {string} [props.chosenTitle] ya traducido; por omisión «Elegidos»
 * @param {boolean} [props.searchable] un buscador en cada columna (por omisión, con más de 8 opciones)
 * @param {number} [props.listHeight] lo alto de cada columna, en px
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText] ya traducida
 * @param {boolean} [props.disabled]
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function TransferListInput(props) {
    const {
        name, label, value, onChange, onBlur, options, availableTitle, chosenTitle, searchable, listHeight = DEFAULT_LIST_HEIGHT, error,
        helperText = ' ', disabled = false, sx, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const generatedId = useId();
    const inputId = `${name ?? 'transfer'}-${generatedId}`;
    const errorText = translateValidationMessage(t, error);
    const chosenValues = Array.isArray(value) ? value : [];
    // lo marcado para pasar, de cada lado
    const [markedAvailable, setMarkedAvailable] = useState([]);
    const [markedChosen, setMarkedChosen] = useState([]);
    const available = options.filter((option) => !chosenValues.includes(option.value));
    // los elegidos en el orden en que se pasaron
    const chosen = chosenValues.map((chosenValue) => options.find((option) => option.value === chosenValue)).filter(Boolean);
    const isSearchable = searchable ?? options.length > 8;
    const titles = {available: availableTitle ?? t('transfer.available'), chosen: chosenTitle ?? t('transfer.chosen')};

    const change = (values) => {
        onChange(values);
        onBlur?.();
    };
    const toggleIn = (setMarked) => (itemValue) => setMarked((current) => (
        current.includes(itemValue) ? current.filter((markedValue) => markedValue !== itemValue) : [...current, itemValue]
    ));
    const moveToChosen = (values) => {
        change([...chosenValues, ...values.filter((itemValue) => !chosenValues.includes(itemValue))]);
        setMarkedAvailable((current) => current.filter((markedValue) => !values.includes(markedValue)));
    };
    const moveToAvailable = (values) => {
        change(chosenValues.filter((chosenValue) => !values.includes(chosenValue)));
        setMarkedChosen((current) => current.filter((markedValue) => !values.includes(markedValue)));
    };
    const movableOf = (items) => items.filter((item) => !item.disabled).map((item) => item.value);
    const actionButton = (titleKey, Icon, onClick, isDisabled) => (
        <Tooltip title={t(titleKey)}>
            <span>
                <Button variant="outlined" size="small" aria-label={t(titleKey)} disabled={disabled || isDisabled} onClick={onClick}
                        sx={{minWidth: 40, px: 1}}>
                    <Icon fontSize="small" sx={PHONE_ROTATION} />
                </Button>
            </span>
        </Tooltip>
    );

    const lists = (
        <TransferRoot direction={{xs: 'column', md: 'row'}} ownSx={{gap: 1.5, alignItems: 'stretch', ...sx}} id={inputId}>
            <TransferColumn title={titles.available} items={available} markedValues={markedAvailable}
                            onMark={toggleIn(setMarkedAvailable)} onMarkMany={setMarkedAvailable} onMoveOne={(itemValue) => moveToChosen([itemValue])}
                            searchable={isSearchable} searchLabel={t('transfer.search')} emptyText={t('transfer.emptyAvailable')}
                            listHeight={listHeight} disabled={disabled} t={t} />
            <TransferActions direction={{xs: 'row', md: 'column'}} ownSx={{gap: 1, justifyContent: 'center', alignItems: 'center'}}>
                {actionButton('transfer.moveMarked', ChevronRightRoundedIcon, () => moveToChosen(markedAvailable), markedAvailable.length === 0)}
                {actionButton('transfer.moveAll', KeyboardDoubleArrowRightRoundedIcon, () => moveToChosen(movableOf(available)), movableOf(available).length === 0)}
                {actionButton('transfer.returnMarked', ChevronLeftRoundedIcon, () => moveToAvailable(markedChosen), markedChosen.length === 0)}
                {actionButton('transfer.returnAll', KeyboardDoubleArrowLeftRoundedIcon, () => moveToAvailable(movableOf(chosen)), movableOf(chosen).length === 0)}
            </TransferActions>
            <TransferColumn title={titles.chosen} items={chosen} markedValues={markedChosen}
                            onMark={toggleIn(setMarkedChosen)} onMarkMany={setMarkedChosen} onMoveOne={(itemValue) => moveToAvailable([itemValue])}
                            searchable={isSearchable} searchLabel={t('transfer.search')} emptyText={t('transfer.emptyChosen')}
                            listHeight={listHeight} disabled={disabled} t={t} />
        </TransferRoot>
    );

    const field = (
        <div>
            {lists}
            <FormHelperText error={Boolean(errorText)} role={errorText ? 'alert' : undefined}>{errorText ?? helperText}</FormHelperText>
        </div>
    );
    // sin etiqueta va solo (la pantalla pone el título a su manera)
    return label ? <FieldFrame inputId={inputId} label={label}>{field}</FieldFrame> : field;
}
