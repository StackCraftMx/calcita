// El formulario agrupado de Apple (el de Ajustes y el de la hoja «Nuevo evento» de Calendario): una tarjeta redonda con
// renglones, el título de la sección arriba de la tarjeta y la explicación abajo. Dentro de una FormSection cada campo del
// framework (TextInput, NumberInput, SelectInput, CatalogInput, ColorInput, DateInput y sus versiones de formik y de
// react-hook-form) se pinta solo como renglón: la etiqueta a la izquierda y el campo a la derecha.
//
//   <FormSection title="Datos del cliente" footer="Le enviaremos la factura al correo.">
//       <FormTextField name="name" label="Nombre" />
//       <FormTextField name="email" label="Correo" />
//       <FormRow label="Recibir avisos"><Switch /></FormRow>
//   </FormSection>
//
// Las reglas, de la guía de Apple (HIG «Text fields», «Pickers», «Combo boxes» y sus imágenes):
//   - la etiqueta siempre a la vista, a la izquierda (la pista se va al escribir; la etiqueta no);
//   - el campo es un «pozo» parejo con esquinas de 12 px (fieldWellStylesOf): gris tenue en claro y más claro que la
//     tarjeta en oscuro, con la letra clara, como el campo de la imagen de Apple. Antes iba transparente y el relleno solo
//     salía con el cursor encima, en cuadro: no se entendía dónde escribir (lo reportaron);
//   - la fecha es el mismo campo que los demás, a todo lo ancho (en cápsula al final del renglón quedaba descuadrada), con
//     la letra del texto (no del color del tema: en oscuro el naranja ahí «se veía horrible», lo reportaron);
//   - al escribir, un aro tenue del color principal y la etiqueta del color del tema; con error, aro y etiqueta en rojo y
//     el mensaje debajo del campo;
//   - una línea fina entre renglones, que empieza donde empieza el texto.
//
// Los campos pueden ir directo o dentro de lo que el proyecto necesite (un Grid de dos columnas, un Stack, un componente
// suyo): cada renglón dibuja su propia línea ARRIBA y la tarjeta sube su contenido un píxel y lo recorta, así la línea del
// primero queda escondida. OJO: antes la línea se dibujaba entre dos hermanos seguidos y con un Grid en medio desaparecían
// todas (lo señalaron en una revisión: obligaba a «la forma Calcita»).
//
// En el teléfono la etiqueta se lleva el 38 % del renglón y un nombre largo («Correo adicional (notificaciones)») se parte en
// tres renglones: con labelPlacement={FORM_LABEL_PLACEMENT.topOnPhone} la etiqueta sube arriba del campo por debajo de `sm`
// (como en los formularios de iOS y de Android); en pantallas más anchas, igual que siempre. Por omisión `side`, como antes.
//
// Lo ancho de la columna de las etiquetas, por sección (labelWidth): por omisión el 38 % del renglón hasta 200 px, lo de
// siempre. Una lista de documentos lleva nombres de cien caracteres y a la derecha solo sus botones: con 200 px el nombre se
// partía en ocho renglones. Con labelWidth={FORM_LABEL_WIDTH.auto} el nombre se lleva lo que sobre y el campo solo lo que
// ocupa; con un ancho ('320px', '50%' o un número en px) la columna mide eso. Las demás secciones de la pantalla no cambian.
// En el teléfono lo que sobra es poco: con auto, mejor junto con labelPlacement topOnPhone (el nombre arriba, el campo abajo).
//
// Sin tarjeta (variant={FORM_SECTION_VARIANT.bare}): los mismos renglones y la misma forma de los campos, sin el lienzo, sin
// la línea entre renglones y sin el aire del renglón (relleno y alto mínimo). Para un campo dentro de algo que ya trae su
// marco y su aire, como la celda de una tabla: ahí la tarjeta dibujaba una caja dentro de otra y corría el campo. Con
// labelWidth={0} el campo se lleva el renglón entero, sin hueco a la izquierda (antes quedaban los 16 px de separación), y
// la etiqueta no se ve pero el lector de pantalla la sigue leyendo: el nombre de la columna ya lo dice en pantalla.
//
// Un renglón con `required` lleva un asterisco en la etiqueta (requiredMark.js: en el estilo, así la etiqueta sigue diciendo lo
// mismo y el lector de pantalla no lo lee; el campo ya dice que es obligatorio).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaFormSection (sus partes root, title, card y
// footer; sin tarjeta no hay card) y components.CalcitaFormRow (root, label y control; el asterisco es
// '&[data-required]::after' de label), con styleOverrides y defaultProps. Los colores y las esquinas de los campos, más
// fácil con createToolkitTheme({fields}): fields.radius pone las mismas esquinas a todos los campos de la app, dentro y
// fuera de una sección (999 = la cápsula de los renglones también en un campo suelto).
//
// Genérico del paquete: function (regla de la casa).
import {useId, useMemo} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {styled, useThemeProps} from '@mui/material/styles';

