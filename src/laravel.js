// Para una SPA con Laravel Sanctum: el 419 (la cookie XSRF venció) pide una cookie nueva y repite la petición una vez.
export {CSRF_TOKEN_MISMATCH_STATUS, createCsrfRetryHandler} from '@/laravel/csrfRetry.js';
