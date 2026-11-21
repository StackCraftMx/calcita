// Un expediente por pasos (FormWizard de formik): el paso «Documentos» no se deja mientras falte uno obligatorio. La pantalla
// cuenta los que faltan y lo dice en steps[].nextDisabledReason: «Siguiente» se ve apagado y el motivo sale en un aviso al
// pasar el cursor o al llegar con Tab (en el teléfono, escrito arriba de los botones). Los nombres de los documentos son
// largos: la sección va con labelWidth={FORM_LABEL_WIDTH.auto}, así el nombre se lleva lo que sobre y el cargador solo lo
// que ocupa (con los 200 px de siempre el nombre se partía en muchos renglones). En el teléfono, con topOnPhone, el nombre
// va arriba y el cargador abajo.
//
// El paso de los documentos es largo: con actionsPlacement both los botones van arriba y abajo del paso, para avanzar o
// regresar sin bajar hasta el fondo. El selector de arriba los cambia (en su proyecto se escoge uno y ya).
import {useMemo, useState} from 'react';
import Stack from '@mui/material/Stack';
import {FORM_LABEL_PLACEMENT, FORM_LABEL_WIDTH, FormSection, SegmentedControl, WIZARD_ACTIONS_PLACEMENT, toastSuccess} from '@stackcraftmx/calcita';
import {Form, FormFileUploadField, FormTextField, FormWizard, Formik, Yup} from '@stackcraftmx/calcita/forms';

// ─── El servidor de mentira (en su proyecto NO va: es su POST /documents) ───
type UploadOptions = {signal: AbortSignal, onUploadProgress: (transfer: {loaded: number, total: number}) => void};
const uploadDocument = async (file: File, {signal, onUploadProgress}: UploadOptions) => {
    for (let step = 1; step <= 4; step += 1) {
        await new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, 200);
            signal.addEventListener('abort', () => {
                clearTimeout(timer);
                reject(new DOMException('La subida se canceló', 'AbortError'));
            }, {once: true});
        });
        onUploadProgress({loaded: Math.round((file.size * step) / 4), total: file.size});
    }
    return {id: `document-${file.name}`};
};

// ─── Lo que sí va en su proyecto ───
// 1. Los documentos del expediente (en su proyecto salen del API): su campo, su nombre y si es obligatorio
const DOCUMENTS = [
    {field: 'legalId', label: 'Identificación oficial vigente de la persona que representa a la empresa ante notario (credencial para votar o pasaporte)', required: true},
    {field: 'incorporationDeed', label: 'Acta constitutiva de la empresa con sus modificaciones, inscrita en el Registro Público de Comercio', required: true},
    {field: 'bankLetter', label: 'Carta del banco con la cuenta a nombre de la empresa (opcional)', required: false},
];
const INITIAL_VALUES = {company: '', legalId: '', incorporationDeed: '', bankLetter: ''};

type ActionsPlacement = typeof WIZARD_ACTIONS_PLACEMENT[keyof typeof WIZARD_ACTIONS_PLACEMENT];

const DocumentsWizard = () => {
    const [actionsPlacement, setActionsPlacement] = useState<ActionsPlacement>(WIZARD_ACTIONS_PLACEMENT.both);
    const schema = useMemo(() => Yup.object({
        company: Yup.string().trim().required(),
        legalId: Yup.string().required(),
        incorporationDeed: Yup.string().required(),
        bankLetter: Yup.string(),
    }), []);

    return (
        <Stack spacing={2}>
            <SegmentedControl ariaLabel="Dónde van los botones" value={actionsPlacement} onChange={(value) => setActionsPlacement(value as ActionsPlacement)}
                              options={[
                                  {value: WIZARD_ACTIONS_PLACEMENT.both, label: 'Arriba y abajo'},
                                  {value: WIZARD_ACTIONS_PLACEMENT.top, label: 'Arriba'},
                                  {value: WIZARD_ACTIONS_PLACEMENT.bottom, label: 'Abajo'},
                              ]} />
            <Formik initialValues={INITIAL_VALUES} validationSchema={schema} onSubmit={async (values) => {
                await new Promise((resolve) => setTimeout(resolve, 600));
                toastSuccess(`Se recibió el expediente de ${values.company.trim()}.`);
            }}>
                {({values}) => {
                    // 2. Cuántos obligatorios faltan, con lo que ya está en el formulario (el id que dio el servidor al subir)
                    const missingCount = DOCUMENTS.filter(({field, required}) => required && !values[field as keyof typeof values]).length;
                    const steps = [
                        {key: 'company', label: 'Empresa', fields: ['company'], content: (
                            <FormSection>
                                <FormTextField name="company" label="Razón social" />
                            </FormSection>
                        )},
                        {
                            key: 'documents', label: 'Documentos', fields: DOCUMENTS.map(({field}) => field),
                            // 3. El motivo para no dejar el paso: «Siguiente» apagado y el aviso; sin motivo (null), como siempre
                            nextDisabledReason: missingCount > 0
                                ? `${missingCount === 1 ? 'Falta 1 documento obligatorio' : `Faltan ${missingCount} documentos obligatorios`} por cargar.`
                                : null,
                            content: (
                                // 4. La columna de los nombres a lo que sobre: el cargador a la derecha, solo con lo que ocupa. En el
                                //    teléfono lo que sobra es poco: ahí el nombre va arriba y el cargador abajo (topOnPhone)
                                <FormSection labelWidth={FORM_LABEL_WIDTH.auto} labelPlacement={FORM_LABEL_PLACEMENT.topOnPhone}
                                             footer="Cada documento se sube en cuanto lo elige.">
                                    {DOCUMENTS.map(({field, label}) => (
                                        <FormFileUploadField key={field} name={field} label={label} upload={uploadDocument} accept={['pdf']} maxSize="5 MB"
                                                             limitsText="PDF, hasta 5 MB" />
                                    ))}
                                </FormSection>
                            ),
                        },
                        {key: 'confirm', label: 'Confirmar', content: (
                            <FormSection footer="Revise los datos antes de enviar.">
                                <FormTextField name="company" label="Razón social" disabled />
                            </FormSection>
                        )},
                    ];
                    return (
                        <Form noValidate>
                            {/* 5. Los botones arriba y abajo del paso (por omisión, solo abajo) */}
                            <FormWizard steps={steps} submitLabel="Enviar expediente" hideBackOnFirstStep actionsPlacement={actionsPlacement} />
                        </Form>
                    );
                }}
            </Formik>
        </Stack>
    );
};

export default DocumentsWizard;
