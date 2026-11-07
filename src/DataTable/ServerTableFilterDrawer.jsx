// El botón «Filtros» de ServerTable con su cajón de búsqueda (FilterDrawer): se pone en toolbarExtra y lee y cambia los
// filtros de SU tabla (los de la dirección, los mismos de los chips). El botón dice cuántos filtros del cajón hay puestos.
//
//   const FILTER_FIELDS = [{name: 'total', label: 'Total', kind: FILTER_FIELD_KIND.comparison, prefix: '$'}, …];
//   <ServerTable … filterDefaults={{...MIS_DEFAULTS, ...filterDrawerDefaultsOf(FILTER_FIELDS)}}
//                  filterKinds={{...MIS_KINDS, ...filterDrawerKindsOf(FILTER_FIELDS)}}
//                  chipConfig={buildChipConfig(filterDrawerChipsOf(FILTER_FIELDS, {t, formatDate}))}
//                  toolbarExtra={<ServerTableFilterDrawer fields={FILTER_FIELDS} />} />
//
// filterDefaults: la tabla solo guarda en la dirección lo que declara ahí. filterKinds: las listas se leen como lista. Los
// chips dicen cada filtro en palabras y cada uno se quita con su ×.
//
// Lo demás del cajón (su calendario propio, sus partes) va en drawerProps: <ServerTableFilterDrawer fields={…}
// drawerProps={{slots: {dateInput: DateInput}}} />. Los slots de aquí son del botón.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaServerTableFilterDrawer con defaultProps, styleOverrides de
// sus partes (button) y slots/slotProps para cambiarlas.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Button from '@mui/material/Button';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import {useTableFilter} from '@/DataTable/filterContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import FilterDrawer from '@/ui/filters/FilterDrawer.jsx';
import {activeDrawerFilterCountOf} from '@/ui/filters/filterDrawerFields.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaServerTableFilterDrawer)
const THEME_NAME = 'CalcitaServerTableFilterDrawer';
const ServerTableFilterDrawerButton = piecePart(THEME_NAME, 'Button', Button);

/**
 * @param {object} props
 * @param {object[]} props.fields los campos del cajón (filterDrawerFields.js)
 * @param {'left'|'right'} [props.anchor] de qué lado sale; por omisión la derecha
 * @param {number} [props.width] su ancho en escritorio
 * @param {string} [props.title] ya traducido; por omisión «Filtros»
 * @param {string} [props.buttonLabel] ya traducido; por omisión «Filtros» (con los puestos, «Filtros (3)»)
 * @param {(values: Record<string, unknown>) => void} [props.onApply] aviso de lo que se buscó (la tabla ya se filtró)
 * @param {number} [props.stackPairsBelow] en px: si el cajón mide menos, cada par («desde» y «hasta») va uno arriba del otro
 * @param {object} [props.drawerProps] lo demás de FilterDrawer: slots (dateInput, body…), slotProps, applyLabel, closeOnApply,
 *     closePlacement
 * @param {import('react').ReactNode} [props.children] algo más abajo de los campos del cajón
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function ServerTableFilterDrawerContent(props) {
    const {fields, anchor, width, title, buttonLabel, onApply, stackPairsBelow, drawerProps, children, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const {filters, setFilters} = useTableFilter();
    const [isOpen, setIsOpen] = useState(false);
    const activeCount = activeDrawerFilterCountOf(fields, filters);

    return (
        <>
            <ServerTableFilterDrawerButton size="small" variant={activeCount > 0 ? 'contained' : 'outlined'} startIcon={<TuneRoundedIcon />}
                    aria-haspopup="dialog" onClick={() => setIsOpen(true)}>
                {activeCount > 0 ? t('filterDrawer.openWithCount', {count: activeCount}) : (buttonLabel ?? t('filterDrawer.open'))}
            </ServerTableFilterDrawerButton>
            <FilterDrawer {...drawerProps} open={isOpen} onClose={() => setIsOpen(false)} fields={fields} values={filters} anchor={anchor} width={width}
                          title={title} stackPairsBelow={stackPairsBelow} texts={texts}
                          onApply={(values) => {
                              setFilters(values);
                              onApply?.(values);
                          }}>
                {children}
            </FilterDrawer>
        </>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const ServerTableFilterDrawer = withPieceSlots(ServerTableFilterDrawerContent, THEME_NAME);
export default ServerTableFilterDrawer;
