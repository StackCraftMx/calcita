// Un rango de fechas personalizado, como chip al lado de los accesos rápidos.
//
// Viaja como AAAA-MM-DD (día, no instante). Convertirlo a "inicio del día" y "fin del día" lo hace el SERVIDOR con la
// zona del negocio: si lo hiciera el navegador con la suya, alguien en otra zona pediría otro rango sin saberlo.
//
// El calendario es el <input type="date"> del TextField de MUI y no el DatePicker de @mui/x-date-pickers con moment,
// para no sumar dos dependencias (x-date-pickers y moment) que ninguna
// pantalla del 22-sep necesita. Si el calendario nativo estorba (Safari de escritorio), se cambia SOLO este archivo.
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

import {useFormatters} from '@/toolkit/useFormatters.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

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
 * @param {object} [props.texts] los textos que cambian, con la forma de `table` en los textos del paquete
 */
export default function DateRangeFilter(props) {
    // lo que el proyecto puso en su tema (components.CalcitaDateRangeFilter.defaultProps) y encima lo que llega aquí
    const {from = '', to = '', onChange, label, texts} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('table', texts);
    const {formatDate} = useFormatters();
    const [anchorElement, setAnchorElement] = useState(null);
    const [draft, setDraft] = useState({from, to});
    const isActive = Boolean(from || to);
    // AAAA-MM-DD se compara bien como texto
    const isInvalid = Boolean(draft.from && draft.to && draft.from > draft.to);

    const open = (event) => {
        setDraft({from, to});
        setAnchorElement(event.currentTarget);
    };
    const close = () => setAnchorElement(null);
    const apply = () => {
        onChange(draft);
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
            <RangeChip icon={<DateRangeOutlinedIcon />} label={summary} clickable onClick={open}
                  variant={isActive ? 'filled' : 'outlined'} color={isActive ? 'primary' : 'default'}
                  onDelete={isActive ? clear : undefined} ownSx={{flex: '0 0 auto', height: 32}} />
            <Popover open={Boolean(anchorElement)} anchorEl={anchorElement} onClose={close} anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}>
                <RangePanel spacing={2} ownSx={{p: 2, width: 280}}>
                    <Typography variant="subtitle2">{t('dateRange.title')}</Typography>
                    <TextField type="date" size="small" fullWidth label={t('dateRange.from')} value={draft.from}
                               helperText={t('dateRange.fromHelp')}
                               onChange={(event) => setDraft((currentDraft) => ({...currentDraft, from: event.target.value}))}
                               slotProps={{inputLabel: {shrink: true}, htmlInput: {max: draft.to || undefined}}} />
                    <TextField type="date" size="small" fullWidth label={t('dateRange.to')} value={draft.to} error={isInvalid}
                               helperText={isInvalid ? t('dateRange.invalid') : t('dateRange.toHelp')}
                               onChange={(event) => setDraft((currentDraft) => ({...currentDraft, to: event.target.value}))}
                               slotProps={{inputLabel: {shrink: true}, htmlInput: {min: draft.from || undefined}}} />
                    <RangeActions direction="row" spacing={1} ownSx={{justifyContent: 'flex-end'}}>
                        {isActive && <Button onClick={clear}>{t('dateRange.clear')}</Button>}
                        <Button variant="contained" onClick={apply} disabled={isInvalid || !(draft.from || draft.to)}>
                            {t('dateRange.apply')}
                        </Button>
                    </RangeActions>
                </RangePanel>
            </Popover>
        </>
    );
}
