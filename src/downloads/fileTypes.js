// Los tipos de archivo que conocen las descargas: el ícono y el color con que se ven en el menú «Descargar» y en el panel.
// La casa trae los básicos (Excel, CSV y PDF); el proyecto agrega los suyos en ToolkitProvider `fileTypes` (un ZIP de
// facturas, el XML del SAT, un Word), con su ícono, su color y su texto: el paquete no conoce todos los tipos ni debe.
//
//   <ToolkitProvider fileTypes={{zip: {Icon: FolderZipOutlinedIcon, color: 'warning.main', label: 'ZIP', hint: 'Todas las facturas'}}}>
//
// El texto de un tipo de la casa sale de los textos del paquete (common:download.formats.<tipo>); el de uno del proyecto, de su
// label y hint (o de esas mismas llaves en sus texts).
//
// Hook genérico: function (regla de la casa).
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';

import {useToolkitSettings} from '@/toolkit/toolkitContext.js';

/** Los tipos de la casa: su ícono y su color (de la paleta del tema, claro y oscuro). */
export const DEFAULT_FILE_TYPES = Object.freeze({
    xlsx: Object.freeze({Icon: TableViewOutlinedIcon, color: 'success.main'}),
    csv: Object.freeze({Icon: TextSnippetOutlinedIcon, color: 'info.main'}),
    pdf: Object.freeze({Icon: PictureAsPdfOutlinedIcon, color: 'error.main'}),
});

/** Un tipo que nadie declaró: el ícono de archivo y el gris del texto. */
export const UNKNOWN_FILE_TYPE = Object.freeze({Icon: InsertDriveFileOutlinedIcon, color: 'text.secondary'});

/**
 * Los tipos que conoce esta app: los de la casa y los del proyecto (el del proyecto gana si se llama igual).
 *
 * @returns {Record<string, {Icon: import('react').ElementType, color: string, label?: string, hint?: string}>}
 */
export function useFileTypes() {
    const {fileTypes} = useToolkitSettings();
    return fileTypes ? {...DEFAULT_FILE_TYPES, ...fileTypes} : DEFAULT_FILE_TYPES;
}
