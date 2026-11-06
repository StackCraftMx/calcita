// El cajón de búsqueda: un panel que sale de un lado con los campos que filtran una lista (las listas, un rango
// «desde-hasta», unas fechas, un monto con su operador), para cuando los filtros ya no caben arriba de la tabla.
//
// Lo que se cambia adentro es un BORRADOR: la lista no se mueve hasta «Buscar» (no se consulta al servidor con cada tecla).
// «Limpiar» vacía los campos del cajón; «Buscar» manda todos juntos (onApply) y cierra. Un rango al revés («hasta» menor que
// «desde») o una fecha fuera de sus topes se dice en su campo y no deja buscar; nada se borra solo.
//
// Los campos se declaran (filterDrawerFields.js dice cómo viaja cada uno); con kind 'custom' va uno propio (render), o un
// rango propio con sus dos llaves (keys). Para conectarlo a ServerTable con su botón y sus chips: ServerTableFilterDrawer de
// /table.
//
// LAS FECHAS: por omisión, el calendario del navegador (así el cajón no obliga a instalar MUI X). Una app que ya trae
// /date-pickers pone el suyo para que el cajón y sus formularios se vean igual: slots={{dateInput: DateInput}} en el cajón,
// o una vez en el tema para todas las listas (components.CalcitaFilterDrawer.defaultProps.slots). El campo recibe name,
// label, value, onChange, error, helperText, minDate y maxDate: lo mismo que DateInput.
//
// Configurable: de qué lado sale (anchor), su ancho, su título, los textos de sus botones y si los pares («desde» y
// «hasta», operador y número) se ponen uno arriba del otro cuando el cajón es angosto (stackPairsBelow). En el teléfono
// ocupa todo el ancho.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaFilterDrawer con defaultProps y
// styleOverrides de sus partes: paper, header, body, footer y dateInput.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useId, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import CatalogInput from '@/inputs/CatalogInput.jsx';
import CheckboxGroupInput from '@/inputs/CheckboxGroupInput.jsx';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import NumberInput from '@/inputs/NumberInput.jsx';
import SelectInput from '@/inputs/SelectInput.jsx';
import TextInput from '@/inputs/TextInput.jsx';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {
    COMPARISON_OPERATOR, FILTER_FIELD_KIND, comparisonOf, comparisonTextOf, dateRangeBoundsOf, drawerProblemsOf, drawerValuesOf,
    emptyDrawerValuesOf, filterKeysOf,
} from '@/ui/filters/filterDrawerFields.js';
import {todayInZone} from '@/ui/metrics/heatmapScale.js';

/** De qué lado sale el cajón. */
export const FILTER_DRAWER_ANCHOR = Object.freeze({left: 'left', right: 'right'});
const DEFAULT_WIDTH = 380;
// «Cualquiera» de una lista de una sola opción: no es una opción y viaja como '' (sin filtro)
const ANY_OPTION = '__calcita_any__';
// el nombre del cajón para medir su ancho (stackPairsBelow): los pares se apilan con una regla de CSS sobre el cajón, no
// sobre la pantalla (en escritorio el cajón es angosto aunque la pantalla no)
const DRAWER_CONTAINER_NAME = 'calcita-filter-drawer';

/**
 * El campo de fecha de fábrica: el calendario del navegador, sin pedir MUI X; viaja AAAA-MM-DD. Recibe lo mismo que DateInput
 * de /date-pickers (name, label, value, onChange, error, helperText, minDate, maxDate), así que se cambia por ese con
 * slots={{dateInput: DateInput}}.
 *
 * @param {object} props
 */
