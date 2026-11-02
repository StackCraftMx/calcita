// Las llamadas del ejemplo de subir archivos al API (aquí, al servidor de mentira).
//
// Con un backend de verdad, downloadPaymentsTemplate pide la plantilla con la petición de la casa (como una descarga), y
// importPaymentsFile y uploadAttachments arman su FormData y suben con uploadWithProgress del
// paquete (la misma firma: lo de la pantalla, onProgress y la señal para cancelar), y attachmentPondServer se cambia por
// createPondServer({url}) de @stackcraftmx/calcita/filepond.
export {attachmentPondServer, downloadPaymentsTemplate, importPaymentsFile, uploadAttachments} from '@/fakeServer/uploadsServer.js';
