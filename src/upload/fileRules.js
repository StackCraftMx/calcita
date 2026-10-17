// Las reglas de qué archivo se acepta: su tipo (accept) y su peso (maxSize). Las comparten las dos zonas para soltar
// archivos del paquete, la de MUI (upload/FileDropzone.jsx) y la de FilePond (filepond/FileDropzone.jsx), para que se
// configuren igual.
//
//   accept   un nombre del menú ('excel'), una lista (['excel', 'pdf']) o lo de siempre del input ('.xlsx,.xls',
//            'image/*'); se pueden mezclar: ['excel', '.dat'].
//   maxSize  bytes (número) o texto con unidades: '500 KB', '10mb', '1 GB'.
//
// OJO: los tamaños van en base 1000 (1 MB = 1,000,000 bytes), igual que formatFileSize y que el navegador en sus
// descargas. En base 1024 un límite de «10 MB» se pintaría como «10.5 MB».
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (fileRules.test.js).

/**
 * Por qué se rechazó un archivo (lo que recibe onReject de las dos zonas). La de MUI solo rechaza por tipo y por peso;
 * la de FilePond además por el peso de todos juntos, por cantidad y por contenido (validate).
 */
export const FILE_REJECTION = Object.freeze({type: 'type', size: 'size', total: 'total', count: 'count', content: 'content'});

/** El menú de tipos comunes, para no memorizar extensiones. */
export const FILE_ACCEPT_PRESETS = Object.freeze({
    excel: '.xlsx,.xls',
    csv: '.csv',
    pdf: '.pdf',
    word: '.doc,.docx',
    text: '.txt',
    json: '.json',
    xml: '.xml',
    zip: '.zip,.rar,.7z',
    image: 'image/*',
    audio: 'audio/*',
    video: 'video/*',
});

// bytes de cada unidad que se puede escribir en maxSize
const BYTES_BY_UNIT = Object.freeze({b: 1, kb: 1e3, mb: 1e6, gb: 1e9});
const SIZE_TEXT = /^\s*(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?\s*$/i;
const ACCEPT_SEPARATOR = ',';
const WILDCARD_SUFFIX = '/*';

/**
 * El accept del paquete como lo entiende el input del navegador.
 *
 * @param {string|string[]|undefined} accept 'excel' | ['excel', 'pdf'] | '.xlsx,.xls' | 'image/*'
 * @returns {string|undefined} '.xlsx,.xls,.pdf'; undefined si se acepta todo
 */
export function resolveAccept(accept) {
    if (!accept) {
        return undefined;
    }
    const parts = Array.isArray(accept) ? accept : [accept];
    return parts.map((part) => FILE_ACCEPT_PRESETS[String(part).toLowerCase()] ?? part).join(ACCEPT_SEPARATOR);
}

/**
 * ¿El archivo es de un tipo permitido? Revisa la extensión (.xlsx), el tipo exacto (application/pdf) o la familia
 * (image/*). El input del navegador ya filtra al elegir, pero al soltar un archivo no filtra nada.
 *
 * @param {{name: string, type?: string}} file
 * @param {string|undefined} resolvedAccept lo que regresa resolveAccept
 * @returns {boolean}
 */
export function matchesAccept(file, resolvedAccept) {
    if (!resolvedAccept) {
        return true;
    }
    const fileName = file.name.toLowerCase();
    const fileType = (file.type ?? '').toLowerCase();
    return resolvedAccept
        .split(ACCEPT_SEPARATOR)
        .map((rule) => rule.trim().toLowerCase())
        .filter(Boolean)
        .some((rule) => {
            if (rule.startsWith('.')) {
                return fileName.endsWith(rule);
            }
            if (rule.endsWith(WILDCARD_SUFFIX)) {
                return fileType.startsWith(rule.slice(0, -1));
            }
            return fileType === rule;
        });
}

/**
 * Un tamaño escrito por una persona en bytes: '10 MB' → 10000000.
 *
 * @param {number|string|undefined|null} size
 * @returns {number|null} null si no hay límite
 */
export function parseFileSize(size) {
    if (size === undefined || size === null || size === '') {
        return null;
    }
    if (typeof size === 'number') {
        return size;
    }
    const match = SIZE_TEXT.exec(size);
    // guard clause: un límite mal escrito es error de quien configura, no algo que se ignore callado
    if (!match) {
        throw new Error(`«${size}» no es un tamaño: se espera un número de bytes o algo como '10 MB'`);
    }
    return Math.round(Number(match[1]) * BYTES_BY_UNIT[(match[2] ?? 'b').toLowerCase()]);
}
