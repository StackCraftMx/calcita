// Un archivo elegido como chip: su ícono según el tipo, su nombre y su peso, y la × para quitarlo. Lo comparten los
// cargadores del paquete; cada uno le pasa su parte del tema (ChipComponent) para que el proyecto la cambie desde ahí.
//
// Sirve igual para un archivo nuevo (File) y para uno que ya está guardado en el servidor ({name, size?}): sin peso, solo
// se ve el nombre. Un nombre largo se parte en renglones en lugar de cortarse: es lo que la persona revisa antes de subir.
//
// Genérico del paquete: function (regla de la casa).
import Chip from '@mui/material/Chip';
import CancelIcon from '@mui/icons-material/Cancel';

import {useFormatters} from '@/toolkit/useFormatters.js';
import {fileAppearanceOf} from '@/upload/fileAppearance.js';

/**
 * @param {object} props
 * @param {{name: string, size?: number}} props.file
 * @param {(() => void)|undefined} [props.onRemove] sin él no hay × (con el candado puesto, por ejemplo)
 * @param {string} props.removeLabel ya traducido: «Quitar contrato.pdf»
 * @param {import('react').ElementType} [props.ChipComponent] la parte del tema del cargador (por omisión, el Chip de MUI)
 * @param {object} [props.ownSx] el estilo de la casa, debajo del tema del proyecto
 */
export default function FileChip({file, onRemove, removeLabel, ChipComponent = Chip, ownSx}) {
    const {formatFileSize} = useFormatters();
    const {Icon, color} = fileAppearanceOf(file.name);
    const label = typeof file.size === 'number' ? `${file.name} · ${formatFileSize(file.size)}` : file.name;
    const chipSx = {maxWidth: '100%', height: 'auto', py: 0.5, '& .MuiChip-label': {whiteSpace: 'normal', overflowWrap: 'anywhere'}, ...ownSx};

    return (
        <ChipComponent
            icon={<Icon fontSize="small" color={color} />}
            label={label}
            variant="outlined"
            onDelete={onRemove}
            deleteIcon={<CancelIcon aria-label={removeLabel} />}
            {...(ChipComponent === Chip ? {sx: chipSx} : {ownSx: chipSx})}
        />
    );
}