import {FormSectionContext, useFormSectionLayout} from '@/inputs/formLayoutContext.js';
import {REQUIRED_LABEL_ATTRIBUTE, requiredMarkSxOf} from '@/inputs/requiredMark.js';
import {PANEL_RADIUS, accentTextStylesOf, fieldVariablesOf, fieldWellFromVariablesOf} from '@/theme/glassSurface.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

/**
 * Dónde va la etiqueta de cada renglón: a la izquierda siempre (side, lo de siempre) o arriba del campo en el teléfono
 * (topOnPhone: por debajo de `sm` en el tema; más ancho, a la izquierda).
 */
export const FORM_LABEL_PLACEMENT = Object.freeze({side: 'side', topOnPhone: 'topOnPhone'});

/**
 * Lo ancho de la columna de las etiquetas que no es un número: auto = la etiqueta se lleva lo que sobre y el campo solo lo
 * que ocupa (una lista de documentos con su cargador).
 */
export const FORM_LABEL_WIDTH = Object.freeze({auto: 'auto'});

/**
 * Cómo se pinta la sección: con su tarjeta (card, lo de siempre) o sin ella (bare: los renglones sin lienzo, sin líneas y sin
 * su aire, para un campo dentro de la celda de una tabla).
 */
export const FORM_SECTION_VARIANT = Object.freeze({card: 'card', bare: 'bare'});

/**
 * Cómo van los campos dentro de la celda de una tabla: como en una FormSection sin tarjeta y sin columna de etiqueta (la
 * forma de la casa, la etiqueta solo para el lector). Lo usan la tabla de renglones (RepeatingFields) y la del servidor.
 */
export const TABLE_CELL_FIELD_LAYOUT = Object.freeze({labelPlacement: FORM_LABEL_PLACEMENT.side, labelWidth: 0, variant: FORM_SECTION_VARIANT.bare});

/** La clase de cada renglón: la sección le dibuja su línea de arriba, esté donde esté adentro de la tarjeta. */
export const FORM_ROW_CLASS = 'calcita-form-row';

// el renglón: alto mínimo para el dedo, su aire arriba y abajo, y lo ancho de la columna de las etiquetas
const ROW_MIN_HEIGHT_PIXELS = 52;
const ROW_PADDING_BLOCK_PIXELS = 8;
const LABEL_COLUMN = Object.freeze({share: '38%', maxPixels: 200});
// con la etiqueta en auto, lo más que se lleva el campo: el nombre del documento conserva al menos la otra mitad
const AUTO_CONTROL_MAX_SHARE = '50%';
// lo que la etiqueta baja para quedar en la misma línea que el texto del campo (el campo mide 40 px y su letra 24 px)
const LABEL_TOP_PIXELS = 8;
// con labelWidth 0 la etiqueta no se ve pero el lector de pantalla la sigue leyendo: el campo conserva su nombre
const VISUALLY_HIDDEN_SX = Object.freeze({
    position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
});
// el aro al escribir y con error (por ciento del color) y su grosor
const RING = Object.freeze({focusPercent: 45, errorPercent: 60, pixels: 2});

/**
 * Los campos de MUI dentro de un renglón: el pozo de Apple (fieldWellStylesOf), sin el borde de MUI ni el vidrio del tema,
 * con su aro al escribir. Los selectores van con «html body &&&» para ganarle a los ajustes del tema dentro de una
 * tarjeta, que con el lente llevan una etiqueta y hasta cuatro clases (con menos, el relleno del tema salía al pasar el
 * cursor, en cuadro: los «hovers espantosos» que reportaron).
 *
 * @param {object} theme
 * @returns {object}
 */
