// Las llamadas del ejemplo de subir archivos al API (aquí, al servidor de mentira).
//
// Con un backend de verdad, importPaymentsFile y uploadAttachments arman su FormData y suben con uploadWithProgress del
// paquete (la misma firma: lo de la pantalla, onProgress y la señal para cancelar), y attachmentPondServer se cambia por
// createPondServer({url}) de @stackcraftmx/calcita/filepond.
export {attachmentPondServer, importPaymentsFile, uploadAttachments} from '@/fakeServer/uploadsServer.js';
