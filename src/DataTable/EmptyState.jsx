// Qué decir cuando la tabla no tiene filas.
//
// Son dos situaciones distintas y confundirlas hace daño:
//   - sin filtros puestos, la lista vacía es el RESULTADO y se dice tal cual (label);
//   - con filtros puestos, la lista vacía NO dice nada del conjunto: dice que lo filtrado no existe dentro de él. Ahí
//     sí hay algo que hacer, y el botón lo hace.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaEmptyState con defaultProps y
// styleOverrides de sus partes: root, icon.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaEmptyState)
const THEME_NAME = 'CalcitaEmptyState';
const EmptyRoot = piecePart(THEME_NAME, 'Root', Stack);
const EmptyIcon = piecePart(THEME_NAME, 'Icon', Box);

/**
 * @param {object} [props]
 * @param {boolean} [props.filtered]
 * @param {string} [props.label] ya traducido
 * @param {() => void} [props.onClearFilters]
 * @param {object} [props.texts] los textos que cambian, con la forma de `table` en los textos del paquete
 * @param {import('@mui/material').SxProps<import('@mui/material').Theme>} [props.sx] los estilos de esta pantalla, encima de los del tema (en su parte root)
 */
function EmptyStateContent(props) {
    // lo que el proyecto puso en su tema (components.CalcitaEmptyState.defaultProps) y encima lo que llega aquí
    const {filtered = false, label, onClearFilters, texts, sx, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('table', texts);
    const Icon = filtered ? FilterListOffIcon : InboxOutlinedIcon;

    return (
        <EmptyRoot sx={sx} spacing={1} ownSx={{height: '100%', px: 3, textAlign: 'center', alignItems: 'center', justifyContent: 'center'}}>
            <EmptyIcon ownSx={{color: 'text.disabled', display: 'flex'}}>
                <Icon fontSize="large" />
            </EmptyIcon>
            <Typography variant="body2" color="text.secondary">
                {filtered ? t('empty.filtered') : (label ?? t('empty.default'))}
            </Typography>
            {filtered && onClearFilters && (
                <Button size="small" onClick={onClearFilters}>{t('empty.clearFilters')}</Button>
            )}
        </EmptyRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const EmptyState = withPieceSlots(EmptyStateContent, THEME_NAME);
export default EmptyState;
