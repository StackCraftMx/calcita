// Pruebas de la lectura del CFDI. Sin navegador: pnpm test. La factura es inventada (RFC genéricos de pruebas del SAT, folio
// fiscal al azar, sin sello real).
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {CFDI_VOUCHER_TYPE, readCfdi} from '@/mexico/cfdiReader.js';

const SAMPLE_CFDI = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" Version="4.0" Serie="A" Folio="1024" Fecha="2026-10-28T10:15:00"
    SubTotal="1000.00" Moneda="MXN" Total="1160.00" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" FormaPago="03"
    LugarExpedicion="64000">
  <cfdi:Emisor Rfc="AAA010101AAA" Nombre="MUEBLES &amp; ACABADOS DE EJEMPLO" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="XAXX010101000" Nombre="PÚBLICO EN GENERAL" DomicilioFiscalReceptor="64000" RegimenFiscalReceptor="616" UsoCFDI="S01"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="56101500" Cantidad="2" ClaveUnidad="H87" Descripcion="Silla de oficina" ValorUnitario="500.00" Importe="1000.00" ObjetoImp="02">
      <cfdi:Impuestos><cfdi:Traslados><cfdi:Traslado Base="1000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="160.00"/></cfdi:Traslados></cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="160.00">
    <cfdi:Traslados><cfdi:Traslado Base="1000.00" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="160.00"/></cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="1.1"
        UUID="6f2d1c8e-12ab-4cd3-9e0f-0123456789ab" FechaTimbrado="2026-10-28T10:16:02" RfcProvCertif="SAT970701NN3"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

test('lee quién emite, a quién, cuánto y de qué tipo', () => {
    const cfdi = readCfdi(SAMPLE_CFDI);
    assert.equal(cfdi.version, '4.0');
    assert.equal(cfdi.voucherType, CFDI_VOUCHER_TYPE.income);
    assert.deepEqual(cfdi.issuer, {rfc: 'AAA010101AAA', name: 'MUEBLES & ACABADOS DE EJEMPLO', taxRegime: '601'});
    assert.equal(cfdi.receiver.name, 'PÚBLICO EN GENERAL');
    assert.equal(cfdi.receiver.cfdiUse, 'S01');
    // los montos en texto, como vienen: listos para Money
    assert.equal(cfdi.total, '1160.00');
    assert.equal(cfdi.taxes.transferred, '160.00');
});

test('los conceptos y el folio fiscal del timbre', () => {
    const cfdi = readCfdi(SAMPLE_CFDI);
    assert.deepEqual(cfdi.concepts, [{
        productCode: '56101500', quantity: '2', unitCode: 'H87', description: 'Silla de oficina', unitValue: '500.00', amount: '1000.00',
    }]);
    assert.equal(cfdi.stamp.uuid, '6F2D1C8E-12AB-4CD3-9E0F-0123456789AB');
    assert.equal(cfdi.stamp.certifierRfc, 'SAT970701NN3');
});

test('sin timbre no hay folio fiscal; otro XML no es CFDI', () => {
    const unstamped = SAMPLE_CFDI.replace(/<cfdi:Complemento>[\s\S]*<\/cfdi:Complemento>/, '');
    assert.equal(readCfdi(unstamped).stamp, null);
    assert.equal(readCfdi('<?xml version="1.0"?><acuse Estatus="Vigente"/>'), null);
    assert.equal(readCfdi(''), null);
});
