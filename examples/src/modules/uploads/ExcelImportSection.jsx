// Importar un Excel con la zona de MUI (FileDropzone de la puerta principal) y la máquina de subida del paquete.
//
// La zona solo elige el archivo; el botón «Importar» manda a la máquina, que sigue la subida: el porcentaje mientras
// viaja, «procesando» mientras el servidor trabaja, cómo terminó y el «Cancelar» que corta la petición de verdad.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import {useMachine} from '@xstate/react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {FileDropzone, SectionCard, buildUploadActors, formatNumber, uploadMachine, useToolkitTranslation} from '@stackcraftmx/calcita';

import {UploadStatus} from '@/modules/uploads/UploadStatus.jsx';
import {importPaymentsFile} from '@/modules/uploads/uploadsApi.js';

// fuera del componente: la máquina se arma una vez (con useMemo adentro sería lo mismo, con una línea más)
const EXCEL_IMPORT_MACHINE = uploadMachine.provide({actors: buildUploadActors(importPaymentsFile)});
// el Excel más grande que se deja elegir
const EXCEL_MAX_SIZE = '2 MB';

export const ExcelImportSection = () => {
    const {t} = useToolkitTranslation('uploads');
    const [file, setFile] = useState(null);
    const [snapshot, send] = useMachine(EXCEL_IMPORT_MACHINE);
    const isUploading = snapshot.matches('uploading');

    const chooseFile = (nextFile) => {
        setFile(nextFile);
        // otro archivo: lo que se dijo del anterior ya no aplica
        send({type: 'RESET'});
    };

    return (
        <SectionCard title={t('excel.title')}>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('excel.text')}</Typography>
            <FileDropzone
                value={file}
                onChange={chooseFile}
                accept="excel"
                maxSize={EXCEL_MAX_SIZE}
                busy={isUploading}
                actions={(
                    <Button variant="contained" disabled={!file || isUploading} onClick={() => send({type: 'UPLOAD', input: {file}})}>
                        {t('excel.submit')}
                    </Button>
                )}
            >
                <UploadStatus
                    snapshot={snapshot}
                    onCancel={() => send({type: 'CANCEL'})}
                    describeResult={(result) => t('excel.done', {
                        count: result.sheets.length, fileName: result.fileName, totalRows: formatNumber(result.totalRows),
                    })}
                />
            </FileDropzone>
        </SectionCard>
    );
};
