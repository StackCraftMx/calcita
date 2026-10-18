// La ruta de la bandeja. La pantalla viaja en su propio archivo (lazy).
export const MAIL_PATH = '/mail';

export const routes = [
    {path: MAIL_PATH, lazy: async () => ({Component: (await import('@/modules/mail/MailPage.jsx')).MailPage})},
];
