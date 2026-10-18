// Subirlo a su API: uploadWithProgress manda el FormData con el idioma (Accept-Language) y avisa el avance de 0 a 100. Si
// el servidor dice que no, la respuesta trae su problema (RFC 9457); la señal cancela la subida.
import {ApiError, uploadWithProgress} from '@stackcraftmx/calcita';

export async function uploadInventory(file: File, onProgress: (percent: number) => void, signal?: AbortSignal) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('warehouse', 'norte');
    const response = await uploadWithProgress('/api/inventory/imports', formData, {onProgress, signal});
    const body = await response.json().catch(() => null);
    if (!response.ok) {
        throw new ApiError({status: response.status, problem: body ?? {}});
    }
    return body as {message: string};
}
