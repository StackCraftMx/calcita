// Los textos del ejemplo de subir archivos (namespace uploads).
export const uploadsTexts = {
    es: {
        uploads: {
            menu: {
                label: 'Subir archivos',
                description: 'La zona de MUI y la de FilePond, con avance, cancelación y los rechazos del servidor.',
            },
            permissions: {
                upload: 'Subir archivos',
                uploadDescription: 'Importar un Excel y mandar adjuntos.',
            },
            page: {
                title: 'Subir archivos',
                subtitle: 'Dos zonas con el mismo uso: la de MUI, sin librerías, y la de FilePond, con varios archivos y avance por archivo. Cambiar de una a otra es cambiar el import.',
            },
            excel: {
                title: 'Importar un Excel · zona de MUI',
                text: 'Un archivo, revisado por tipo y peso al elegirlo. El servidor de mentira lo abre de verdad y cuenta sus renglones: pruebe con el reporte que se baja en «Descargas y Excel».',
                submit: 'Importar',
                done_one: '«{{fileName}}»: {{totalRows}} renglones en {{count}} hoja.',
                done_other: '«{{fileName}}»: {{totalRows}} renglones en {{count}} hojas.',
            },
            attachments: {
                title: 'Varios adjuntos en un envío · FilePond',
                text: 'PDF o imágenes, hasta 5 archivos y 5 MB entre todos. Un archivo vacío no entra: lo revisa el contenido al soltarlo.',
                submit: 'Enviar adjuntos',
                emptyFile: 'El archivo está vacío.',
                done_one: 'Se recibió {{count}} adjunto ({{size}}).',
                done_other: 'Se recibieron {{count}} adjuntos ({{size}}).',
            },
            pond: {
                title: 'Cada adjunto con su barra · FilePond con server',
                text: 'Cada archivo se sube por su cuenta al oprimir el botón, con su avance dentro de su tarjeta. El servidor acepta hasta 1 MB por adjunto: lo que pase de ahí muestra su error en la misma tarjeta.',
                submit: 'Subir cada uno',
                progress: 'Subidos {{done}} de {{total}}',
            },
            status: {
                sending: 'Subiendo {{percent}} %',
                processing: 'El servidor está procesando el archivo…',
                cancel: 'Cancelar',
                cancelled: 'Se canceló la subida. El archivo sigue elegido: puede volver a intentarlo.',
            },
        },
    },
    en: {
        uploads: {
            menu: {
                label: 'File uploads',
                description: 'The MUI and FilePond drop zones, with progress, cancellation and server rejections.',
            },
            permissions: {
                upload: 'Upload files',
                uploadDescription: 'Import an Excel file and send attachments.',
            },
            page: {
                title: 'File uploads',
                subtitle: 'Two drop zones used the same way: the MUI one, with no libraries, and the FilePond one, with several files and progress per file. Switching between them means changing the import.',
            },
            excel: {
                title: 'Import an Excel file · MUI zone',
                text: 'One file, checked by type and size when chosen. The fake server really opens it and counts its rows: try the report you download in «Downloads and Excel».',
                submit: 'Import',
                done_one: '“{{fileName}}”: {{totalRows}} rows in {{count}} sheet.',
                done_other: '“{{fileName}}”: {{totalRows}} rows in {{count}} sheets.',
            },
            attachments: {
                title: 'Several attachments in one submission · FilePond',
                text: 'PDF or images, up to 5 files and 5 MB in total. An empty file does not get in: its content is checked when dropped.',
                submit: 'Send attachments',
                emptyFile: 'The file is empty.',
                done_one: '{{count}} attachment was received ({{size}}).',
                done_other: '{{count}} attachments were received ({{size}}).',
            },
            pond: {
                title: 'Each attachment with its own bar · FilePond with server',
                text: 'Each file is uploaded on its own when you press the button, with its progress inside its card. The server accepts up to 1 MB per attachment: anything larger shows its error in the same card.',
                submit: 'Upload each one',
                progress: '{{done}} of {{total}} uploaded',
            },
            status: {
                sending: 'Uploading {{percent}}%',
                processing: 'The server is processing the file…',
                cancel: 'Cancel',
                cancelled: 'The upload was canceled. The file is still selected: you can try again.',
            },
        },
    },
};