function rowControlSxOf(theme) {
    const palette = (theme.vars ?? theme).palette;
    const strong = (selectors) => selectors.map((selector) => `html body &&& ${selector}`).join(', ');
    const roots = ['.MuiOutlinedInput-root', '.MuiFilledInput-root', '.MuiPickersOutlinedInput-root'];
    const ringOf = (color, percent) => ({outline: `${RING.pixels}px solid color-mix(in srgb, ${color} ${percent}%, transparent)`, outlineOffset: 0});
    return {
        // los tonos van en variables del renglón (fieldVariablesOf, abajo en FormRow): aquí abajo una regla de oscuro no aplica
        [strong(roots)]: {...fieldWellFromVariablesOf(theme), outline: 'none'},
        [strong(roots.map((root) => `${root}.Mui-focused`))]: ringOf(palette.primary.main, RING.focusPercent),
        [strong(roots.map((root) => `${root}.Mui-error`))]: ringOf(palette.error.main, RING.errorPercent),
        [strong(['.MuiOutlinedInput-notchedOutline', '.MuiPickersOutlinedInput-notchedOutline'])]: {display: 'none'},
        [strong(['.MuiFilledInput-root::before', '.MuiFilledInput-root::after'])]: {display: 'none'},
        // la fecha: el mismo campo que los demás, a todo lo ancho de su columna (en cápsula al final del renglón quedaba
        // descuadrada, con su ayuda a la izquierda debajo de nada; lo reportaron), con el ícono del calendario discreto
        [strong(['.MuiPickersOutlinedInput-root'])]: {color: palette.text.primary},
        [strong(['.MuiPickersOutlinedInput-root .MuiInputAdornment-root .MuiSvgIcon-root'])]: {fontSize: '1.125rem', color: palette.text.secondary},
        // la ayuda y el error, debajo del campo; el renglón no guarda lugar para una ayuda vacía
        '& .MuiFormHelperText-root': {marginInline: theme.spacing(0.5), marginTop: '4px', marginBottom: '2px'},
        '& .MuiFormHelperText-root:has(> .notranslate:only-child)': {display: 'none'},
    };
}

// los nombres de las piezas en el tema (theme.components.CalcitaFormSection y CalcitaFormRow)
const SECTION_THEME_NAME = 'CalcitaFormSection';
const ROW_THEME_NAME = 'CalcitaFormRow';

// el renglón: la etiqueta a la izquierda y el campo a la derecha, con la línea de arriba y los tonos de los campos
// ownerState: dónde va la etiqueta (también lo recibe un styleOverrides del tema que sea función); no llega al DOM
const isPartProp = (propName) => propName !== 'ownerState';

const FormRowRoot = styled(Box, {name: ROW_THEME_NAME, slot: 'Root', shouldForwardProp: isPartProp})(({theme, ownerState}) => {
    const palette = (theme.vars ?? theme).palette;
    const isTopOnPhone = ownerState?.labelPlacement === FORM_LABEL_PLACEMENT.topOnPhone;
    const isBare = ownerState?.variant === FORM_SECTION_VARIANT.bare;
    return theme.unstable_sx({
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        // sin columna de etiqueta (labelWidth 0) no hay nada que separar: el campo empieza en la orilla del renglón
        gap: ownerState?.labelWidth === 0 ? 0 : 2,
        // sin tarjeta, el aire lo pone lo que la envuelve (la celda): el renglón mide lo que mide el campo
        minHeight: isBare ? 'auto' : ROW_MIN_HEIGHT_PIXELS,
        px: isBare ? 0 : 2,
        py: isBare ? 0 : `${ROW_PADDING_BLOCK_PIXELS}px`,
        '&:focus-within > label': accentTextStylesOf(theme),
        '&:has(.Mui-error) > label': {color: palette.error.main},
        // los tonos de los campos (los del proyecto con createToolkitTheme fields, o los de Apple) para sus campos
        ...fieldVariablesOf(theme),
        ...rowControlSxOf(theme),
        // en el teléfono, la etiqueta arriba y el campo a todo lo ancho debajo
        ...(isTopOnPhone && {[theme.breakpoints.down('sm')]: {flexDirection: 'column', alignItems: 'stretch', gap: 0.5}}),
    });
});

/**
 * Lo ancho de la columna de la etiqueta según la sección: lo de siempre (38 % hasta 200 px), auto (lo que sobre) o el ancho
 * que dijo (un número son px, como en sx).
 *
 * @param {string|number|undefined} labelWidth
 * @returns {object}
 */
function labelColumnStylesOf(labelWidth) {
    if (labelWidth === FORM_LABEL_WIDTH.auto) {
        return {flex: '1 1 auto', maxWidth: 'none'};
    }
    if (labelWidth !== undefined && labelWidth !== null) {
        const width = typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth;
        return {flex: `0 0 ${width}`, maxWidth: 'none'};
    }
    return {flex: `0 0 ${LABEL_COLUMN.share}`, maxWidth: LABEL_COLUMN.maxPixels};
}

