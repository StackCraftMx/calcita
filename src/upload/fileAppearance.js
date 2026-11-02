// El ícono y el color de un archivo según su tipo, con los mismos colores que el panel de descargas: Excel y CSV en verde,
// PDF en rojo, imágenes en azul, documentos en el color del tema. Lo comparten los cargadores del paquete.
//
// Genérico del paquete: function (regla de la casa).
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';

const FILE_APPEARANCES = [
    {pattern: /\.(xlsx?|csv)$/, Icon: TableViewOutlinedIcon, color: 'success'},
    {pattern: /\.pdf$/, Icon: PictureAsPdfOutlinedIcon, color: 'error'},
    {pattern: /\.(png|jpe?g|gif|webp|svg|avif)$/, Icon: ImageOutlinedIcon, color: 'info'},
    {pattern: /\.(docx?|txt|md)$/, Icon: DescriptionOutlinedIcon, color: 'primary'},
];
const DEFAULT_FILE_APPEARANCE = {Icon: InsertDriveFileOutlinedIcon, color: 'action'};

/**
 * @param {string} fileName
 * @returns {{Icon: import('react').ElementType, color: string}}
 */
export function fileAppearanceOf(fileName) {
    const lowerCaseName = fileName.toLowerCase();
    return FILE_APPEARANCES.find(({pattern}) => pattern.test(lowerCaseName)) ?? DEFAULT_FILE_APPEARANCE;
}
