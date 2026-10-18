// Agregador interno de retroalimentación: avisos efímeros, bloqueos y la confirmación de acciones.
export {default as ConfirmDialog} from '@/feedback/ConfirmDialog.jsx';
export {default as ModalWaiting} from '@/feedback/ModalWaiting.jsx';
export {NEW_BUILD_NOTICE_VARIANT, default as NewBuildNotice} from '@/feedback/NewBuildNotice.jsx';
export {default as StaleBuildBoundary} from '@/feedback/StaleBuildBoundary.jsx';
export {default as Toaster} from '@/feedback/Toaster.jsx';
export {confirmActionMachine} from '@/feedback/confirmActionMachine.js';
export {
    TOAST_DEFAULT_OPTIONS, dismissToast, errorsObjectToMessage, toastDefault, toastError, toastInfo, toastLoading,
    toastProblem, toastPromise, toastSuccess, toastWarn,
} from '@/feedback/toast.jsx';
export {useConfirmAction} from '@/feedback/useConfirmAction.js';
