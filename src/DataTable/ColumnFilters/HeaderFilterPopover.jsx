// El icono de filtro del encabezado, con su globo.
//
// El badge trae el NÚMERO de valores activos en esa columna, no un punto: así se sabe sin abrir nada si se filtró por
// uno o por seis.
//
// OJO: stopPropagation en el clic no es adorno. El título del encabezado ordena, y sin eso abrir el filtro también
// cambiaría el orden.
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

/**
 * @param {{activeCount?: number, onClear: () => void, children: import('react').ReactNode}} props children = el filtro
 */
export default function HeaderFilterPopover({activeCount = 0, onClear, children}) {
    const {t} = useToolkitTranslation('table');
    const [anchorElement, setAnchorElement] = useState(null);
    const isActive = activeCount > 0;
    const tooltip = isActive ? t('columnFilter.activeTooltip', {count: activeCount}) : t('columnFilter.tooltip');

    return (
        <>
            <Tooltip title={tooltip}>
                <IconButton size="small" aria-label={tooltip}
                            sx={{color: isActive ? 'primary.main' : 'action.active', opacity: isActive ? 1 : 0.45, overflow: 'visible'}}
                            onClick={(event) => {
                                event.stopPropagation();
                                setAnchorElement(event.currentTarget);
                            }}>
                    {/* sin filtros NO se monta el Badge: MUI lo esconde con scale(0) y deja un artefacto en la esquina */}
                    {isActive ? (
                        <Badge badgeContent={activeCount} color="primary" overlap="circular"
                               sx={{'& .MuiBadge-badge': {fontSize: 10, fontWeight: 700, minWidth: 16, height: 16}}}>
                            <FilterAltIcon fontSize="inherit" />
                        </Badge>
                    ) : <FilterAltOutlinedIcon fontSize="inherit" />}
                </IconButton>
            </Tooltip>

            <Popover open={Boolean(anchorElement)} anchorEl={anchorElement} onClose={() => setAnchorElement(null)}
                     anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}>
                <Box sx={{p: 2, minWidth: 280}}>
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
                </Box>
            </Popover>
        </>
    );
}