const FormRowLabel = styled(Typography, {name: ROW_THEME_NAME, slot: 'Label', shouldForwardProp: isPartProp})(({theme, ownerState}) => theme.unstable_sx({
    ...labelColumnStylesOf(ownerState?.labelWidth), pt: `${LABEL_TOP_PIXELS}px`, lineHeight: 1.5, color: 'text.primary',
    // va después del ancho: en el teléfono, con la etiqueta arriba, la columna ya no cuenta
    ...(ownerState?.labelPlacement === FORM_LABEL_PLACEMENT.topOnPhone && {
        [theme.breakpoints.down('sm')]: {flex: 'none', maxWidth: 'none', pt: 0},
    }),
    // el asterisco de lo obligatorio: aquí, debajo de lo que el proyecto ponga en su tema
    ...(ownerState?.requiredMark && requiredMarkSxOf(ownerState.requiredMark)),
    // sin columna (labelWidth 0): fuera de la vista y sin ocupar lugar. OJO: con flex 0 la etiqueta igual medía lo de su
    // palabra más larga y empujaba el campo; por eso se dejaba vacía y el campo se quedaba sin nombre para el lector
    ...(ownerState?.labelWidth === 0 && VISUALLY_HIDDEN_SX),
}));


// el campo: lo que queda del renglón; con la etiqueta en auto, solo lo que ocupa (los botones de un cargador), sin encogerse
// y hasta la mitad del renglón (un archivo de nombre largo se corta con «…» en lugar de aplastar el nombre del documento).
// OJO: con '0 1 auto' el renglón angosto lo apretaba y, como el cargador alinea a la derecha, sus botones se salían hacia la
// izquierda, encima del nombre (pasó en el teléfono). Con la etiqueta arriba en el teléfono, el campo va a todo lo ancho
const FormRowControl = styled(Box, {name: ROW_THEME_NAME, slot: 'Control', shouldForwardProp: isPartProp})(({theme, ownerState}) => {
    const isAuto = ownerState?.labelWidth === FORM_LABEL_WIDTH.auto;
    return {
        flex: isAuto ? '0 0 auto' : 1,
        ...(isAuto && {maxWidth: AUTO_CONTROL_MAX_SHARE}),
        ...(isAuto && ownerState?.labelPlacement === FORM_LABEL_PLACEMENT.topOnPhone && {[theme.breakpoints.down('sm')]: {maxWidth: 'none'}}),
        minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 40,
    };
});

const FormSectionRoot = styled(Box, {name: SECTION_THEME_NAME, slot: 'Root'})({});

// el título y la explicación empiezan donde empieza el texto de los renglones (sin tarjeta, en la orilla)
const insetOf = (ownerState) => (ownerState?.variant === FORM_SECTION_VARIANT.bare ? 0 : 2);

const FormSectionTitle = styled(Typography, {name: SECTION_THEME_NAME, slot: 'Title', shouldForwardProp: isPartProp})(({theme, ownerState}) => theme.unstable_sx({px: insetOf(ownerState), mb: 0.75, fontWeight: 600}));

// la tarjeta: la línea de arriba de cada renglón, desde donde empieza el texto (la del primero la recorta la tarjeta)
const FormSectionCard = styled(Paper, {name: SECTION_THEME_NAME, slot: 'Card'})(({theme}) => ({
    borderRadius: PANEL_RADIUS,
    overflow: 'hidden',
    [`& .${FORM_ROW_CLASS}::before`]: {
        content: '""', position: 'absolute', top: 0, right: 0, left: theme.spacing(2), height: '1px',
        backgroundColor: (theme.vars ?? theme).palette.divider,
    },
}));

const FormSectionFooter = styled(Typography, {name: SECTION_THEME_NAME, slot: 'Footer', shouldForwardProp: isPartProp})(({theme, ownerState}) => theme.unstable_sx({px: insetOf(ownerState), mt: 0.75}));

/**
 * Un renglón del formulario agrupado: la etiqueta a la izquierda y lo que sea a la derecha (un campo, un interruptor, un
 * texto). Los campos del framework lo usan solos dentro de una FormSection; FormRow suelto es para lo demás.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.label ya traducida
 * @param {string} [props.htmlFor] el id del campo que nombra la etiqueta
 * @param {string} [props.labelId] el id de la etiqueta (para un campo que la nombra con aria-labelledby)
 * @param {boolean} [props.required] el asterisco en la etiqueta (el lector de pantalla no lo lee: el campo ya lo dice)
 * @param {import('react').ReactNode} props.children
 * @param {import('@mui/material').SxProps<import('@mui/material').Theme>} [props.sx] los estilos de esta pantalla en el renglón, encima de los del tema
 */
