import {useState} from 'react';
import type {ReactNode} from 'react';
import {DEFAULT_LANGUAGES, ToolkitProvider} from '@stackcraftmx/calcita';

import {APP_TEXTS} from './appTexts';

// Los idiomas que ofrece la app: los de la casa (español e inglés) y los que agregue el proyecto, cada uno con su nombre en
// su propio idioma y cómo se escriben sus números y fechas. Con tres o más, el botón de idioma abre un menú. Las traducciones
// de un idioma nuevo van en APP_TEXTS (lo que no traduzca sale en español).
const APP_LANGUAGES = [...DEFAULT_LANGUAGES, {code: 'pt', label: 'Português', locale: 'pt-BR'}];

// El único lugar donde se conecta: el idioma, quién lo cambia (el botón de idioma del framework avisa aquí) y los textos de
// la app. Las pantallas piden sus textos con useToolkitTranslation('orders').
const AppProviders = ({children}: {children: ReactNode}) => {
    const [language, setLanguage] = useState('es');
    return (
        <ToolkitProvider language={language} languages={APP_LANGUAGES} onLanguageChange={setLanguage} texts={APP_TEXTS}>
            {children}
        </ToolkitProvider>
    );
};

export default AppProviders;
