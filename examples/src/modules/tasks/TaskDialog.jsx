// La ventana para editar una tarea: título, descripción, responsables, prioridad, fecha límite, etiquetas y su lista de
// pendientes. Formik con los campos de la casa (varias personas y varias etiquetas con `multiple`); si el servidor rechaza un
// campo (422), el error sale en su campo (applyServerProblem). Al guardar regresa el tablero como quedó.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo, useState} from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {FormRow, FormSection, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {FormDateField} from '@stackcraftmx/calcita/date-pickers';
import {
    Form, FormCatalogField, FormProblemAlert, FormSelectField, FormTextField, Formik, SubmitButton, Yup, applyServerProblem, useFormikContext,
} from '@stackcraftmx/calcita/forms';

import {TASK_PRIORITIES, saveTask} from '@/modules/tasks/tasksApi.js';

const TITLE_MAX_LENGTH = 120;
// las etiquetas que se ofrecen (en el servidor de verdad vendrían del catálogo del equipo)
const TAG_OPTIONS = Object.freeze(['Almacén', 'Clientes', 'Entregas', 'Equipo', 'Precios', 'Reportes', 'Sucursales'].map((tag) => ({code: tag, label: tag})));

/** La lista de pendientes dentro del formulario: palomear, quitar y agregar (Enter). */
const ChecklistField = () => {
    const {t} = useToolkitTranslation('tasks');
    const {values, setFieldValue} = useFormikContext();
    const [newItem, setNewItem] = useState('');
    const items = values.checklist;
    const addItem = () => {
        if (newItem.trim()) {
            setFieldValue('checklist', [...items, {text: newItem.trim(), done: false}]);
            setNewItem('');
        }
    };
    return (
        <Stack spacing={0.5} sx={{width: '100%'}}>
            {items.map((item, index) => (
                <Stack key={item.id ?? `new-${index}`} direction="row" spacing={0.5} sx={{alignItems: 'center'}}>
                    <Checkbox size="small" checked={item.done} slotProps={{input: {'aria-label': item.text}}}
                              onChange={(event) => setFieldValue('checklist', items.map((current, position) => (position === index ? {...current, done: event.target.checked} : current)))} />
                    <Typography variant="body2" sx={{flexGrow: 1, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'text.secondary' : 'text.primary'}}>
                        {item.text}
                    </Typography>
                    <IconButton size="small" aria-label={t('dialog.removeItem', {text: item.text})}
                                onClick={() => setFieldValue('checklist', items.filter((current, position) => position !== index))}>
                        <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                </Stack>
            ))}
            <TextField size="small" value={newItem} placeholder={t('dialog.newItem')} onChange={(event) => setNewItem(event.target.value)}
                       slotProps={{htmlInput: {'aria-label': t('dialog.newItem')}}}
                       onKeyDown={(event) => {
                           if (event.key === 'Enter') {
                               event.preventDefault();
                               addItem();
                           }
                       }} />
        </Stack>
    );
};

/**
 * @param {object} props
 * @param {object|null} props.task la tarea a editar (null: cerrada)
 * @param {Array<{id: string, name: string}>} props.people a quiénes se les puede asignar
 * @param {() => void} props.onClose
 * @param {(board: object) => void} props.onSaved el tablero como quedó
 */
export const TaskDialog = ({task, people, onClose, onSaved}) => {
    const {t} = useToolkitTranslation('tasks');
    // el esquema se arma al pintar: yup toma sus mensajes (ya traducidos) al armarlo
    const schema = useMemo(() => Yup.object({
        title: Yup.string().trim().required().max(TITLE_MAX_LENGTH),
        priority: Yup.string().oneOf(Object.values(TASK_PRIORITIES)),
    }), []);

    // guard clause: sin tarea no hay ventana
    if (!task) {
        return null;
    }

    const initialValues = {
        title: task.title, description: task.description ?? '', assigneeIds: task.assigneeIds, priority: task.priority, dueDate: task.dueDate ?? '',
        tags: task.tagNames, checklist: task.checklistItems,
    };
    const save = async (values, formikHelpers) => {
        try {
            onSaved(await saveTask(task.id, values));
            toastSuccess(t('dialog.saved'));
            onClose();
        } catch (error) {
            // el error de un campo que el formulario tiene sale en su campo; uno de otro nombre (due_date del API), en el aviso
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="task-dialog-title">
            <Formik initialValues={initialValues} validationSchema={schema} onSubmit={save}>
                <Form noValidate>
                    <DialogTitle id="task-dialog-title">{t('dialog.title')}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2.5}>
                            <FormProblemAlert />
                            <FormSection>
                                <FormTextField name="title" label={t('dialog.taskTitle')} />
                                <FormTextField name="description" label={t('dialog.description')} multiline minRows={2} />
                            </FormSection>
                            <FormSection>
                                <FormCatalogField name="assigneeIds" label={t('dialog.assignees')} multiple placeholder={t('dialog.assigneesPlaceholder')}
                                                  options={people.map((person) => ({code: person.id, label: person.name}))} formatLabel={(option) => option.label} />
                                <FormSelectField name="priority" label={t('dialog.priority')}
                                                 options={Object.values(TASK_PRIORITIES).map((priority) => ({value: priority, label: t(`priority.${priority}`)}))} />
                                <FormDateField name="dueDate" label={t('dialog.dueDate')} />
                                <FormCatalogField name="tags" label={t('dialog.tags')} multiple options={TAG_OPTIONS} formatLabel={(option) => option.label} />
                            </FormSection>
                            <FormSection title={t('dialog.checklist')}>
                                <FormRow label={t('dialog.checklistItems')}><ChecklistField /></FormRow>
                            </FormSection>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>{t('dialog.cancel')}</Button>
                        <SubmitButton size="medium">{t('dialog.save')}</SubmitButton>
                    </DialogActions>
                </Form>
            </Formik>
        </Dialog>
    );
};
