// i18next con los textos de la app (los de cada módulo, juntos en APP_TEXTS) como sus recursos: los textos se escriben en
// los *Texts.js de cada módulo, como siempre, y Calcita los lee de esta instancia (translateWithI18next en AppProviders).
// Lo que la app no tenga (los textos de las tablas, de los diálogos, de las validaciones) sale de los textos de Calcita.
import i18next from 'i18next';

import {APP_LANGUAGES} from '@/app/appSettings.js';
import {APP_TEXTS} from '@/app/appTexts.js';

export const i18n = i18next.createInstance();

// sin esperar: con los recursos ya en memoria (initAsync: false) queda lista al terminar init
i18n.init({
    resources: APP_TEXTS,
    lng: APP_LANGUAGES.spanish,
    fallbackLng: APP_LANGUAGES.spanish,
    // React ya escapa lo que pinta: si i18next también, un «<» saldría como «&lt;»
    interpolation: {escapeValue: false},
    initAsync: false,
});
