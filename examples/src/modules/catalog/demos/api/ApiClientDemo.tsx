import {useRef, useState} from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {ApiError, createApiClient, fieldErrorsOf, toastProblem, useToolkitTranslation} from '@stackcraftmx/calcita';

// ─── El servidor de mentira (en su proyecto NO va: createApiClient usa el fetch del navegador) ───
// Responde como un backend con RFC 9457: el éxito en JSON y cada error con su problema.
const SLOW_MILLISECONDS = 3000;
const problemReply = (status: number, problem: object) => new Response(JSON.stringify(problem), {
    status, headers: {'content-type': 'application/problem+json', 'x-request-id': `req-${status}`},
});
const fakeServerFetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const path = new URL(String(url), 'http://ejemplo.local').pathname;
    if (path === '/api/orders') {
        return Response.json([{folio: 'P-2375', total: '$9,800.00'}, {folio: 'P-2381', total: '$689.90'}]);
    }
    if (path === '/api/customers') {
        return problemReply(422, {
            title: 'Revise los datos', detail: 'Hay 2 campos con errores.', code: 'validation',
            errors: {email: ['Ese correo ya está registrado.'], rfc: ['El RFC no tiene el formato correcto.']},
        });
    }
    if (path === '/api/profile') {
        return problemReply(401, {title: 'Su sesión terminó', detail: 'Vuelva a iniciar sesión para continuar.'});
    }
    if (path === '/api/orders/P-0000') {
        return problemReply(404, {title: 'No existe', detail: 'No encontramos el pedido P-0000.'});
    }
    if (path === '/api/reports/close') {
        return problemReply(500, {title: 'Error del servidor', detail: 'No pudimos cerrar el mes.', request_id: 'req-7f3a'});
    }
    if (path === '/api/slow') {
        // tarda; si se cancela, el navegador rechaza con AbortError
        await new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, SLOW_MILLISECONDS);
            init?.signal?.addEventListener('abort', () => {
                clearTimeout(timer);
                reject(new DOMException('cancelado', 'AbortError'));
            });
        });
        return Response.json({ok: true});
    }
    // cualquier otro camino: como si se cayera la red
    throw new TypeError('Failed to fetch');
};

// ─── El cliente: UNO por proyecto, en su core ───
const api = createApiClient({
    baseUrl: '/api',
    fetch: fakeServerFetch,
    // un 401 a media consulta: en una app de verdad, ir a iniciar sesión
    onUnauthenticated: (error) => console.info('sesión vencida:', error.message),
});

type Outcome = {kind: 'success'; data: unknown} | {kind: 'error'; error: ApiError} | {kind: 'canceled'} | null;

const CASES = [
    {key: 'ok', request: () => api.get('/orders', {params: {page: 1}})},
    {key: 'validation', request: () => api.post('/customers', {email: 'ana@ejemplo.com'})},
    {key: 'unauthenticated', request: () => api.get('/profile')},
    {key: 'notFound', request: () => api.get('/orders/P-0000')},
    {key: 'serverError', request: () => api.post('/reports/close', {month: '2026-09'})},
    {key: 'offline', request: () => api.get('/sin-red')},
];

// Cada botón pide algo al servidor de mentira y enseña lo que regresa la petición: el JSON o el ApiError con su mensaje
// ya traducido. Los errores se avisan también con toastProblem.
const ApiClientDemo = () => {
    const {t} = useToolkitTranslation('catalog');
    const [outcome, setOutcome] = useState<Outcome>(null);
    const [isWaiting, setIsWaiting] = useState(false);
    const slowRequest = useRef<AbortController | null>(null);

    const run = async (request: () => Promise<unknown>) => {
        setIsWaiting(true);
        try {
            setOutcome({kind: 'success', data: await request()});
        } catch (error) {
            // cancelar no es un error que enseñar
            if (error instanceof DOMException && error.name === 'AbortError') {
                setOutcome({kind: 'canceled'});
            } else {
                setOutcome({kind: 'error', error: error as ApiError});
                toastProblem(error as ApiError);
            }
        } finally {
            setIsWaiting(false);
        }
    };

    const startSlow = () => {
        slowRequest.current = new AbortController();
        run(() => api.get('/slow', {signal: slowRequest.current?.signal}));
    };

    return (
        <Stack spacing={2}>
            <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap'}}>
                {CASES.map(({key, request}) => (
                    <Button key={key} variant="outlined" disabled={isWaiting} onClick={() => run(request)}>{t(`api.client.cases.${key}`)}</Button>
                ))}
                <Button variant="outlined" disabled={isWaiting} onClick={startSlow}>{t('api.client.cases.slow')}</Button>
                {isWaiting && <Button color="error" onClick={() => slowRequest.current?.abort()}>{t('api.client.cancel')}</Button>}
            </Stack>

            {outcome?.kind === 'success' && (
                <Alert severity="success">
                    <AlertTitle>{t('api.client.success')}</AlertTitle>
                    <Box component="pre" sx={{m: 0, whiteSpace: 'pre-wrap', fontSize: 13}}>{JSON.stringify(outcome.data, null, 2)}</Box>
                </Alert>
            )}
            {outcome?.kind === 'canceled' && <Alert severity="info">{t('api.client.canceled')}</Alert>}
            {outcome?.kind === 'error' && (
                <Alert severity={outcome.error.isOffline ? 'warning' : 'error'}>
                    <AlertTitle>{outcome.error.title}</AlertTitle>
                    <Typography variant="body2">{outcome.error.message}</Typography>
                    {/* un 422 trae los errores por campo: en un formulario van a su campo (applyServerProblem) */}
                    {Object.entries(fieldErrorsOf(outcome.error.problem)).map(([field, messages]) => (
                        <Typography key={field} variant="body2">• {field}: {messages.join(' ')}</Typography>
                    ))}
                    <Typography variant="caption" color="text.secondary" component="p" sx={{mt: 1}}>
                        {t('api.client.reference', {status: outcome.error.status, requestId: outcome.error.requestId ?? '—'})}
                    </Typography>
                </Alert>
            )}
        </Stack>
    );
};

export default ApiClientDemo;
