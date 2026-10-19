// Los textos de las páginas del catálogo, para todas sus pantallas: bajan con esta pieza (una ruta sin dirección que envuelve
// las del catálogo, ver routes.js), no al abrir la app. Las páginas los piden igual que siempre, t('buttons.title').
//
// Es el uso de ComponentTexts para cargar textos por partes: un módulo grande trae los suyos cuando se entra a él.
//
// Lo renderiza la app: arrow (regla de la casa).
import {Outlet} from 'react-router';
import {ComponentTexts, useToolkitTranslation} from '@stackcraftmx/calcita';

import {catalogPageTexts} from '@/modules/catalog/pageTexts/catalogPageTexts.js';

// un idioma sin traducción del catálogo (uno que agregue el proyecto) lo lee en español
const FALLBACK_LANGUAGE = 'es';

export const CatalogTexts = () => {
    const {language} = useToolkitTranslation('catalog');
    const pageTexts = catalogPageTexts[language] ?? catalogPageTexts[FALLBACK_LANGUAGE];

    return (
        <ComponentTexts namespace="catalog" texts={pageTexts.catalog}>
            <Outlet />
        </ComponentTexts>
    );
};
