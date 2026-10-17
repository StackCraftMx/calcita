// Textos del paquete en español (el idioma por omisión). Cada proyecto puede cambiar cualquiera con `texts` o `translate`
// de ToolkitProvider, con la misma forma: namespace, llaves anidadas, {{variable}} y plurales _one / _other.
export default Object.freeze({
    "table": {
        "search": {
            "placeholder": "Buscar dentro de estos resultados…"
        },
        "count": {
            "records_one": "{{total}} registro",
            "records_other": "{{total}} registros",
            "capped": "más de {{total}} registros",
            "cappedTag": "total aproximado",
            "cappedTooltip": "Hay al menos estos registros y puede haber más: agregue un filtro para verlos todos."
        },
        "empty": {
            "default": "Sin registros",
            "filtered": "Ningún registro cumple con los filtros aplicados.",
            "clearFilters": "Quitar los filtros"
        },
        "chips": {
            "applied_one": "{{count}} filtro aplicado",
            "applied_other": "{{count}} filtros aplicados",
            "clearAll": "Limpiar todo"
        },
        "columnFilter": {
            "tooltip": "Filtrar (se aplica a todos los registros, no solo a esta página)",
            "activeTooltip_one": "{{count}} filtro en esta columna",
            "activeTooltip_other": "{{count}} filtros en esta columna",
            "clear": "Limpiar esta columna",
            "contains": "Contiene"
        },
        "options": {
            "searchPlaceholder": "Buscar opción…",
            "empty": "Sin valores en este resultado",
            "noMatch": "Ninguna opción coincide con “{{text}}”"
        },
        "sort": {
            "tooltip": "Ordenar por esta columna",
            "ascending": "orden ascendente",
            "descending": "orden descendente",
            "clear": "Quitar el orden"
        },
        "goToPage": {
            "page": "Página",
            "of_one": "de {{total}}",
            "of_other": "de {{total}}",
            "ariaLabel": "Ir a la página"
        },
        "quickFilters": {
            "all": "Todos",
            "countAriaLabel": "{{count}} registros"
        },
        "detail": {
            "tooltip": "Ver detalle",
            "ariaLabel": "Ver el detalle de este registro"
        },
        "error": {
            "generic": "No pudimos consultar la tabla."
        },
        "dateRange": {
            "label": "Personalizado",
            "title": "Rango de fechas",
            "from": "Desde",
            "to": "Hasta",
            "fromHelp": "Desde el inicio de ese día",
            "toHelp": "Hasta el final de ese día",
            "invalid": "«Hasta» no puede ser antes de «Desde»",
            "summary": "{{from}} – {{to}}",
            "today": "hoy",
            "clear": "Quitar",
            "apply": "Aplicar"
        },
        "audit": {
            "columns": {
                "occurredAt": "Fecha y hora",
                "event": "Qué pasó",
                "result": "Resultado",
                "actor": "Quién"
            },
            "systemActor": "Proceso automático",
            "eventFilterCaption": "Filtrar por evento",
            "count_one": "{{count}} evento",
            "count_other": "{{count}} eventos",
            "empty": "Todavía no hay eventos registrados."
        }
    },
    "common": {
        "actions": {
            "cancel": "Cancelar",
            "confirm": "Confirmar",
            "retry": "Intentar de nuevo",
            "download": "Descargar",
            "close": "Cerrar",
            "back": "Regresar",
            "reload": "Recargar la página"
        },
        "status": {
            "loading": "Cargando…",
            "noData": "Sin datos"
        },
        "form": {
            "showPassword": "Mostrar contraseña",
            "hidePassword": "Ocultar contraseña",
            "clear": "Borrar el texto",
            "selectPlaceholder": "Elija una opción",
            "copy": "Copiar",
            "copied": "Copiado",
            "noOptions": "Ninguna opción coincide",
            "loadingOptions": "Cargando opciones…",
            "pickColor": "Elegir el color",
            "colorContrast": "Contraste sobre blanco: {{ratio}}:1",
            "colorLowContrast": "Con ese color el texto casi no se leería sobre blanco. {{suggestion}} es el mismo tono, más oscuro.",
            "colorUseSuggestion": "Usar {{color}}"
        },
        "wizard": {
            "next": "Siguiente",
            "back": "Anterior",
            "skip": "Omitir este paso",
            "optional": "Opcional",
            "skipped": "Omitido",
            "stepOf": "Paso {{current}} de {{total}}"
        },
        "language": {
            "switchTo": {
                "es": "Cambiar a español",
                "en": "Cambiar a inglés"
            }
        },
        "colorScheme": {
            "label": "Claro u oscuro",
            "switchTo": {
                "light": "Cambiar a modo claro",
                "dark": "Cambiar a modo oscuro"
            }
        },
        "toast": {
            "done": "Listo",
            "error": "Ocurrió un error",
            "warning": "Atención",
            "info": "Aviso",
            "working": "Procesando…"
        },
        "waiting": {
            "title": "Un momento",
            "text": "Estamos procesando su solicitud. No cierre esta ventana."
        },
        "newBuild": {
            "message": "Hay una versión nueva del sistema. Recargue la página para usarla.",
            "short": "Versión nueva disponible",
            "reload": "Recargar"
        },
        "upload": {
            "hint": "Arrastre aquí su archivo",
            "hintMultiple": "Arrastre aquí sus archivos",
            "choose": "Elegir archivo",
            "chooseMultiple": "Elegir archivos",
            "remove": "Quitar {{name}}",
            "invalidTitle": "Archivo no permitido",
            "invalidType": "«{{name}}» no es de un tipo permitido. Se aceptan: {{accept}}.",
            "tooLarge": "«{{name}}» pesa más de {{max}}.",
            "tooLargeShort": "Pesa más de lo permitido",
            "totalTooLargeShort": "Entre todos pesan más de lo permitido",
            "tooManyFiles_one": "Se puede subir {{count}} archivo como máximo.",
            "tooManyFiles_other": "Se pueden subir {{count}} archivos como máximo.",
            "maxSizeHint": "Hasta {{max}} por archivo",
            "maxTotalSizeHint": "Hasta {{max}} entre todos",
            "maxFilesHint_one": "Hasta {{count}} archivo",
            "maxFilesHint_other": "Hasta {{count}} archivos",
            "summary_one": "{{count}} archivo · {{total}}",
            "summary_other": "{{count}} archivos · {{total}}",
            "summaryOf_one": "{{count}} archivo · {{total}} de {{max}}",
            "summaryOf_other": "{{count}} archivos · {{total}} de {{max}}",
            "pond": {
                "loading": "Cargando",
                "loadError": "No se pudo cargar",
                "waitingForSize": "Calculando el peso",
                "sizeNotAvailable": "Peso no disponible",
                "invalidField": "Hay archivos que no son válidos",
                "processing": "Subiendo",
                "processingComplete": "Subido",
                "processingAborted": "Subida cancelada",
                "processingError": "No se pudo subir",
                "revertError": "No se pudo deshacer",
                "removeError": "No se pudo quitar",
                "tapToCancel": "toque para cancelar",
                "tapToRetry": "toque para reintentar",
                "tapToUndo": "toque para deshacer",
                "remove": "Quitar",
                "abortLoad": "Cancelar",
                "retryLoad": "Reintentar",
                "abortProcessing": "Cancelar",
                "undoProcessing": "Deshacer",
                "retryProcessing": "Reintentar",
                "processItem": "Subir"
            }
        },
        "download": {
            "formats": {
                "pdf": {
                    "label": "PDF",
                    "hint": "Para leer, imprimir o archivar"
                },
                "xlsx": {
                    "label": "Excel",
                    "hint": "Para filtrar y cruzar con otros datos"
                },
                "csv": {
                    "label": "CSV",
                    "hint": "Texto plano, para importar a otro sistema"
                }
            }
        },
        "downloads": {
            "title": "Descargas",
            "summaryDownloading_one": "Descargando {{count}} archivo…",
            "summaryDownloading_other": "Descargando {{count}} archivos…",
            "summaryCompleted_one": "{{count}} descarga lista",
            "summaryCompleted_other": "{{count}} descargas listas",
            "summaryFailed_one": "{{count}} descarga no se pudo completar",
            "summaryFailed_other": "{{count}} descargas no se pudieron completar",
            "collapse": "Minimizar",
            "expand": "Ver descargas",
            "close": "Cerrar",
            "cancel": "Cancelar descarga",
            "cancelOf": "Cancelar la descarga de {{name}}",
            "completedOf": "{{name}} descargado",
            "failedOf": "No se pudo descargar {{name}}",
            "canceledOf": "Se canceló la descarga de {{name}}",
            "preparing": "Preparando el archivo…",
            "progressOf": "{{loaded}} de {{total}}",
            "progressLoaded": "{{loaded}} descargados",
            "failed": "No se pudo descargar",
            "canceled": "Cancelada"
        },
        "charts": {
            "viewAsTable": "Ver como tabla",
            "viewAsChart": "Ver como gráfica",
            "less": "Menos",
            "more": "Más",
            "day": "Día"
        }
    },
    "layout": {
        "skipToContent": "Saltar al contenido",
        "drawer": {
            "open": "Abrir el menú",
            "ariaLabel": "Menú principal",
            "expand": "Abrir el menú lateral",
            "collapse": "Encoger el menú lateral",
            "more": "Más",
            "scrollDown": "Ver más del menú",
            "scrollUp": "Ver lo de arriba del menú"
        },
        "account": {
            "open": "Abrir el menú de su cuenta",
            "myProfile": "Mi perfil"
        },
        "settings": {
            "open": "Ajustes",
            "language": "Idioma",
            "colorScheme": "Claro u oscuro",
            "light": "Claro",
            "dark": "Oscuro"
        },
        "fontSize": {
            "label": "Tamaño de letra",
            "normal": "Normal",
            "large": "Grande",
            "xLarge": "Muy grande"
        },
        "languageName": {
            "es": "Español",
            "en": "English"
        },
        "breadcrumbs": "Dónde está",
        "signOut": "Salir",
        "navigating": "Cargando la pantalla"
    },
    "auth": {
        "signIn": {
            "title": "Iniciar sesión",
            "subtitle": "Entre con su correo y su contraseña.",
            "email": "Correo electrónico",
            "password": "Contraseña",
            "remember": "Mantener la sesión abierta en este equipo",
            "submit": "Entrar",
            "forgot": "¿Olvidó su contraseña?"
        },
        "forgotPassword": {
            "title": "Recuperar su contraseña",
            "subtitle": "Escriba el correo con el que entra y le enviaremos un enlace para elegir una contraseña nueva.",
            "email": "Correo electrónico",
            "submit": "Enviar el enlace",
            "sentTitle": "Revise su correo",
            "sent": "Si {{email}} tiene una cuenta, le llegará un enlace en unos minutos. Si no lo ve, revise el correo no deseado.",
            "backToSignIn": "Regresar a iniciar sesión"
        },
        "changePassword": {
            "title": "Cambiar contraseña",
            "current": "Contraseña actual",
            "next": "Contraseña nueva",
            "confirm": "Repita la contraseña nueva",
            "submit": "Cambiar contraseña",
            "mismatch": "Las dos contraseñas nuevas no son iguales.",
            "sameAsCurrent": "La contraseña nueva debe ser distinta de la actual.",
            "notAccepted": "La contraseña nueva no cumple con lo que se pide abajo.",
            "done": "Su contraseña cambió. La próxima vez entre con la nueva."
        },
        "passwordRules": {
            "title": "La contraseña nueva debe tener",
            "minLength": "Al menos {{count}} caracteres",
            "lowercase": "Una letra minúscula",
            "uppercase": "Una letra mayúscula",
            "number": "Un número",
            "symbol": "Un símbolo, por ejemplo ! ? # -",
            "met": "ya cumple",
            "missing": "falta"
        }
    },
    "access": {
        "permissions": {
            "countOf": "{{count}} de {{total}}",
            "allOf": "Todos los permisos de {{group}}"
        }
    },
    "metricCard": {
        "trend": {
            "up": "Subió",
            "down": "Bajó",
            "flat": "Sin cambio"
        }
    },
    "errorPage": {
        "goHome": "Ir al inicio",
        "retry": "Intentar de nuevo",
        "notFound": {
            "title": "Esta página no existe",
            "text": "La dirección no corresponde a ninguna pantalla. Puede que el enlace esté incompleto o que la página ya no exista."
        },
        "forbidden": {
            "title": "No tiene permiso para ver esta pantalla",
            "text": "Su usuario no tiene acceso a esta información. Si considera que es un error, comuníquese con el administrador."
        },
        "serverError": {
            "title": "Algo falló de nuestro lado",
            "text": "No pudimos mostrar esta pantalla. Inténtelo de nuevo en un momento; si el problema continúa, comuníquese con soporte."
        }
    },
    "problems": {
        "offline": {
            "title": "Sin conexión",
            "detail": "No pudimos comunicarnos con el servidor. Revise su conexión e inténtelo de nuevo."
        },
        "unauthenticated": {
            "title": "Necesita iniciar sesión",
            "detail": "Su sesión no es válida o ya terminó. Inicie sesión de nuevo para continuar."
        },
        "forbidden": {
            "title": "No tiene permiso para realizar esta acción",
            "detail": "Su usuario no tiene acceso a esta información u operación. Si considera que es un error, comuníquese con el administrador."
        },
        "notFound": {
            "title": "No encontramos lo que busca",
            "detail": "La dirección o el registro que solicitó no existe o ya no está disponible."
        },
        "conflict": {
            "title": "No se puede realizar en este momento",
            "detail": "El registro cambió o no está en el estado que se necesita. Actualice la pantalla e inténtelo de nuevo."
        },
        "payloadTooLarge": {
            "title": "Lo que envió es demasiado grande",
            "detail": "El archivo o los datos superan el tamaño máximo permitido."
        },
        "csrfTokenMismatch": {
            "title": "La página necesita actualizarse",
            "detail": "Pasó demasiado tiempo o la página quedó desactualizada. Recárguela e inténtelo de nuevo."
        },
        "validation": {
            "title": "Los datos enviados no son válidos",
            "detail": "Revise los campos marcados e inténtelo de nuevo."
        },
        "tooManyRequests": {
            "title": "Demasiados intentos seguidos",
            "detail": "Hizo muchas solicitudes en poco tiempo. Espere un momento e inténtelo de nuevo."
        },
        "serverError": {
            "title": "No pudimos completar su solicitud",
            "detail": "Ocurrió un problema en el servidor. Inténtelo en un momento; si el problema continúa, comuníquese con soporte."
        },
        "serviceUnavailable": {
            "title": "El servicio no está disponible",
            "detail": "El servidor no está respondiendo en este momento. Inténtelo más tarde."
        },
        "generic": {
            "title": "No pudimos completar su solicitud",
            "detail": "Ocurrió un problema con su solicitud. Si continúa, comuníquese con soporte."
        },
        "gone": {
            "title": "Esto ya no está disponible",
            "detail": "El enlace o el registro venció o ya se usó."
        }
    },
    "validation": {
        "default": "El valor no es válido.",
        "required": "Este campo es obligatorio.",
        "notType": "El valor no tiene el formato esperado.",
        "oneOf": "Elija una de las opciones.",
        "notOneOf": "Ese valor no está permitido.",
        "email": "Escriba un correo válido, por ejemplo nombre@empresa.com.",
        "url": "Escriba una dirección web válida.",
        "uuid": "El identificador no es válido.",
        "stringLength_one": "Escriba exactamente {{count}} carácter.",
        "stringLength_other": "Escriba exactamente {{count}} caracteres.",
        "stringMin_one": "Escriba al menos {{count}} carácter.",
        "stringMin_other": "Escriba al menos {{count}} caracteres.",
        "stringMax_one": "Escriba como máximo {{count}} carácter.",
        "stringMax_other": "Escriba como máximo {{count}} caracteres.",
        "matches": "El formato no es válido.",
        "trim": "Quite los espacios al inicio y al final.",
        "lowercase": "Escríbalo en minúsculas.",
        "uppercase": "Escríbalo en mayúsculas.",
        "numberMin": "No puede ser menor que {{min}}.",
        "numberMax": "No puede ser mayor que {{max}}.",
        "lessThan": "Debe ser menor que {{less}}.",
        "moreThan": "Debe ser mayor que {{more}}.",
        "positive": "Debe ser un número positivo.",
        "negative": "Debe ser un número negativo.",
        "integer": "Debe ser un número entero.",
        "dateMin": "La fecha no puede ser anterior a {{min}}.",
        "dateMax": "La fecha no puede ser posterior a {{max}}.",
        "arrayMin_one": "Elija al menos {{count}} opción.",
        "arrayMin_other": "Elija al menos {{count}} opciones.",
        "arrayMax_one": "Elija como máximo {{count}} opción.",
        "arrayMax_other": "Elija como máximo {{count}} opciones.",
        "arrayLength_one": "Elija exactamente {{count}} opción.",
        "arrayLength_other": "Elija exactamente {{count}} opciones."
    },
    "dictionaries": {
        "unknown": {
            "label": "Sin estatus",
            "tooltip": ""
        }
    }
});
