// La petición de la casa para hablar con el backend de verdad (createApiClient de Calcita): manda el idioma, convierte los
// errores en ApiError (RFC 9457) con su mensaje en el idioma de la persona y reconoce la sesión vencida, en un solo lugar.
//
// Hoy los *Api.js de los módulos llaman al servidor de mentira (src/fakeServer). Para conectar el de verdad, cada uno
// cambia su llamada por una de estas, sin tocar la pantalla:
//
//   export const loadContacts = (signal) => apiClient.get('/contacts', {signal});
//   export const addContact = (values) => apiClient.post('/contacts', values);
//
// La dirección del API sale de VITE_API_URL (en .env.local, que no se sube al repo); sin ella, /api del mismo servidor.
import {createApiClient} from '@stackcraftmx/calcita';

const DEFAULT_API_URL = '/api';

export const apiClient = createApiClient({baseUrl: import.meta.env.VITE_API_URL ?? DEFAULT_API_URL});
