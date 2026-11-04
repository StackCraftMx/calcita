// Hecho en Calcita · confirmar y avisar: la confirmación antes de lo que no se deshace (useConfirmAction + ConfirmDialog)
// y los avisos (toasts), con los errores del servidor en palabras de la persona.
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import ConfirmWithServer from '@/modules/catalog/demos/confirm/ConfirmWithServer.tsx';
import ToastKinds from '@/modules/catalog/demos/confirm/ToastKinds.tsx';
import ToastPlacement from '@/modules/catalog/demos/confirm/ToastPlacement.tsx';

const loadConfirm = () => import('@/modules/catalog/demos/confirm/ConfirmWithServer.tsx?demo-source');
const loadToasts = () => import('@/modules/catalog/demos/confirm/ToastKinds.tsx?demo-source');
const loadPlacement = () => import('@/modules/catalog/demos/confirm/ToastPlacement.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (confirmAndNotify.<sección>.extend.<id>)
const CONFIRM_EXTENSIONS = [
    {id: 'run', option: 'useConfirmAction({run})', example: 'useConfirmAction({run: ({subject}) => ordersApi.cancel(subject.id)})'},
    {id: 'onDone', option: 'onDone', example: 'onDone: (response) => { toastSuccess(response.message); reload(); }'},
    {id: 'open', option: 'open(subject)', example: '<IconButton onClick={() => cancel.open(row)}>'},
    {id: 'details', option: 'children · confirm(details)', example: '<ConfirmDialog … onConfirm={() => cancel.confirm({reason})}><TextInput … /></ConfirmDialog>'},
    {id: 'texts', option: 'title · description · confirmLabel · cancelLabel', example: 'title="¿Cancelar el pedido P-2375?" confirmLabel="Cancelar el pedido"'},
    {id: 'tone', option: 'tone', example: 'tone="error"'},
    {id: 'disabled', option: 'isConfirmDisabled', example: 'isConfirmDisabled={order.status === "delivered"}'},
    {id: 'state', option: 'isRunning · error', example: 'cancel.isRunning && <LinearProgress />'},
];
const TOAST_EXTENSIONS = [
    {id: 'kinds', option: 'toastSuccess · toastInfo · toastWarn · toastError', example: "toastSuccess('Se guardó el pedido.')"},
    {id: 'options', option: 'options', example: "toastSuccess('Se archivó.', {duration: 8000, action: {label: 'Deshacer', onClick: undo}})"},
    {id: 'problem', option: 'toastProblem(error)', example: 'catch (error) { toastProblem(error); }'},
    {id: 'promise', option: 'toastPromise(promise, messages)', example: "toastPromise(save(), {loading: 'Guardando…', success: 'Listo', error: 'No se pudo'})"},
    {id: 'loading', option: 'toastLoading · dismissToast', example: "const id = toastLoading('Importando…'); … dismissToast(id);"},
    {id: 'toaster', option: '<Toaster />', example: '<Toaster />  // en la raíz, una vez'},
];

const PLACEMENT_EXTENSIONS = [
    {id: 'position', option: 'position · TOASTER_POSITION', example: '<Toaster position={TOASTER_POSITION.bottomCenter} />'},
    {id: 'sonner', option: 'duration · visibleToasts · offset · mobileOffset · toastOptions', example: '<Toaster duration={6000} visibleToasts={3} />'},
    {id: 'defaults', option: 'richColors · closeButton · theme', example: '<Toaster closeButton={false} />  // por omisión los dos en sí'},
    {id: 'toasterId', option: 'id · toasterId', example: "<Toaster id=\"panel\" />  ·  toastInfo('Listo', {toasterId: 'panel'})"},
];

export const ConfirmAndNotifyPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `confirmAndNotify.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('confirmAndNotify.title')} description={t('confirmAndNotify.description')} />
            <DemoSection title={t('confirmAndNotify.confirm.title')} description={t('confirmAndNotify.confirm.description')}
                         extensions={rowsOf('confirm', CONFIRM_EXTENSIONS)} Demo={ConfirmWithServer} loadSource={loadConfirm} />
            <DemoSection title={t('confirmAndNotify.toasts.title')} description={t('confirmAndNotify.toasts.description')}
                         extensions={rowsOf('toasts', TOAST_EXTENSIONS)} Demo={ToastKinds} loadSource={loadToasts} />
            <DemoSection title={t('confirmAndNotify.placement.title')} description={t('confirmAndNotify.placement.description')}
                         extensions={rowsOf('placement', PLACEMENT_EXTENSIONS)} Demo={ToastPlacement} loadSource={loadPlacement} />
        </Stack>
    );
};
