// Renglones que se repiten con react-hook-form: los contactos de un cliente. Los que ya estaban guardados piden confirmar
// antes de quitarlos y el contacto principal no se puede quitar (sale el motivo). Correos sin repetir; de 1 a 4 contactos.
import {useMemo} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {toastSuccess} from '@stackcraftmx/calcita';
import {Yup} from '@stackcraftmx/calcita/forms';
import {
    FormProvider, FormRepeatingFields, FormTextField, SubmitButton, uniqueInListRule, useForm, useWatch, yupResolver,
} from '@stackcraftmx/calcita/react-hook-form';

const MAX_CONTACTS = 4;
type Contact = {id?: string, name: string, email: string, is_main?: boolean};
type ContactsValues = {contacts: Contact[]};
const EMPTY_CONTACT: Contact = {name: '', email: ''};
// lo que ya estaba guardado (en su proyecto llega del API): el principal y uno más
const SAVED_CONTACTS: ContactsValues = {contacts: [
    {id: 'contact-1', name: 'Ana Martínez', email: 'ana@example.com', is_main: true},
    {id: 'contact-2', name: 'Luis Herrera', email: 'luis@example.com'},
]};

const ContactsHookForm = () => {
    // 1. Las reglas: obligatorios, el correo bien escrito y sin repetir en la lista
    const resolver = useMemo(() => yupResolver(Yup.object({
        contacts: Yup.array().required().min(1).max(MAX_CONTACTS).of(Yup.object({
            id: Yup.string(),
            name: Yup.string().trim().required(),
            email: Yup.string().trim().required().email().test(uniqueInListRule('contacts', 'email')),
            is_main: Yup.boolean(),
        })),
    })), []);
    const form = useForm<ContactsValues>({resolver, defaultValues: SAVED_CONTACTS});
    const contacts = useWatch({control: form.control, name: 'contacts'});

    return (
        <FormProvider {...form}>
            <form noValidate onSubmit={form.handleSubmit((values) => toastSuccess(`Viaja: ${JSON.stringify(values.contacts)}`))}>
                <Stack spacing={2} sx={{maxWidth: 640}}>
                    {/* 2. Quitar lo decide la pantalla: el principal no; los guardados, con confirmación */}
                    <FormRepeatingFields
                        name="contacts"
                        label="Contactos"
                        emptyRow={EMPTY_CONTACT}
                        maxRows={MAX_CONTACTS}
                        columns={{xs: 1, sm: 2}}
                        rowLabelOf={(index) => (contacts?.[index]?.is_main ? 'Contacto principal' : `Contacto ${index + 1}`)}
                        removeBlockedReason={(row: Contact) => (row?.is_main ? 'El contacto principal recibe las facturas: cambie primero quién es el principal.' : null)}
                        confirmRemove={(row: Contact) => Boolean(row?.id)}
                        renderRow={({nameOf}) => (
                            <>
                                <FormTextField name={nameOf('name')} label="Nombre" autoComplete="off" />
                                <FormTextField name={nameOf('email')} label="Correo" type="email" autoComplete="off" />
                            </>
                        )}
                    />
                    <SubmitButton sx={{alignSelf: 'flex-start'}}>Guardar contactos</SubmitButton>
                    <Typography variant="body2" color="text.secondary" sx={{overflowWrap: 'anywhere'}}>Viaja: «{JSON.stringify(contacts)}»</Typography>
                </Stack>
            </form>
        </FormProvider>
    );
};

export default ContactsHookForm;
