// Las llamadas del módulo de formularios al API (aquí, al servidor de mentira; con backend, a axios).
//
// SIMULATED_RESPONSES solo existe en los ejemplos: con un backend de verdad, la respuesta la decide el servidor.
export {getStatesCatalog} from '@/fakeServer/catalogsServer.js';
export {LOAN_TERMS_IN_MONTHS, submitCreditRequest} from '@/fakeServer/creditRequestsServer.js';
export {SIMULATED_RESPONSES, createCustomer} from '@/fakeServer/customersServer.js';
