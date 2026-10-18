// __FormName__ (formik + yup): las reglas en __formName__Schema.js y los textos en __formName__Texts.js.
//
// La pantalla dice qué hacer con los datos (onSubmit). Si el servidor dice que no (RFC 9457), el aviso sale arriba del
// formulario y lo de cada campo, en su campo (applyServerProblem). Al guardar, el formulario se vacía y avisa (onSaved).
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo} from 'react';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';
import {Form, FormProblemAlert, FormTextField, Formik, SubmitButton, applyServerProblem} from '@stackcraftmx/calcita/forms';

import {__FORM_NAME___INITIAL_VALUES, build__FormName__Schema} from '@/modules/__module__/__formName__Schema.js';

// los renglones de las notas al abrir
const NOTES_MIN_ROWS = 3;

/**
 * @param {object} props
 * @param {(values: {name: string, notes: string}) => Promise<{message: string}>} props.onSubmit guarda; truena con el
 *     ApiError si el servidor dice que no
 * @param {(message: string) => void} [props.onSaved] ya se guardó: el aviso del servidor
 */
export const __FormName__ = ({onSubmit, onSaved}) => {
    const {t} = useToolkitTranslation('__module__');
    // el esquema se arma al pintar: yup toma sus mensajes al armarlo
    const schema = useMemo(() => build__FormName__Schema(), []);

    const submit = async (values, formikHelpers) => {
        try {
            const response = await onSubmit(values);
            formikHelpers.resetForm();
            onSaved?.(response.message);
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <Formik initialValues={__FORM_NAME___INITIAL_VALUES} validationSchema={schema} onSubmit={submit}>
            <Form noValidate>
                <Stack spacing={2}>
                    <FormProblemAlert />
                    <FormTextField name="name" label={t('__formName__.name')} />
                    <FormTextField name="notes" label={t('__formName__.notes')} helperText={t('__formName__.notesHelp')} multiline minRows={NOTES_MIN_ROWS} />
                    <SubmitButton sx={{alignSelf: 'flex-start'}}>{t('__formName__.submit')}</SubmitButton>
                </Stack>
            </Form>
        </Formik>
    );
};
