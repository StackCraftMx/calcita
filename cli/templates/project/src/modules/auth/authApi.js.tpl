// Las llamadas de las pantallas de entrar. Hoy van al servidor de mentira; con backend, cada una cambia por su petición con
// apiClient (core) sin tocar las pantallas.
export {requestPasswordReset, signIn, signInAsDemo} from '@/fakeServer/accountsServer.js';
