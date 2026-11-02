// Lo que dice una factura electrónica (el XML del CFDI 3.3 o 4.0), leído en el navegador sin subirla: quién la emitió, a
// quién, cuánto, de qué tipo, sus conceptos y su folio fiscal (UUID) si ya está timbrada. Sirve para revisar antes de cargar
// (el RFC del receptor es el de la empresa, no se cargó dos veces) y enseñar el resumen.
//
// Los datos del CFDI viven en los ATRIBUTOS de sus elementos (Comprobante, Emisor, Receptor, Concepto, TimbreFiscalDigital),
// así que basta leer las etiquetas y sus atributos: sin DOMParser (no existe en Node, donde corren las pruebas) ni librerías.
// El prefijo del espacio de nombres (cfdi:, tfd:) no importa: se busca por el nombre del elemento.
//
// No revisa el sello ni pregunta al SAT si está vigente: eso es del servidor.
//
// Los montos se quedan en TEXTO tal como vienen ('1160.00'): así los lee Money sin redondeos de float.
//
// Puro (sin React): se prueba con node (cfdiReader.test.js).
//
// Genérico del paquete: function (regla de la casa).

/**
 * Una factura leída: los montos en texto, como vienen en el XML.
 *
 * @typedef {object} Cfdi
 * @property {string|null} version
 * @property {string|null} series
 * @property {string|null} folio
 * @property {string|null} issuedAt
 * @property {string|null} voucherType CFDI_VOUCHER_TYPE
 * @property {string|null} paymentMethod
 * @property {string|null} paymentForm
 * @property {string|null} currency
 * @property {string|null} exchangeRate
 * @property {string|null} subtotal
 * @property {string|null} discount
 * @property {string|null} total
 * @property {string|null} placeOfIssue
 * @property {{rfc: string|null, name: string|null, taxRegime: string|null}} issuer
 * @property {{rfc: string|null, name: string|null, cfdiUse: string|null, taxRegime: string|null, postalCode: string|null}} receiver
 * @property {Array<{productCode: string|null, quantity: string|null, unitCode: string|null, description: string|null, unitValue: string|null, amount: string|null}>} concepts
 * @property {{transferred: string|null, withheld: string|null}} taxes
 * @property {{uuid: string|null, stampedAt: string|null, certifierRfc: string|null}|null} stamp null: sin timbre del SAT
 */

/** El tipo de comprobante (TipoDeComprobante): ingreso, egreso, traslado, nómina o pago. */
export const CFDI_VOUCHER_TYPE = Object.freeze({income: 'I', expense: 'E', transfer: 'T', payroll: 'N', payment: 'P'});

// una etiqueta de apertura con sus atributos (las de cierre y los comentarios no traen datos)
const TAG_PATTERN = /<(?:[A-Za-z_][\w.-]*:)?([A-Za-z_][\w.-]*)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*\/?>/g;
const ATTRIBUTE_PATTERN = /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const XML_ENTITIES = Object.freeze({amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"});
const HEXADECIMAL_RADIX = 16;
const DECIMAL_RADIX = 10;

/**
 * Un valor de atributo con sus entidades de XML ya cambiadas (&amp; → &, &#241; → ñ).
 *
 * @param {string} value
 * @returns {string}
 */
function decodeXmlText(value) {
    return value.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (entity, code) => {
        if (code[0] === '#') {
            const isHexadecimal = code[1].toLowerCase() === 'x';
            return String.fromCodePoint(parseInt(code.slice(isHexadecimal ? 2 : 1), isHexadecimal ? HEXADECIMAL_RADIX : DECIMAL_RADIX));
        }
        return XML_ENTITIES[code] ?? entity;
    });
}

/**
 * Los elementos del XML, en orden, con su nombre (sin prefijo) y sus atributos.
 *
 * @param {string} xmlText
 * @returns {Array<{name: string, attributes: Record<string, string>}>}
 */
function elementsOf(xmlText) {
    const elements = [];
    for (const [, name, attributesText] of xmlText.matchAll(TAG_PATTERN)) {
        const attributes = {};
        for (const [, attributeName, doubleQuoted, singleQuoted] of attributesText.matchAll(ATTRIBUTE_PATTERN)) {
            attributes[attributeName] = decodeXmlText(doubleQuoted ?? singleQuoted);
        }
        elements.push({name, attributes});
    }
    return elements;
}

/**
 * Lee el XML de un CFDI.
 *
 * @param {string} xmlText
 * @returns {Cfdi|null} null si el XML no es un CFDI (no trae su Comprobante con Emisor y Receptor)
 */
export function readCfdi(xmlText) {
    const elements = elementsOf(xmlText ?? '');
    const first = (name) => elements.find((element) => element.name === name)?.attributes;
    const voucher = first('Comprobante');
    const issuer = first('Emisor');
    const receiver = first('Receptor');
    // guard clause: otro XML (una addenda suelta, un acuse) no es una factura
    if (!voucher || !issuer || !receiver) {
        return null;
    }
    // los impuestos del comprobante son los que traen los totales (los de cada concepto no)
    const totals = elements.find((element) => element.name === 'Impuestos'
        && ('TotalImpuestosTrasladados' in element.attributes || 'TotalImpuestosRetenidos' in element.attributes))?.attributes ?? {};
    const stamp = first('TimbreFiscalDigital');

    return {
        version: voucher.Version ?? voucher.version ?? null,
        series: voucher.Serie ?? null,
        folio: voucher.Folio ?? null,
        issuedAt: voucher.Fecha ?? null,
        voucherType: voucher.TipoDeComprobante ?? null,
        paymentMethod: voucher.MetodoPago ?? null,
        paymentForm: voucher.FormaPago ?? null,
        currency: voucher.Moneda ?? null,
        exchangeRate: voucher.TipoCambio ?? null,
        subtotal: voucher.SubTotal ?? null,
        discount: voucher.Descuento ?? null,
        total: voucher.Total ?? null,
        placeOfIssue: voucher.LugarExpedicion ?? null,
        issuer: {rfc: issuer.Rfc ?? null, name: issuer.Nombre ?? null, taxRegime: issuer.RegimenFiscal ?? null},
        receiver: {
            rfc: receiver.Rfc ?? null, name: receiver.Nombre ?? null, cfdiUse: receiver.UsoCFDI ?? null,
            taxRegime: receiver.RegimenFiscalReceptor ?? null, postalCode: receiver.DomicilioFiscalReceptor ?? null,
        },
        concepts: elements.filter((element) => element.name === 'Concepto').map(({attributes}) => ({
            productCode: attributes.ClaveProdServ ?? null,
            quantity: attributes.Cantidad ?? null,
            unitCode: attributes.ClaveUnidad ?? null,
            description: attributes.Descripcion ?? null,
            unitValue: attributes.ValorUnitario ?? null,
            amount: attributes.Importe ?? null,
        })),
        taxes: {transferred: totals.TotalImpuestosTrasladados ?? null, withheld: totals.TotalImpuestosRetenidos ?? null},
        // sin timbre todavía no es factura ante el SAT: no tiene folio fiscal
        stamp: stamp
            ? {uuid: stamp.UUID?.toUpperCase() ?? null, stampedAt: stamp.FechaTimbrado ?? null, certifierRfc: stamp.RfcProvCertif ?? null}
            : null,
    };
}

/**
 * Lee el CFDI de un archivo elegido (un File o un Blob).
 *
 * @param {Blob} file
 * @returns {Promise<Cfdi|null>} lo de readCfdi
 */
export async function readCfdiFile(file) {
    return readCfdi(await file.text());
}
