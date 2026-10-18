// Las llamadas de las pantallas de entrar. Hoy van al servidor de mentira; con un backend de verdad serían peticiones con el
// cliente del proyecto (createApiClient) y las pantallas no cambian.
export {demoPeopleOf, requestPasswordReset, resetPassword, signIn, signInAs} from '@/fakeServer/accountsServer.js';
export {
    demoTotpCode, secondStepPasskey, secondStepPasskeyOptions, secondStepRecoveryCode, secondStepTotp,
} from '@/fakeServer/securityServer.js';
