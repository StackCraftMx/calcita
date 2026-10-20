// El icono de filtro del encabezado, con su globo.
//
// El badge trae el NÚMERO de valores activos en esa columna, no un punto: así se sabe sin abrir nada si se filtró por
// uno o por seis.
//
// OJO: stopPropagation en el clic no es adorno. El título del encabezado ordena, y sin eso abrir el filtro también
// cambiaría el orden.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaHeaderFilter con defaultProps y
// styleOverrides de sus partes: button, badge, panel.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaHeaderFilter)
const THEME_NAME = 'CalcitaHeaderFilter';
const FilterButton = piecePart(THEME_NAME, 'Button', IconButton);
const FilterBadge = piecePart(THEME_NAME, 'Badge', Badge);
const FilterPanel = piecePart(THEME_NAME, 'Panel', Box);

/**
 * @param {{activeCount?: number, onClear: () => void, children: import('react').ReactNode}} props children = el filtro
 */
export default function HeaderFilterPopover(props) {
    // lo que el proyecto puso en su tema (components.CalcitaHeaderFilter.defaultProps) y encima lo que llega aquí
    const {activeCount = 0, onClear, children, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('table');
    const [anchorElement, setAnchorElement] = useState(null);
    const isActive = activeCount > 0;
    const tooltip = isActive ? t('columnFilter.activeTooltip', {count: activeCount}) : t('columnFilter.tooltip');

    return (
        <>
            <Tooltip title={tooltip}>
                <FilterButton size="small" aria-label={tooltip}
                            ownSx={{color: isActive ? 'primary.main' : 'action.active', opacity: isActive ? 1 : 0.45, overflow: 'visible'}}
                            onClick={(event) => {
                                event.stopPropagation();
                                setAnchorElement(event.currentTarget);
                            }}>
                    {/* sin filtros NO se monta el Badge: MUI lo esconde con scale(0) y deja un artefacto en la esquina */}
                    {isActive ? (
                        <FilterBadge badgeContent={activeCount} color="primary" overlap="circular"
                               ownSx={{'& .MuiBadge-badge': {fontSize: 10, fontWeight: 700, minWidth: 16, height: 16}}}>
                            <FilterAltIcon fontSize="inherit" />
                        </FilterBadge>
                    ) : <FilterAltOutlinedIcon fontSize="inherit" />}
                </FilterButton>
            </Tooltip>

            <Popover open={Boolean(anchorElement)} anchorEl={anchorElement} onClose={() => setAnchorElement(null)}
                     anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}>
                <FilterPanel ownSx={{p: 2, minWidth: 280}}>
                    <Stack spacing={1}>
                        {children}
                        <Button size="small" disabled={!isActive}
                                onClick={() => {
                                    onClear();
                                    setAnchorElement(null);
                                }}>
                            {t('columnFilter.clear')}
                        </Button>
                    </Stack>
                </FilterPanel>
            </Popover>
        </>
    );
}
