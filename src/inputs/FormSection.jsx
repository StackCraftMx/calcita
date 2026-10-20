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
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaFormSection (sus partes root, title, card y
// footer) y components.CalcitaFormRow (root, label y control), con styleOverrides y defaultProps. Los colores de los campos,
// más fácil con createToolkitTheme({fields}).
//
// Genérico del paquete: function (regla de la casa).
import {useId} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {styled, useThemeProps} from '@mui/material/styles';

import {FormSectionContext} from '@/inputs/formLayoutContext.js';
import {PANEL_RADIUS, accentTextStylesOf, fieldVariablesOf, fieldWellFromVariablesOf} from '@/theme/glassSurface.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/** La clase de cada renglón: la sección le dibuja su línea de arriba, esté donde esté adentro de la tarjeta. */
export const FORM_ROW_CLASS = 'calcita-form-row';

// el renglón: alto mínimo para el dedo, su aire arriba y abajo, y lo ancho de la columna de las etiquetas
const ROW_MIN_HEIGHT_PIXELS = 52;
const ROW_PADDING_BLOCK_PIXELS = 8;
const LABEL_COLUMN = Object.freeze({share: '38%', maxPixels: 200});
// lo que la etiqueta baja para quedar en la misma línea que el texto del campo (el campo mide 40 px y su letra 24 px)
const LABEL_TOP_PIXELS = 8;
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
const FormRowRoot = styled(Box, {name: ROW_THEME_NAME, slot: 'Root'})(({theme}) => {
    const palette = (theme.vars ?? theme).palette;
    return theme.unstable_sx({
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        minHeight: ROW_MIN_HEIGHT_PIXELS,
        px: 2,
        py: `${ROW_PADDING_BLOCK_PIXELS}px`,
        '&:focus-within > label': accentTextStylesOf(theme),
        '&:has(.Mui-error) > label': {color: palette.error.main},
        // los tonos de los campos (los del proyecto con createToolkitTheme fields, o los de Apple) para sus campos
        ...fieldVariablesOf(theme),
        ...rowControlSxOf(theme),
    });
});

const FormRowLabel = styled(Typography, {name: ROW_THEME_NAME, slot: 'Label'})(({theme}) => theme.unstable_sx({
    flex: `0 0 ${LABEL_COLUMN.share}`, maxWidth: LABEL_COLUMN.maxPixels, pt: `${LABEL_TOP_PIXELS}px`, lineHeight: 1.5, color: 'text.primary',
}));

const FormRowControl = styled(Box, {name: ROW_THEME_NAME, slot: 'Control'})({
    flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 40,
});

const FormSectionRoot = styled(Box, {name: SECTION_THEME_NAME, slot: 'Root'})({});

const FormSectionTitle = styled(Typography, {name: SECTION_THEME_NAME, slot: 'Title'})(({theme}) => theme.unstable_sx({px: 2, mb: 0.75, fontWeight: 600}));

// la tarjeta: la línea de arriba de cada renglón, desde donde empieza el texto (la del primero la recorta la tarjeta)
const FormSectionCard = styled(Paper, {name: SECTION_THEME_NAME, slot: 'Card'})(({theme}) => ({
    borderRadius: PANEL_RADIUS,
    overflow: 'hidden',
    [`& .${FORM_ROW_CLASS}::before`]: {
        content: '""', position: 'absolute', top: 0, right: 0, left: theme.spacing(2), height: '1px',
        backgroundColor: (theme.vars ?? theme).palette.divider,
    },
}));

const FormSectionFooter = styled(Typography, {name: SECTION_THEME_NAME, slot: 'Footer'})(({theme}) => theme.unstable_sx({px: 2, mt: 0.75}));

/**
 * Un renglón del formulario agrupado: la etiqueta a la izquierda y lo que sea a la derecha (un campo, un interruptor, un
 * texto). Los campos del framework lo usan solos dentro de una FormSection; FormRow suelto es para lo demás.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.label ya traducida
 * @param {string} [props.htmlFor] el id del campo que nombra la etiqueta
 * @param {string} [props.labelId] el id de la etiqueta (para un campo que la nombra con aria-labelledby)
 * @param {import('react').ReactNode} props.children
 */
export function FormRow(props) {
    // lo que el proyecto puso en su tema (components.CalcitaFormRow.defaultProps) y encima lo que llega aquí
    const {label, htmlFor, labelId, children, ...unknownProps} = useThemeProps({props, name: ROW_THEME_NAME});
    warnUnknownProps(ROW_THEME_NAME, unknownProps);
    return (
        <FormRowRoot className={FORM_ROW_CLASS}>
            <FormRowLabel component="label" id={labelId} htmlFor={htmlFor} variant="body1">
                {label}
            </FormRowLabel>
            <FormRowControl>
                {children}
            </FormRowControl>
        </FormRowRoot>
    );
}

/**
 * @param {object} props
 * @param {string} [props.title] ya traducido; va arriba de la tarjeta
 * @param {import('react').ReactNode} [props.footer] la explicación, abajo de la tarjeta
 * @param {import('react').ReactNode} props.children los campos, directo o dentro de un Grid, un Stack o un componente propio
 */
export default function FormSection(props) {
    // lo que el proyecto puso en su tema (components.CalcitaFormSection.defaultProps) y encima lo que llega aquí
    const {title, footer, children, ...unknownProps} = useThemeProps({props, name: SECTION_THEME_NAME});
    warnUnknownProps(SECTION_THEME_NAME, unknownProps);
    const titleId = useId();
    return (
        <FormSectionContext value>
            <FormSectionRoot component="section" aria-labelledby={title ? titleId : undefined}>
                {title && (
                    <FormSectionTitle id={titleId} variant="subtitle2" component="h2" color="text.secondary">
                        {title}
                    </FormSectionTitle>
                )}
                <FormSectionCard variant="outlined">
                    {/* un píxel arriba: la línea de los renglones de hasta arriba queda fuera de la tarjeta (overflow hidden) */}
                    <Box sx={{mt: '-1px'}}>{children}</Box>
                </FormSectionCard>
                {footer && (
                    <FormSectionFooter variant="caption" component="p" color="text.secondary">{footer}</FormSectionFooter>
                )}
            </FormSectionRoot>
        </FormSectionContext>
    );
}
