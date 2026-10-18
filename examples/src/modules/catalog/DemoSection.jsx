// Una sección del catálogo: el componente, para qué sirve, su ejemplo vivo y, como en la documentación de MUI, «Ver código»
// con el código del ejemplo en JS o en TS para copiarlo. CodeSection es la que solo enseña código (la configuración de la
// página de traducciones), abierto de entrada.
//
// El ejemplo es un archivo .tsx de demos/ (el que se pinta es el mismo que se copia). Su código se baja solo al abrir
// «Ver código» (loadSource, un import de '…/Demo.tsx?demo-source'); una ruta mal escrita truena al construir.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import {SectionCard, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeViewer} from '@/modules/catalog/CodeViewer.jsx';
import {ExtensionTable} from '@/modules/catalog/ExtensionTable.jsx';

/**
 * @param {object} props
 * @param {string} props.title ya traducido
 * @param {string} [props.description] ya traducido
 * @param {import('react').ComponentType} props.Demo el ejemplo (demos/…/Algo.tsx)
 * @param {() => Promise<{default: {ts: string, js: string}}>} props.loadSource () => import('…/Algo.tsx?demo-source')
 * @param {boolean} [props.bare] sin tarjeta: para un ejemplo que ya trae las suyas (el formulario de Apple)
 * @param {Array<{option: string, what: string, example?: string}>} [props.extensions] «Cómo se extiende» (ExtensionTable)
 */
export const DemoSection = ({title, description, Demo, loadSource, bare = false, extensions}) => {
    const {t} = useToolkitTranslation('catalog');
    const [isCodeOpen, setIsCodeOpen] = useState(false);
    const [sources, setSources] = useState(null);

    const toggleCode = async () => {
        const willOpen = !isCodeOpen;
        setIsCodeOpen(willOpen);
        // el código se baja la primera vez que se abre
        if (willOpen && !sources) {
            const module = await loadSource();
            setSources(module.default);
        }
    };

    const content = (
        <>
            {description && <Typography variant="body2" color="text.secondary" sx={{mb: 2.5}}>{description}</Typography>}
            {extensions && <ExtensionTable rows={extensions} />}
            <Box sx={{minWidth: 0}}>
                <Demo />
            </Box>
            <Box sx={{mt: 2}}>
                <Button size="small" startIcon={<CodeRoundedIcon />} onClick={toggleCode} aria-expanded={isCodeOpen}>
                    {isCodeOpen ? t('code.hide') : t('code.show')}
                </Button>
                <Collapse in={isCodeOpen && Boolean(sources)} unmountOnExit>
                    {sources && <Box sx={{pt: 1}}><CodeViewer sources={sources} /></Box>}
                </Collapse>
            </Box>
        </>
    );

    // sin tarjeta, el título va como el de una sección de la página (el ejemplo ya trae sus tarjetas)
    if (bare) {
        return (
            <Box component="section">
                <Typography variant="h6" component="h2" sx={{mb: 1}}>{title}</Typography>
                {content}
            </Box>
        );
    }
    return <SectionCard title={title}>{content}</SectionCard>;
};

/**
 * Una sección que solo enseña código, abierto de entrada: un archivo de demos/ que no se pinta (la configuración) o código
 * fijo que no se puede revisar con tsc (el de i18next, que los ejemplos no instalan).
 *
 * @param {object} props
 * @param {string} props.title ya traducido
 * @param {string} [props.description] ya traducido
 * @param {() => Promise<{default: {ts: string, js: string}}>} [props.loadSource] () => import('…/archivo.ts?demo-source')
 * @param {{js?: string, ts?: string}} [props.sources] código fijo, en lugar de loadSource
 * @param {Array<{option: string, what: string, example?: string}>} [props.extensions] «Cómo se extiende» (ExtensionTable)
 */
export const CodeSection = ({title, description, loadSource, sources: fixedSources, extensions}) => {
    const [loadedSources, setLoadedSources] = useState(null);

    useEffect(() => {
        if (fixedSources) {
            return undefined;
        }
        // si la persona se va de la página antes de que llegue el código, no se guarda en una sección que ya no está
        let isActive = true;
        loadSource().then((module) => isActive && setLoadedSources(module.default));
        return () => {
            isActive = false;
        };
    }, [fixedSources, loadSource]);

    const sources = fixedSources ?? loadedSources;
    return (
        <SectionCard title={title}>
            {description && <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{description}</Typography>}
            {extensions && <ExtensionTable rows={extensions} />}
            {sources && <CodeViewer sources={sources} />}
        </SectionCard>
    );
};
