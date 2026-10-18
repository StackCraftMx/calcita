import {useState} from 'react';
import type {ReactNode} from 'react';
import {ToolkitProvider} from '@stackcraftmx/calcita';

import {APP_TEXTS} from './appTexts';

// El único lugar donde se conecta: el idioma, quién lo cambia (el botón de idioma del framework avisa aquí) y los textos de
// la app. Las pantallas piden sus textos con useToolkitTranslation('orders').
const AppProviders = ({children}: {children: ReactNode}) => {
    const [language, setLanguage] = useState('es');
    return (
        <ToolkitProvider language={language} onLanguageChange={setLanguage} texts={APP_TEXTS}>
            {children}
        </ToolkitProvider>
    );
};

export default AppProviders;
