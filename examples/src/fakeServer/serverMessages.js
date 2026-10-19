// Los textos que manda el servidor de mentira, en el idioma que pide la pantalla.
//
// Un backend con RFC 9457 responde title, detail y los errores de cada campo ya traducidos, en el idioma del header
// Accept-Language. Aquí no hay header: el servidor lee el idioma activo del paquete (toolkitSettings), que es el que la
// app le puso a ToolkitProvider. Por eso, después de cambiar a inglés, los mensajes nuevos del servidor llegan en
// inglés.
//
// Funciones puras, sin React: function (regla de la casa).
import {toolkitSettings} from '@stackcraftmx/calcita';

const SERVER_TEXTS = Object.freeze({
    es: {
        security: {
            noSessionTitle: 'Necesita iniciar sesión',
            noSession: 'Su sesión terminó. Vuelva a entrar para continuar.',
            passwordRequired: 'Escriba su contraseña.',
            wrongCodeTitle: 'Código incorrecto',
            wrongCode: 'Ese código no es correcto.',
            lockedTitle: 'Demasiados intentos',
            locked: 'Se acabaron los intentos. Vuelva a escribir su contraseña para empezar de nuevo.',
            expiredTitle: 'Pasó demasiado tiempo',
            expired: 'Pasaron más de 5 minutos. Vuelva a escribir su contraseña.',
            defaultPasskeyName: 'Llave de acceso {{number}}',
        },
        branches: {
            nameRequired: 'Escriba el nombre de la sucursal.',
            duplicateName: 'Ya hay una sucursal «{{name}}» en {{city}}.',
            cityRequired: 'Elija la ciudad de la sucursal.',
            addressRequired: 'Escriba la dirección de la sucursal.',
            created: 'Se agregó la sucursal {{name}}.',
        },
        calendar: {
            titleRequired: 'Escriba de qué es la cita (hasta 120 caracteres).',
            kindInvalid: 'Elija un tipo de cita de la lista.',
            dateInvalid: 'La fecha y la hora no son válidas.',
            endBeforeStart: 'La hora de fin tiene que ser después de la de inicio.',
            meetingUrlInvalid: 'La liga de la reunión tiene que empezar con https://.',
            attendeeInvalid: 'Elija invitados del equipo.',
            updated: 'Se guardaron los cambios de la cita.',
            sundayTitle: 'Los domingos no hay entregas',
            sunday: 'La tienda no entrega en domingo. Elija otro día.',
            customerRequired: 'Escriba el nombre del cliente.',
            created: 'Se agendó la cita de {{customer}}.',
            deleted: 'Se borró la cita.',
            notFoundTitle: 'La cita ya no existe',
            notFound: 'Alguien la borró. Recargue el calendario.',
        },
        tasks: {
            fullTitle: 'La columna está llena',
            full: '«{{column}}» tiene un tope de {{limit}} tareas en curso. Termine una antes de empezar otra.',
            notFoundTitle: 'La tarea ya no existe',
            notFound: 'Alguien la borró o la archivó. El tablero se volvió a cargar.',
            titleInvalid: 'Escriba un título de hasta {{max}} caracteres.',
            dueDateInvalid: 'La fecha va como día, mes y año.',
            priorityInvalid: 'Elija una prioridad de la lista.',
            assigneeInvalid: 'Elija a alguien del equipo.',
        },
        mail: {
            sent: 'Se mandó el mensaje a {{to}}.',
            toInvalid: 'Escriba uno o más correos válidos, separados por coma.',
            ccInvalid: 'Hay un correo que no es válido; sepárelos por coma.',
            subjectRequired: 'Escriba el asunto.',
            notFoundTitle: 'No encontramos la conversación',
            notFound: 'Ya no existe: puede que la hayan borrado para siempre.',
            folderInvalid: 'Esa carpeta no existe.',
            undoTooLateTitle: 'Ya no se puede deshacer',
            undoTooLate: 'El mensaje ya salió: el tiempo para deshacerlo terminó.',
            undone: 'Se deshizo el envío: el mensaje no salió.',
            draftSaved: 'Se guardó el borrador.',
            draftDiscarded: 'Se tiró el borrador.',
        },
        accounts: {
            store: 'Tienda de ejemplo',
            signInFailedTitle: 'No pudimos iniciar su sesión',
            signInFailed: 'El correo o la contraseña no son correctos.',
            nameRequired: 'Escriba su nombre.',
            phoneInvalid: 'El teléfono lleva 10 dígitos, sin espacios.',
            departmentInvalid: 'Elija un área de la lista.',
            accountSaved: 'Se guardaron sus datos.',
            profileLockedTitle: 'Este perfil no se puede cambiar',
            profileLocked: 'El perfil de administración siempre tiene todos los permisos: así nadie se queda sin poder entrar a los perfiles.',
            profileSaved: 'Se guardaron los permisos de {{name}}.',
        },
        validation: {
            title: 'Los datos enviados no son válidos',
            detail: 'Revise los campos marcados e inténtelo de nuevo.',
        },
        customers: {
            created: 'Se dio de alta a {{name}}.',
            nameRequired: 'Escriba el nombre del cliente.',
            emailInvalid: 'Escriba un correo válido.',
            emailTaken: 'Ya hay un cliente con este correo.',
            phoneInvalid: 'El teléfono lleva 10 dígitos, sin espacios.',
            typeInvalid: 'Elija un tipo de cliente.',
            creditLimitInvalid: 'Escriba el límite de crédito.',
            creditLimitTooHigh: {
                retail: 'Para clientes de menudeo el límite de crédito es de hasta {{max}}.',
                wholesale: 'Para clientes de mayoreo el límite de crédito es de hasta {{max}}.',
            },
            stateInvalid: 'Elija un estado de la lista.',
            deliveryDaysInvalid: 'Elija al menos un día de lunes a sábado.',
            sinceInFuture: 'La fecha no puede ser posterior a hoy.',
            saveFailedTitle: 'No pudimos guardar el cliente',
            saveFailedDetail: 'Ocurrió un problema en el servidor. Inténtelo en un momento.',
        },
        orders: {
            notFoundTitle: 'No encontramos el pedido',
            notFoundDetail: 'El pedido {{orderId}} no existe.',
            cannotCancelTitle: 'El pedido ya no se puede cancelar',
            alreadyShipped: 'El pedido {{number}} ya salió a entrega: ya no se puede cancelar.',
            alreadyCanceled: 'El pedido {{number}} ya estaba cancelado.',
            canceled: 'Se canceló el pedido {{number}}.',
            remindersSentOne: 'Se envió el recordatorio de pago a {{count}} cliente.',
            remindersSentOther: 'Se envió el recordatorio de pago a {{count}} clientes.',
            bulkCanceledOne: 'Se canceló {{count}} pedido.',
            bulkCanceledOther: 'Se cancelaron {{count}} pedidos.',
            bulkSkippedOne: '{{count}} ya había salido a entrega o estaba cancelado y se quedó como estaba.',
            bulkSkippedOther: '{{count}} ya habían salido a entrega o estaban cancelados y se quedaron como estaban.',
            noneCancelable: 'Ninguno de los pedidos elegidos se puede cancelar: ya salieron a entrega o estaban cancelados.',
            nobodyToRemindTitle: 'No hay a quién recordarle el pago',
            noneWaitingPayment: 'Ninguno de los pedidos elegidos espera pago.',
            sampleUser: 'Usuario de ejemplo',
            notes: {
                nobodyHome: 'Nadie recibió el paquete; se intenta de nuevo al día siguiente.',
                canceledByUser: 'Motivo: {{reason}}',
            },
        },
        files: {
            unavailableTitle: 'El servicio de archivos no está disponible',
            unavailableDetail: 'No pudimos generar el archivo en este momento. Inténtelo más tarde.',
        },
        creditRequests: {
            incomeRequired: 'Escriba su ingreso mensual.',
            amountRequired: 'Escriba cuánto necesita.',
            amountTooHigh: 'Se presta hasta {{multiple}} veces el ingreso mensual: {{max}}.',
            termInvalid: 'Elija un plazo de la lista.',
            colorInvalid: 'Escriba el color como #RRGGBB.',
            received: 'Recibimos su solicitud con el folio {{folio}}.',
        },
        uploads: {
            notExcel: 'El archivo tiene que ser un Excel (.xlsx).',
            unreadable: 'No pudimos leer el archivo como Excel: puede estar dañado o protegido con contraseña.',
            attachmentTooLarge: 'El servidor acepta adjuntos de hasta {{max}}.',
        },
    },
    en: {
        security: {
            noSessionTitle: 'You need to sign in',
            noSession: 'Your session ended. Sign in again to continue.',
            passwordRequired: 'Type your password.',
            wrongCodeTitle: 'Wrong code',
            wrongCode: 'That code is not correct.',
            lockedTitle: 'Too many attempts',
            locked: 'You ran out of attempts. Type your password again to start over.',
            expiredTitle: 'Too much time went by',
            expired: 'More than 5 minutes went by. Type your password again.',
            defaultPasskeyName: 'Passkey {{number}}',
        },
        branches: {
            nameRequired: 'Type the branch name.',
            duplicateName: 'There is already a «{{name}}» branch in {{city}}.',
            cityRequired: 'Choose the branch city.',
            addressRequired: 'Type the branch address.',
            created: 'The {{name}} branch was added.',
        },
        calendar: {
            titleRequired: 'Write what the appointment is about (up to 120 characters).',
            kindInvalid: 'Choose an appointment type from the list.',
            dateInvalid: 'The date and time are not valid.',
            endBeforeStart: 'The end time has to be after the start time.',
            meetingUrlInvalid: 'The meeting link has to start with https://.',
            attendeeInvalid: 'Choose guests from the team.',
            updated: 'The appointment changes were saved.',
            sundayTitle: 'No deliveries on Sundays',
            sunday: 'The store does not deliver on Sunday. Choose another day.',
            customerRequired: 'Enter the customer name.',
            created: 'The appointment for {{customer}} was scheduled.',
            deleted: 'The appointment was deleted.',
            notFoundTitle: 'The appointment no longer exists',
            notFound: 'Someone deleted it. Reload the calendar.',
        },
        tasks: {
            fullTitle: 'The column is full',
            full: '“{{column}}” has a limit of {{limit}} tasks in progress. Finish one before starting another.',
            notFoundTitle: 'The task no longer exists',
            notFound: 'Someone deleted or archived it. The board was reloaded.',
            titleInvalid: 'Write a title of up to {{max}} characters.',
            dueDateInvalid: 'The date goes as day, month and year.',
            priorityInvalid: 'Choose a priority from the list.',
            assigneeInvalid: 'Choose someone from the team.',
        },
        mail: {
            sent: 'The message was sent to {{to}}.',
            toInvalid: 'Enter one or more valid emails, separated by commas.',
            ccInvalid: 'One email is not valid; separate them with commas.',
            subjectRequired: 'Enter the subject.',
            notFoundTitle: 'We could not find the conversation',
            notFound: 'It no longer exists: it may have been deleted forever.',
            folderInvalid: 'That folder does not exist.',
            undoTooLateTitle: 'It can no longer be undone',
            undoTooLate: 'The message already went out: the time to undo it is over.',
            undone: 'Sending was undone: the message did not go out.',
            draftSaved: 'The draft was saved.',
            draftDiscarded: 'The draft was discarded.',
        },
        accounts: {
            store: 'Sample store',
            signInFailedTitle: 'We could not sign you in',
            signInFailed: 'The email or the password is not correct.',
            nameRequired: 'Enter your name.',
            phoneInvalid: 'The phone number has 10 digits, no spaces.',
            departmentInvalid: 'Choose a department from the list.',
            accountSaved: 'Your details were saved.',
            profileLockedTitle: 'This profile cannot be changed',
            profileLocked: 'The administration profile always has every permission, so nobody is locked out of the profiles screen.',
            profileSaved: 'The permissions of {{name}} were saved.',
        },
        validation: {
            title: 'The data you sent is not valid',
            detail: 'Check the highlighted fields and try again.',
        },
        customers: {
            created: '{{name}} was registered.',
            nameRequired: 'Enter the customer name.',
            emailInvalid: 'Enter a valid email address.',
            emailTaken: 'There is already a customer with this email.',
            phoneInvalid: 'The phone number has 10 digits, no spaces.',
            typeInvalid: 'Choose a customer type.',
            creditLimitInvalid: 'Enter the credit limit.',
            creditLimitTooHigh: {
                retail: 'For retail customers the credit limit is up to {{max}}.',
                wholesale: 'For wholesale customers the credit limit is up to {{max}}.',
            },
            stateInvalid: 'Choose a state from the list.',
            deliveryDaysInvalid: 'Choose at least one day from Monday to Saturday.',
            sinceInFuture: 'The date cannot be later than today.',
            saveFailedTitle: 'We could not save the customer',
            saveFailedDetail: 'Something went wrong on the server. Please try again in a moment.',
        },
        orders: {
            notFoundTitle: 'We could not find the order',
            notFoundDetail: 'Order {{orderId}} does not exist.',
            cannotCancelTitle: 'The order can no longer be canceled',
            alreadyShipped: 'Order {{number}} is already out for delivery: it can no longer be canceled.',
            alreadyCanceled: 'Order {{number}} was already canceled.',
            canceled: 'Order {{number}} was canceled.',
            remindersSentOne: 'A payment reminder was sent to {{count}} customer.',
            remindersSentOther: 'A payment reminder was sent to {{count}} customers.',
            bulkCanceledOne: '{{count}} order was canceled.',
            bulkCanceledOther: '{{count}} orders were canceled.',
            bulkSkippedOne: '{{count}} was already out for delivery or canceled and stayed as it was.',
            bulkSkippedOther: '{{count}} were already out for delivery or canceled and stayed as they were.',
            noneCancelable: 'None of the selected orders can be canceled: they are out for delivery or were already canceled.',
            nobodyToRemindTitle: 'There is nobody to remind',
            noneWaitingPayment: 'None of the selected orders is waiting for payment.',
            sampleUser: 'Sample user',
            notes: {
                nobodyHome: 'Nobody was home to receive the package; it will be tried again the next day.',
                canceledByUser: 'Reason: {{reason}}',
            },
        },
        files: {
            unavailableTitle: 'The file service is not available',
            unavailableDetail: 'We could not create the file right now. Please try again later.',
        },
        creditRequests: {
            incomeRequired: 'Enter your monthly income.',
            amountRequired: 'Enter how much you need.',
            amountTooHigh: 'We lend up to {{multiple}} times the monthly income: {{max}}.',
            termInvalid: 'Choose a term from the list.',
            colorInvalid: 'Write the color as #RRGGBB.',
            received: 'We received your request with folio {{folio}}.',
        },
        uploads: {
            notExcel: 'The file must be an Excel workbook (.xlsx).',
            unreadable: 'We could not read the file as Excel: it may be damaged or password protected.',
            attachmentTooLarge: 'The server accepts attachments up to {{max}}.',
        },
    },
});

const DEFAULT_LANGUAGE = 'es';

/**
 * Un dato que la base guarda en los dos idiomas (el nombre de un perfil), en el idioma activo.
 *
 * @param {{es: string, en: string}} texts
 * @returns {string}
 */
export function inServerLanguage(texts) {
    return texts[toolkitSettings().language] ?? texts[DEFAULT_LANGUAGE];
}

/**
 * Un texto del servidor en el idioma activo, con sus {{variables}} puestas.
 *
 * @param {string} path la llave con puntos: 'orders.alreadyShipped'
 * @param {Record<string, string|number>} [values]
 * @returns {string}
 */
export function serverTextOf(path, values = {}) {
    const languageTexts = SERVER_TEXTS[toolkitSettings().language] ?? SERVER_TEXTS[DEFAULT_LANGUAGE];
    const text = path.split('.').reduce((branch, part) => branch?.[part], languageTexts);
    // guard clause: una llave que no existe es un error de quien escribió el servidor, no algo que se pinte callado
    if (typeof text !== 'string') {
        throw new Error(`El servidor de mentira no tiene el texto «${path}»`);
    }

    return text.replace(/\{\{(\w+)\}\}/g, (placeholder, name) => String(values[name] ?? placeholder));
}
