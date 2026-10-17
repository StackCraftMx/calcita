// La zona para soltar archivos con FilePond por dentro (@stackcraftmx/calcita/filepond): el mismo uso que la de MUI
// (FileDropzone de la puerta principal) más varios archivos, animaciones y avance por archivo. Pide filepond,
// react-filepond y sus dos complementos de validación (filepond-plugin-file-validate-type y -size).
export {default as FileDropzone} from '@/filepond/FileDropzone.jsx';
export {createPondServer} from '@/filepond/pondServer.js';
export {FILE_ACCEPT_PRESETS, FILE_REJECTION} from '@/upload/fileRules.js';
