// El código de un ejemplo del catálogo, como en la documentación de MUI: en JavaScript o en TypeScript (la persona elige y
// se recuerda para todas las secciones), con sus colores y el botón de copiar.
//
// El color del código sale de los temas de prism-react-renderer (One Light y One Dark) con su propio fondo: así el
// contraste es el que pensaron sus autores, también sobre el vidrio de las tarjetas.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {useColorScheme} from '@mui/material/styles';
import {Highlight, themes} from 'prism-react-renderer';
import {CopyButton, SegmentedControl, useToolkitTranslation} from '@stackcraftmx/calcita';

/** Los lenguajes en que se enseña el código. */
export const CODE_LANGUAGES = Object.freeze({js: 'js', ts: 'ts'});

const CODE_LANGUAGE_STORAGE_KEY = 'calcita-examples:code-language';
// avisa a las demás secciones abiertas que la persona cambió de lenguaje
const CODE_LANGUAGE_EVENT = 'calcita-examples:code-language';
// lo que mide el código antes de deslizar (px): un ejemplo largo no empuja la página hasta abajo
const CODE_MAX_HEIGHT_PIXELS = 520;
// el lenguaje con que prism colorea cada uno (el JSX va con su variante)
const PRISM_LANGUAGE = Object.freeze({[CODE_LANGUAGES.js]: 'jsx', [CODE_LANGUAGES.ts]: 'tsx'});

const readCodeLanguage = () => {
    try {
        const stored = window.localStorage.getItem(CODE_LANGUAGE_STORAGE_KEY);
        return Object.values(CODE_LANGUAGES).includes(stored) ? stored : CODE_LANGUAGES.js;
    } catch {
        return CODE_LANGUAGES.js;
    }
};

/**
 * El lenguaje elegido, el mismo en todas las secciones de la página y recordado en este navegador.
 *
 * @returns {[string, (language: string) => void]}
 */
const useCodeLanguage = () => {
    const [language, setLanguage] = useState(readCodeLanguage);

    useEffect(() => {
        const syncLanguage = () => setLanguage(readCodeLanguage());
        window.addEventListener(CODE_LANGUAGE_EVENT, syncLanguage);
        return () => window.removeEventListener(CODE_LANGUAGE_EVENT, syncLanguage);
    }, []);

    const chooseLanguage = (nextLanguage) => {
        setLanguage(nextLanguage);
        try {
            window.localStorage.setItem(CODE_LANGUAGE_STORAGE_KEY, nextLanguage);
        } catch {
            // almacenamiento bloqueado: cambia en esta sección, solo no se recuerda
        }
        window.dispatchEvent(new Event(CODE_LANGUAGE_EVENT));
    };

    return [language, chooseLanguage];
};

/**
 * @param {object} props
 * @param {{js?: string, ts?: string}} props.sources el código en cada lenguaje; con uno solo no se enseña a elegir
 */
export const CodeViewer = ({sources}) => {
    const {t} = useToolkitTranslation('catalog');
    const [chosenLanguage, setChosenLanguage] = useCodeLanguage();
    const {mode, systemMode} = useColorScheme();
    const isDark = (mode === 'system' ? systemMode : mode) === 'dark';

    const availableLanguages = Object.values(CODE_LANGUAGES).filter((language) => sources[language]);
    const language = availableLanguages.includes(chosenLanguage) ? chosenLanguage : availableLanguages[0];
    const code = sources[language].trimEnd();

    return (
        <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{alignItems: 'center', justifyContent: 'space-between'}}>
                {availableLanguages.length > 1 ? (
                    <SegmentedControl ariaLabel={t('code.language')} value={language} onChange={setChosenLanguage}
                                      options={availableLanguages.map((value) => ({value, label: t(`code.languages.${value}`)}))} />
                ) : <span />}
                <CopyButton value={code} label={t('code.copy')} />
            </Stack>
            <Highlight theme={isDark ? themes.oneDark : themes.oneLight} code={code} language={PRISM_LANGUAGE[language]}>
                {({style, tokens, getLineProps, getTokenProps}) => (
                    <Box component="pre" tabIndex={0} aria-label={t('code.label')} sx={{
                        ...style, m: 0, p: 2, borderRadius: 3, overflow: 'auto', maxHeight: CODE_MAX_HEIGHT_PIXELS,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, lineHeight: 1.6, tabSize: 4,
                    }}>
                        {tokens.map((line, lineIndex) => (
                            <div key={lineIndex} {...getLineProps({line})}>
                                {line.map((token, tokenIndex) => <span key={tokenIndex} {...getTokenProps({token})} />)}
                            </div>
                        ))}
                    </Box>
                )}
            </Highlight>
        </Stack>
    );
};
