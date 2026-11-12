// Un rango de fechas personalizado, como chip al lado de los accesos rápidos.
//
// Viaja como AAAA-MM-DD (día, no instante). Convertirlo a "inicio del día" y "fin del día" lo hace el SERVIDOR con la
// zona del negocio: si lo hiciera el navegador con la suya, alguien en otra zona pediría otro rango sin saberlo.
//
// El calendario es el <input type="date"> del TextField de MUI y no el DatePicker de @mui/x-date-pickers con moment,
// para no sumar dos dependencias (x-date-pickers y moment) que ninguna
// pantalla del 22-sep necesita. Si el calendario nativo estorba (Safari de escritorio), se cambia SOLO este archivo.
//
// Topes, como el dateRange del cajón de filtros: minDate y maxDate (AAAA-MM-DD), disablePast y disableFuture (hoy en la zona
// del producto). El calendario no deja elegir fuera; una fecha TECLEADA fuera avisa y no deja aplicar o, con limitMode fix,
// se vuelve el tope al salir del campo, con una nota que lo dice y onLimitFix para la pantalla (LIMIT_MODE, fieldLimits.js).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaDateRangeFilter con defaultProps y
// styleOverrides de sus partes: chip, panel, actions.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';

import {useValidationText} from '@/forms/useValidationText.js';
import {LIMIT_MODE, limitFixOf, limitModeOf} from '@/inputs/fieldLimits.js';
import {dateLimitsOf} from '@/ui/filters/filterDrawerFields.js';
import {todayInZone} from '@/ui/metrics/heatmapScale.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {useFormatters} from '@/toolkit/useFormatters.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaDateRangeFilter)
const THEME_NAME = 'CalcitaDateRangeFilter';
const RangeChip = piecePart(THEME_NAME, 'Chip', Chip);
const RangePanel = piecePart(THEME_NAME, 'Panel', Stack);
const RangeActions = piecePart(THEME_NAME, 'Actions', Stack);

/**
 * @param {object} props
 * @param {string} [props.from] AAAA-MM-DD o '' si no hay
 * @param {string} [props.to] AAAA-MM-DD o '' si no hay
 * @param {(range: {from: string, to: string}) => void} props.onChange '' para quitar
 * @param {string} [props.label] ya traducido; por defecto "Personalizado"
 * @param {string} [props.minDate] AAAA-MM-DD: la fecha más temprana que se puede pedir
 * @param {string} [props.maxDate] AAAA-MM-DD: la más tardía
 * @param {boolean} [props.disablePast] solo de hoy en adelante (hoy en la zona del producto)
 * @param {boolean} [props.disableFuture] solo hasta hoy
 * @param {'warn'|'fix'} [props.limitMode] una fecha tecleada fuera del tope: LIMIT_MODE.warn lo dice y no deja aplicar (por
 *     omisión, o el de ToolkitProvider); LIMIT_MODE.fix la vuelve el tope al salir del campo, con una nota que lo dice
 * @param {(fix: ReturnType<typeof import('@/inputs/fieldLimits.js').limitFixOf> & {end: 'from'|'to'}) => void} [props.onLimitFix]
 *     con fix, cada vez que se corrige sola: qué extremo, qué tope, qué se había tecleado y en qué quedó
 * @param {object} [props.texts] los textos que cambian, con la forma de `table` en los textos del paquete
 * @param {import('@mui/material').SxProps<import('@mui/material').Theme>} [props.sx] los estilos de esta pantalla en el chip que se ve, encima de los del tema
 */
