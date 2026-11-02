// Las llamadas del módulo de formularios al API (aquí, al servidor de mentira; con backend, a axios).
//
// SIMULATED_RESPONSES solo existe en los ejemplos: con un backend de verdad, la respuesta la decide el servidor.
export {getStatesCatalog} from '@/fakeServer/catalogsServer.js';
export {LOAN_TERMS_IN_MONTHS, submitCreditRequest} from '@/fakeServer/creditRequestsServer.js';
export {downloadUploadedDocument, uploadDocument} from '@/fakeServer/documentsServer.js';
export {NOTIFY_CHANNEL, getCustomerTerms, saveCustomerTerms} from '@/fakeServer/customerTermsServer.js';
export {listBranches} from '@/fakeServer/branchesServer.js';
export {STORE_CURRENCY} from '@/fakeServer/fakeOrders.js';
export {SIMULATED_RESPONSES, createCustomer} from '@/fakeServer/customersServer.js';