function BrowserDateInput({name, label, value, onChange, error, helperText, minDate, maxDate, className}) {
    return (
        <TextInput type="date" name={name} label={label} value={value} onChange={onChange} error={error} helperText={helperText} clearable={false}
                   className={className} slotProps={{htmlInput: {min: minDate, max: maxDate}}} />
    );
}

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaFilterDrawer)
const THEME_NAME = 'CalcitaFilterDrawer';
const FilterDrawerHeader = piecePart(THEME_NAME, 'Header', Stack);
const FilterDrawerBody = piecePart(THEME_NAME, 'Body', Stack);
const FilterDrawerFooter = piecePart(THEME_NAME, 'Footer', Stack);
const FilterDrawerDateInput = piecePart(THEME_NAME, 'DateInput', BrowserDateInput);

/**
 * Dos campos lado a lado (desde y hasta, operador y número). Con stackPairsBelow, si el cajón mide menos, uno arriba del
 * otro: con un calendario de MUI X, en un cajón angosto cada fecha quedaba muy apretada.
 *
 * OJO, trampa pagada: las columnas van con minmax(0, …). Con '1fr 1fr' una columna no baja del ancho mínimo de su campo, y
 * el calendario de MUI X no se encoge: empujaba la columna y el «hasta» se salía del cajón (medido en Chrome, 460 px).
 *
 * @param {{label: import('react').ReactNode, inputId: string, children: import('react').ReactNode, template?: string, stackPairsBelow?: number}} props
 */
function PairedField({label, inputId, children, template = 'minmax(0, 1fr) minmax(0, 1fr)', stackPairsBelow}) {
    return (
        <FieldFrame inputId={inputId} label={label}>
            <Box sx={{
                display: 'grid', gridTemplateColumns: template, gap: 1.5, alignItems: 'start',
                ...(stackPairsBelow && {[`@container ${DRAWER_CONTAINER_NAME} (width < ${stackPairsBelow}px)`]: {gridTemplateColumns: 'minmax(0, 1fr)'}}),
            }}>
                {children}
            </Box>
        </FieldFrame>
    );
}

/**
 * Un campo del cajón según su tipo, con las piezas de la casa.
 *
 * @param {object} props
 */
