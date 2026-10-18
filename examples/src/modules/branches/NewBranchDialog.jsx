// Agregar una sucursal en una ventana sobre la página, sin salir de la lista y el mapa. Formik con los campos de la casa:
//   - las reglas obvias en el navegador (yup) para no gastar un viaje; la que manda es la del servidor;
//   - si el servidor dice que no (422: el nombre ya existe en esa ciudad), cada error cae en su campo (applyServerProblem)
//     y lo que no es de un campo, arriba (FormProblemAlert);
//   - mientras se guarda, la ventana no se cierra (ni con Escape ni picando afuera) y el botón se bloquea (SubmitButton);
//   - al guardar avisa y regresa la sucursal nueva: la pantalla la pone en la lista y el mapa vuela a ella.
// Cada vez que se abre arranca en blanco: la pantalla le da otra `key` al abrirla (así formik vuelve a empezar sin perder la
// animación de cerrar).
//
// Lo renderiza la app: arrow (regla de la casa).
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import {toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {Form, Formik, FormProblemAlert, FormSelectField, FormTextField, SubmitButton, Yup, applyServerProblem} from '@stackcraftmx/calcita/forms';

import {BRANCH_CITY_NAMES, BRANCH_STATUS, addBranch} from '@/modules/branches/branchesApi.js';

const NAME_MAX_LENGTH = 60;
const ADDRESS_MAX_LENGTH = 120;

/** Con qué arranca: las llaves son las del API, así un 422 cae en su campo. Una sucursal nueva arranca abierta. */
const NEW_BRANCH_INITIAL_VALUES = Object.freeze({name: '', city: '', address: '', status: BRANCH_STATUS.open});

/**
 * Las reglas del navegador. OJO: es una función y no una constante: yup toma sus mensajes al armar el esquema, y armado al
 * importar el archivo saldría en inglés (antes de buildYupLocale).
 *
 * @returns {object}
 */
function buildNewBranchSchema() {
    return Yup.object({
        name: Yup.string().trim().required().max(NAME_MAX_LENGTH),
        city: Yup.string().required(),
        address: Yup.string().trim().required().max(ADDRESS_MAX_LENGTH),
        status: Yup.string().required(),
    });
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(branch: object) => void} props.onCreated la sucursal recién guardada, en la forma de la pantalla
 */
export const NewBranchDialog = ({open, onClose, onCreated}) => {
    const {t} = useToolkitTranslation('branches');
    const cityOptions = BRANCH_CITY_NAMES.map((city) => ({value: city, label: city}));
    const statusOptions = Object.values(BRANCH_STATUS).map((status) => ({value: status, label: t(`status.${status}`)}));

    const submit = async (values, formikHelpers) => {
        try {
            const {branch, message} = await addBranch(values);
            toastSuccess(message);
            onCreated(branch);
        } catch (error) {
            // OJO: applyServerProblem necesita los valores para saber qué campos existen; formik no los trae en sus helpers
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <Formik initialValues={NEW_BRANCH_INITIAL_VALUES} validationSchema={buildNewBranchSchema()} onSubmit={submit}>
            {({isSubmitting}) => (
                <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm" aria-labelledby="new-branch-title">
                    <Form noValidate>
                        <DialogTitle id="new-branch-title">{t('add.title')}</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2}>
                                <DialogContentText>{t('add.description')}</DialogContentText>
                                <FormProblemAlert />
                                <FormTextField name="name" label={t('add.name')} placeholder={t('add.namePlaceholder')} autoFocus
                                               slotProps={{htmlInput: {maxLength: NAME_MAX_LENGTH}}} />
                                <FormSelectField name="city" label={t('add.city')} options={cityOptions} />
                                <FormTextField name="address" label={t('add.address')} placeholder={t('add.addressPlaceholder')}
                                               slotProps={{htmlInput: {maxLength: ADDRESS_MAX_LENGTH}}} />
                                <FormSelectField name="status" label={t('add.status')} options={statusOptions} />
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose} disabled={isSubmitting}>{t('add.cancel')}</Button>
                            <SubmitButton size="medium">{t('add.save')}</SubmitButton>
                        </DialogActions>
                    </Form>
                </Dialog>
            )}
        </Formik>
    );
};
