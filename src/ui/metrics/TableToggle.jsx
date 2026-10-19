// "Ver como tabla": toda gráfica tiene su versión en tabla, para quien no distingue el color, usa lector de pantalla o
// quiere copiar los números.
//
// Los textos salen de i18n.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaTableToggle con defaultProps y
// styleOverrides de sus partes: root, button.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaTableToggle)
const THEME_NAME = 'CalcitaTableToggle';
const ToggleRoot = piecePart(THEME_NAME, 'Root', Box);
const ToggleButton = piecePart(THEME_NAME, 'Button', Button);

/** Cómo se ve una gráfica: dibujada o en su tabla (defaultView y onViewChange de BarList, ColumnChart, LineChart y CalendarHeatmap). */
export const CHART_VIEW = Object.freeze({chart: 'chart', table: 'table'});

/**
 * @param {{asTable: boolean, onToggle: () => void, texts?: object}} props texts: los textos que cambian, con la forma de
 *     `common` ({charts: {viewAsTable, viewAsChart}})
 */
export default function TableToggle(props) {
    // lo que el proyecto puso en su tema (components.CalcitaTableToggle.defaultProps) y encima lo que llega aquí
    const {asTable, onToggle, texts} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('common', texts);

    return (
        <ToggleRoot ownSx={{display: 'flex', justifyContent: 'flex-end', mb: 1}}>
            <ToggleButton size="small" onClick={onToggle} ownSx={{textTransform: 'none'}}>
                {asTable ? t('charts.viewAsChart') : t('charts.viewAsTable')}
            </ToggleButton>
        </ToggleRoot>
    );
}