function DrawerField({field, values, setValue, errorOf, today, stackPairsBelow, t}) {
    const fieldId = useId();
    const [key] = filterKeysOf(field);
    switch (field.kind) {
        case FILTER_FIELD_KIND.text:
            return <TextInput label={field.label} value={values[key]} onChange={(text) => setValue(key, text)} placeholder={field.placeholder} />;
        case FILTER_FIELD_KIND.select:
            return (
                <SelectInput label={field.label} value={values[key] || ANY_OPTION} onChange={(chosen) => setValue(key, chosen === ANY_OPTION ? '' : chosen)}
                             options={[{value: ANY_OPTION, label: t('filterDrawer.any')}, ...field.options]} />
            );
        case FILTER_FIELD_KIND.multiSelect:
            return <SelectInput label={field.label} value={values[key]} onChange={(chosen) => setValue(key, chosen)} options={field.options} multiple selectAll checkboxes />;
        case FILTER_FIELD_KIND.catalog:
            return (
                <CatalogInput label={field.label} value={values[key]} onChange={(chosen) => setValue(key, chosen)} options={field.options}
                              multiple={field.multiple} selectAll={field.multiple} checkboxes={field.multiple} formatLabel={field.formatLabel}
                              placeholder={field.placeholder} />
            );
        case FILTER_FIELD_KIND.checkboxes:
            return <CheckboxGroupInput label={field.label} value={values[key]} onChange={(chosen) => setValue(key, chosen)} options={field.options} selectAll={field.selectAll} />;
        case FILTER_FIELD_KIND.numberRange: {
            const [fromKey, toKey] = filterKeysOf(field);
            const numberProps = {decimals: field.decimals ?? 0, prefix: field.prefix, suffix: field.suffix, helperText: ''};
            return (
                <PairedField label={field.label} inputId={`${fieldId}-from`} stackPairsBelow={stackPairsBelow}>
                    <NumberInput label={t('filterDrawer.from')} value={values[fromKey]} onChange={(number) => setValue(fromKey, number)} {...numberProps} />
                    <NumberInput label={t('filterDrawer.to')} value={values[toKey]} onChange={(number) => setValue(toKey, number)} {...numberProps}
                                 error={errorOf(toKey)} />
                </PairedField>
            );
        }
        case FILTER_FIELD_KIND.dateRange: {
            const [fromKey, toKey] = filterKeysOf(field);
            // los topes del campo y cada extremo acota al otro: el calendario no deja escoger fuera ni un rango al revés
            const bounds = dateRangeBoundsOf(field, values, today);
            // el «hasta» sin helperText: deja su renglón vacío debajo del par, como siempre
            return (
                <PairedField label={field.label} inputId={`${fieldId}-from`} stackPairsBelow={stackPairsBelow}>
                    <FilterDrawerDateInput name={fromKey} label={t('filterDrawer.from')} value={values[fromKey]} onChange={(date) => setValue(fromKey, date)}
                                           error={errorOf(fromKey)} helperText="" {...bounds.from} />
                    <FilterDrawerDateInput name={toKey} label={t('filterDrawer.to')} value={values[toKey]} onChange={(date) => setValue(toKey, date)}
                                           error={errorOf(toKey)} {...bounds.to} />
                </PairedField>
            );
        }
        case FILTER_FIELD_KIND.comparison: {
            const parts = comparisonOf(values[key]);
            const operators = field.operators ?? Object.values(COMPARISON_OPERATOR);
            const operator = parts?.operator ?? field.defaultOperator ?? operators[0];
            return (
                <PairedField label={field.label} inputId={`${fieldId}-value`} template="minmax(0, 1fr) minmax(0, 1.2fr)" stackPairsBelow={stackPairsBelow}>
                    <SelectInput label={t('filterDrawer.operator')} value={operator} helperText=""
                                 options={operators.map((option) => ({value: option, label: t(`filterDrawer.operators.${option}`)}))}
                                 onChange={(chosen) => setValue(key, comparisonTextOf(chosen, parts?.value ?? ''))} />
                    <NumberInput label={t('filterDrawer.value')} value={parts?.value ?? ''} decimals={field.decimals ?? 2} prefix={field.prefix} suffix={field.suffix}
                                 helperText="" onChange={(number) => setValue(key, comparisonTextOf(operator, number))} />
                </PairedField>
            );
        }
        case FILTER_FIELD_KIND.custom: {
            // el contrato del campo propio: su valor, todo el borrador (values y setValue: un rango propio acota un extremo con
            // el otro o escribe en la otra llave), sus llaves y lo que esté mal en cada una, ya dicho (errors)
            const keys = filterKeysOf(field);
            const errors = Object.fromEntries(keys.map((fieldKey) => [fieldKey, errorOf(fieldKey)]).filter(([, text]) => text));
            return field.render({value: values[key], onChange: (next) => setValue(key, next), values, setValue, keys, errors});
        }
        default:
            return null;
    }
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object[]} props.fields los campos (filterDrawerFields.js): {name, label, kind, options?, keys?, prefix?, suffix?, decimals?, operators?,
 *     minDate?, maxDate?, disablePast?, disableFuture?, render?, isBackwards?…}
 * @param {Record<string, unknown>} props.values los filtros puestos hoy (de ahí sale el borrador al abrir)
 * @param {(values: Record<string, unknown>) => void} props.onApply todos los campos del cajón juntos, al picar «Buscar»
 * @param {'left'|'right'} [props.anchor] de qué lado sale (FILTER_DRAWER_ANCHOR); por omisión la derecha
 * @param {number} [props.width] su ancho en escritorio, en px
 * @param {string} [props.title] ya traducido; por omisión «Filtros»
 * @param {string} [props.applyLabel] ya traducido; por omisión «Buscar»
 * @param {boolean} [props.closeOnApply] por omisión sí
 * @param {number} [props.stackPairsBelow] en px: si el cajón mide menos, cada par («desde» y «hasta», operador y número) va uno
 *     arriba del otro (también en el teléfono, donde ocupa todo el ancho). Sin la opción, lado a lado como siempre
 * @param {import('react').ReactNode} [props.children] algo más abajo de los campos (una nota, un enlace)
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function FilterDrawerContent(props) {
    const {
        open, onClose, fields, values, onApply, anchor = FILTER_DRAWER_ANCHOR.right, width = DEFAULT_WIDTH, title, applyLabel,
        closeOnApply = true, stackPairsBelow, children, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const {timeZone} = useToolkitSettings();
    const {formatDate} = useFormatters();
    const titleId = useId();
    const [draft, setDraft] = useState(() => drawerValuesOf(fields, values));
    // cada vez que se abre, el borrador empieza de lo que hay puesto (lo de la vez pasada sin buscar no se queda)
    useEffect(() => {
        if (open) {
            setDraft(drawerValuesOf(fields, values));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);
    // hoy en la zona del producto: el tope de disableFuture y disablePast
    const today = todayInZone(timeZone);
    const problems = drawerProblemsOf(fields, draft, {today});
    const hasProblems = Object.keys(problems).length > 0;
    // lo que está mal en una llave, ya dicho (con la fecha del tope que se pasó)
    const errorOf = (key) => (problems[key] ? t(`filterDrawer.${problems[key].problem}`, {date: formatDate(problems[key].date)}) : undefined);
    const setValue = (key, value) => setDraft((current) => ({...current, [key]: value}));
    const apply = () => {
        onApply(draft);
        if (closeOnApply) {
            onClose();
        }
    };

    return (
        // en la capa de las ventanas (modal), no en la del menú lateral (drawer): la barra de la app va encima del menú a
        // propósito y, en la misma capa, tapaba el título y la × del cajón (medido en Chrome sin vidrio y con el minimalista)
        <Drawer
            anchor={anchor}
            open={open}
            onClose={onClose}
            sx={{zIndex: (theme) => theme.zIndex.modal}}
            slotProps={{paper: {'aria-labelledby': titleId, className: `${THEME_NAME}-paper`, sx: {width: {xs: '100%', sm: width}, maxWidth: '100%'}}}}
        >
            <Box component="form" noValidate
                 sx={{display: 'flex', flexDirection: 'column', height: '100%', ...(stackPairsBelow && {containerType: 'inline-size', containerName: DRAWER_CONTAINER_NAME})}}
                 onSubmit={(event) => {
                     event.preventDefault();
                     if (!hasProblems) {
                         apply();
                     }
                 }}>
                <FilterDrawerHeader direction="row" ownSx={{alignItems: 'center', gap: 1, px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider'}}>
                    <IconButton aria-label={t('filterDrawer.close')} onClick={onClose} edge="start"><CloseRoundedIcon /></IconButton>
                    <Typography id={titleId} variant="h6" component="h2" sx={{flexGrow: 1}}>{title ?? t('filterDrawer.title')}</Typography>
                </FilterDrawerHeader>
                <FilterDrawerBody spacing={1} ownSx={{flex: 1, overflowY: 'auto', px: 2.5, py: 2}}>
                    {fields.map((field) => (
                        <DrawerField key={field.name} field={field} values={draft} setValue={setValue} errorOf={errorOf} today={today}
                                     stackPairsBelow={stackPairsBelow} t={t} />
                    ))}
                    {children}
                </FilterDrawerBody>
                <FilterDrawerFooter direction="row" ownSx={{gap: 1, justifyContent: 'flex-end', px: 2.5, py: 1.5, borderTop: 1, borderColor: 'divider'}}>
                    <Button onClick={() => setDraft(emptyDrawerValuesOf(fields))}>{t('filterDrawer.clear')}</Button>
                    <Button type="submit" variant="contained" disabled={hasProblems}>{applyLabel ?? t('filterDrawer.apply')}</Button>
                </FilterDrawerFooter>
            </Box>
        </Drawer>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const FilterDrawer = withPieceSlots(FilterDrawerContent, THEME_NAME);
export default FilterDrawer;