function DateRangeFilterContent(props) {
    // lo que el proyecto puso en su tema (components.CalcitaDateRangeFilter.defaultProps) y encima lo que llega aquí
    const {
        from = '', to = '', onChange, label, minDate, maxDate, disablePast = false, disableFuture = false, limitMode, onLimitFix, texts,
        sx, ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('table', texts);
    const {formatDate} = useFormatters();
    const settings = useToolkitSettings();
    const mode = limitModeOf(limitMode, settings.limitMode);
    const [anchorElement, setAnchorElement] = useState(null);
    const [draft, setDraft] = useState({from, to});
    const isActive = Boolean(from || to);
    // AAAA-MM-DD se compara bien como texto
    const isInvalid = Boolean(draft.from && draft.to && draft.from > draft.to);
    // los topes, con «hoy» en la zona del producto, como el cajón de filtros
    const limits = dateLimitsOf({minDate, maxDate, disablePast, disableFuture}, todayInZone(settings.timeZone));
    // el tope que rompe una fecha, con el tope como se ve en pantalla; null si está dentro o vacía
    const problemOf = (date) => {
        if (date && limits.minDate && date < limits.minDate) {
            return {rule: 'min', values: {min: formatDate(limits.minDate)}};
        }
        if (date && limits.maxDate && date > limits.maxDate) {
            return {rule: 'max', values: {max: formatDate(limits.maxDate)}};
        }
        return null;
    };
    const outOfRangeTextOf = (date) => {
        const problem = problemOf(date);
        if (!problem) {
            return null;
        }
        return problem.rule === 'min' ? t('dateRange.beforeMin', {date: problem.values.min}) : t('dateRange.afterMax', {date: problem.values.max});
    };
    // lo último que se corrigió solo en cada extremo: su nota se ve mientras la fecha siga siendo la corregida
    const [fixes, setFixes] = useState({from: null, to: null});
    const validationTextOf = useValidationText();
    const noticeOf = (end) => (fixes[end] && draft[end] === fixes[end].fixedValue ? validationTextOf(fixes[end].message) : undefined);
    const fixedDateOf = (date) => {
        if (date && limits.minDate && date < limits.minDate) {
            return limits.minDate;
        }
        return date && limits.maxDate && date > limits.maxDate ? limits.maxDate : date;
    };
    const fromProblem = outOfRangeTextOf(draft.from);
    const toProblem = outOfRangeTextOf(draft.to);
    // con fix, al salir del campo la fecha de fuera se vuelve el tope
    const fixOnBlur = (end) => () => {
        const typedDate = draft[end];
        const fixedDate = fixedDateOf(typedDate);
        if (mode !== LIMIT_MODE.fix || fixedDate === typedDate) {
            return;
        }
        const fix = {end, ...limitFixOf(problemOf(typedDate), typedDate, fixedDate)};
        setDraft((currentDraft) => ({...currentDraft, [end]: fixedDate}));
        setFixes((currentFixes) => ({...currentFixes, [end]: fix}));
        onLimitFix?.(fix);
    };
    // el calendario de cada extremo: los topes del campo y el otro extremo (el más estrecho)
    const latestOf = (...dates) => dates.filter(Boolean).sort().at(-1);
    const earliestOf = (...dates) => dates.filter(Boolean).sort()[0];

    const open = (event) => {
        setDraft({from, to});
        setAnchorElement(event.currentTarget);
    };
    const close = () => setAnchorElement(null);
    const apply = () => {
        // con fix nunca sale una fecha de fuera, aunque se aplique sin salir del campo
        onChange(mode === LIMIT_MODE.fix ? {from: fixedDateOf(draft.from), to: fixedDateOf(draft.to)} : draft);
        close();
    };
    const clear = () => {
        onChange({from: '', to: ''});
        close();
    };

    const summary = isActive
        ? t('dateRange.summary', {from: from ? formatDate(from) : '…', to: to ? formatDate(to) : t('dateRange.today')})
        : (label ?? t('dateRange.label'));

    return (
        <>
            <RangeChip sx={sx} icon={<DateRangeOutlinedIcon />} label={summary} clickable onClick={open}
                  variant={isActive ? 'filled' : 'outlined'} color={isActive ? 'primary' : 'default'}
                  onDelete={isActive ? clear : undefined} ownSx={{flex: '0 0 auto', height: 32}} />
            <Popover open={Boolean(anchorElement)} anchorEl={anchorElement} onClose={close} anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}>
                <RangePanel spacing={2} ownSx={{p: 2, width: 280}}>
                    <Typography variant="subtitle2">{t('dateRange.title')}</Typography>
                    <TextField type="date" size="small" fullWidth label={t('dateRange.from')} value={draft.from} error={Boolean(fromProblem)}
                               helperText={fromProblem ?? noticeOf('from') ?? t('dateRange.fromHelp')}
                               onChange={(event) => setDraft((currentDraft) => ({...currentDraft, from: event.target.value}))}
                               onBlur={fixOnBlur('from')}
                               slotProps={{
                                   inputLabel: {shrink: true},
                                   htmlInput: {min: limits.minDate, max: earliestOf(draft.to, limits.maxDate)},
                               }} />
                    <TextField type="date" size="small" fullWidth label={t('dateRange.to')} value={draft.to} error={isInvalid || Boolean(toProblem)}
                               helperText={toProblem ?? (isInvalid ? t('dateRange.invalid') : (noticeOf('to') ?? t('dateRange.toHelp')))}
                               onChange={(event) => setDraft((currentDraft) => ({...currentDraft, to: event.target.value}))}
                               onBlur={fixOnBlur('to')}
                               slotProps={{
                                   inputLabel: {shrink: true},
                                   htmlInput: {min: latestOf(draft.from, limits.minDate), max: limits.maxDate},
                               }} />
                    <RangeActions direction="row" spacing={1} ownSx={{justifyContent: 'flex-end'}}>
                        {isActive && <Button onClick={clear}>{t('dateRange.clear')}</Button>}
                        <Button variant="contained" onClick={apply} disabled={isInvalid || Boolean(fromProblem || toProblem) || !(draft.from || draft.to)}>
                            {t('dateRange.apply')}
                        </Button>
                    </RangeActions>
                </RangePanel>
            </Popover>
        </>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const DateRangeFilter = withPieceSlots(DateRangeFilterContent, THEME_NAME);
export default DateRangeFilter;
