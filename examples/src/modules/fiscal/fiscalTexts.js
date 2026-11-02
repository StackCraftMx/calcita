// Los textos de los documentos fiscales (namespace fiscal).
export const fiscalTexts = {
    es: {
        fiscal: {
            menu: {label: 'Documentos fiscales', description: 'Facturas de proveedores (CFDI) y la e.firma de la empresa.'},
            permissions: {manage: 'Documentos fiscales', manageDescription: 'Cargar facturas de proveedores y revisar la e.firma.'},
            page: {
                title: 'Documentos fiscales',
                subtitle: 'La factura y la e.firma se leen en el navegador, sin subirlas: se ve qué dicen y qué está mal antes de mandar nada. Los archivos de ejemplo son de mentira.',
            },
            samples: {
                title: 'Archivos de ejemplo',
                text: 'Bájelos para probar: una factura para la tienda y una e.firma de la tienda. La contraseña de la llave de ejemplo es «{{password}}».',
                invoice: 'Factura (.xml)',
                certificate: 'Certificado (.cer)',
                key: 'Llave (.key)',
            },
            invoices: {
                title: 'Facturas de proveedores',
                text: 'Elija el XML: se revisa que sea una factura timbrada y para la tienda, y que no se haya cargado antes.',
                file: 'Factura (XML)',
                fileHelp: 'El archivo .xml que mandó el proveedor.',
                notCfdi: 'El archivo no es una factura (CFDI).',
                load: 'Cargar la factura',
                loadedTitle: 'Cargadas',
                empty: 'Todavía no hay facturas cargadas.',
                loadedAt: 'Cargada el {{date}}',
            },
            efirma: {
                title: 'e.firma de la empresa',
                text: 'El certificado se lee aquí mismo y «Revisar la e.firma» abre la llave con su contraseña en el navegador: nada viaja al servidor.',
            },
        },
    },
    en: {
        fiscal: {
            menu: {label: 'Tax documents', description: 'Supplier invoices (CFDI) and the company e.firma.'},
            permissions: {manage: 'Tax documents', manageDescription: 'Load supplier invoices and check the e.firma.'},
            page: {
                title: 'Tax documents',
                subtitle: 'The invoice and the e.firma are read in the browser, without uploading them: you see what they say and what is wrong before sending anything. The sample files are fake.',
            },
            samples: {
                title: 'Sample files',
                text: 'Download them to try: an invoice for the store and an e.firma of the store. The sample key password is «{{password}}».',
                invoice: 'Invoice (.xml)',
                certificate: 'Certificate (.cer)',
                key: 'Key (.key)',
            },
            invoices: {
                title: 'Supplier invoices',
                text: 'Choose the XML: it checks that it is a stamped invoice for the store and that it was not loaded before.',
                file: 'Invoice (XML)',
                fileHelp: 'The .xml file the supplier sent.',
                notCfdi: 'The file is not an invoice (CFDI).',
                load: 'Load the invoice',
                loadedTitle: 'Loaded',
                empty: 'No invoices loaded yet.',
                loadedAt: 'Loaded on {{date}}',
            },
            efirma: {
                title: 'Company e.firma',
                text: 'The certificate is read right here and «Revisar la e.firma» opens the key with its password in the browser: nothing goes to the server.',
            },
        },
    },
};
