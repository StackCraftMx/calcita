// Con i18next: si el proyecto ya lo usa, sus textos se quedan donde están y el paquete los lee de su instancia. Lo que el
// proyecto no tenga (los textos de la tabla, de los diálogos, de las validaciones) sale de los textos del paquete.
import {ToolkitProvider} from '@stackcraftmx/calcita';
import {translateWithI18next} from '@stackcraftmx/calcita/i18next';

import i18n from './i18n'; // la configuración de i18next del proyecto

// se arma una sola vez: el traductor lee de la instancia, no de una copia
const translate = translateWithI18next(i18n);

const AppProviders = ({children}) => (
    <ToolkitProvider language={i18n.resolvedLanguage} onLanguageChange={(language) => i18n.changeLanguage(language)} translate={translate}>
        {children}
    </ToolkitProvider>
);

export default AppProviders;