export function FormRow(props) {
    // lo que el proyecto puso en su tema (components.CalcitaFormRow.defaultProps) y encima lo que llega aquí
    const {label, htmlFor, labelId, required = false, children, sx, ...unknownProps} = useThemeProps({props, name: ROW_THEME_NAME});
    warnUnknownProps(ROW_THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common');
    // dónde va la etiqueta lo pide la sección; un FormRow fuera de una sección, a la izquierda
    const sectionLayout = useFormSectionLayout();
    const ownerState = {
        labelPlacement: sectionLayout ? sectionLayout.labelPlacement : FORM_LABEL_PLACEMENT.side,
        labelWidth: sectionLayout ? sectionLayout.labelWidth : undefined,
        variant: sectionLayout ? sectionLayout.variant : FORM_SECTION_VARIANT.card,
        requiredMark: required ? t('form.requiredMark') : null,
    };
    return (
        <FormRowRoot sx={sx} className={FORM_ROW_CLASS} ownerState={ownerState}>
            <FormRowLabel component="label" id={labelId} htmlFor={htmlFor} variant="body1" ownerState={ownerState}
                          {...(required && {[REQUIRED_LABEL_ATTRIBUTE]: 'true'})}>
                {label}
            </FormRowLabel>
            <FormRowControl ownerState={ownerState}>
                {children}
            </FormRowControl>
        </FormRowRoot>
    );
}

/**
 * @param {object} props
 * @param {string} [props.title] ya traducido; va arriba de la tarjeta
 * @param {import('react').ReactNode} [props.footer] la explicación, abajo de la tarjeta
 * @param {string} [props.labelPlacement] uno de FORM_LABEL_PLACEMENT: side (por omisión, la etiqueta a la izquierda) o
 *     topOnPhone (arriba del campo por debajo de `sm`)
 * @param {'auto'|string|number} [props.labelWidth] lo ancho de la columna de las etiquetas: FORM_LABEL_WIDTH.auto (la etiqueta
 *     se lleva lo que sobre y el campo lo que ocupa), un ancho de CSS ('320px', '50%') o un número en px; por omisión el 38 %
 *     del renglón hasta 200 px, como siempre
 * @param {'card'|'bare'} [props.variant] uno de FORM_SECTION_VARIANT: con su tarjeta (card, por omisión) o sin ella (bare: sin
 *     lienzo, sin líneas y sin el aire del renglón, para un campo dentro de una celda). También desde el tema:
 *     components.CalcitaFormSection.defaultProps
 * @param {import('@mui/material/styles').SxProps<import('@mui/material/styles').Theme>} [props.sx] los estilos de la sección
 *     en esta pantalla, encima de los del tema (como en las demás piezas)
 * @param {import('react').ReactNode} props.children los campos, directo o dentro de un Grid, un Stack o un componente propio
 */
export default function FormSection(props) {
    // lo que el proyecto puso en su tema (components.CalcitaFormSection.defaultProps) y encima lo que llega aquí
    const {
        title, footer, labelPlacement = FORM_LABEL_PLACEMENT.side, labelWidth, variant = FORM_SECTION_VARIANT.card, sx, children, ...unknownProps
    } = useThemeProps({props, name: SECTION_THEME_NAME});
    warnUnknownProps(SECTION_THEME_NAME, unknownProps);
    if (!Object.values(FORM_SECTION_VARIANT).includes(variant)) {
        throw new Error(`FormSection: variant «${variant}» no existe; use uno de FORM_SECTION_VARIANT (${Object.values(FORM_SECTION_VARIANT).join(', ')}).`);
    }
    const titleId = useId();
    const layout = useMemo(() => ({labelPlacement, labelWidth, variant}), [labelPlacement, labelWidth, variant]);
    const ownerState = {variant};
    return (
        <FormSectionContext value={layout}>
            <FormSectionRoot component="section" aria-labelledby={title ? titleId : undefined} sx={sx}>
                {title && (
                    <FormSectionTitle id={titleId} variant="subtitle2" component="h2" color="text.secondary" ownerState={ownerState}>
                        {title}
                    </FormSectionTitle>
                )}
                {variant === FORM_SECTION_VARIANT.bare ? (
                    // sin tarjeta: los renglones tal cual; la línea entre ellos la dibuja la tarjeta, así que tampoco sale
                    children
                ) : (
                    <FormSectionCard variant="outlined">
                        {/* un píxel arriba: la línea de los renglones de hasta arriba queda fuera de la tarjeta (overflow hidden) */}
                        <Box sx={{mt: '-1px'}}>{children}</Box>
                    </FormSectionCard>
                )}
                {footer && (
                    <FormSectionFooter variant="caption" component="p" color="text.secondary" ownerState={ownerState}>{footer}</FormSectionFooter>
                )}
            </FormSectionRoot>
        </FormSectionContext>
    );
}
