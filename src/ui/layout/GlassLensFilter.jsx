// El LENTE del vidrio líquido (glassSurface.js, lensRulesOf): los dos filtros SVG que doblan lo de atrás en la orilla del
// vidrio, uno para los controles chicos y otro para los paneles, y la marca en <body> que prende el lente en el tema.
//
// Va una vez en la página: AppLayout y AuthLayout ya lo ponen; una pantalla propia fuera de ellos lo pone con
// <GlassLensFilter />. Sin el vidrio en el tema no pinta nada.
//
// La marca solo se pone en Chrome y sus parientes (Edge, Brave, Arc), los únicos que pintan un filtro SVG en
// backdrop-filter: Firefox lo acepta sin pintarlo (el vidrio se quedaría sin desenfoque) y Safari no lo entiende. En ellos
// el vidrio sigue esmerilado.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect} from 'react';
import {useTheme} from '@mui/material/styles';

import {GLASS_LENS, isGlassTheme, lensDisplacementMapOf} from '@/theme/glassSurface.js';

// cuántos GlassLensFilter hay montados: la marca se quita hasta que se va el último
let mountedFilterCount = 0;

/**
 * Si el navegador es de la familia de Chrome (Chromium), el único que pinta el lente.
 *
 * @returns {boolean}
 */
function isChromiumBrowser() {
    return Boolean(navigator.userAgentData?.brands?.some((entry) => entry.brand === 'Chromium'));
}

export default function GlassLensFilter() {
    const theme = useTheme();
    const isGlass = isGlassTheme(theme);

    useEffect(() => {
        if (!isGlass || !isChromiumBrowser()) {
            return undefined;
        }
        mountedFilterCount += 1;
        document.body.dataset.glassLens = 'on';
        return () => {
            mountedFilterCount -= 1;
            if (mountedFilterCount === 0) {
                delete document.body.dataset.glassLens;
            }
        };
    }, [isGlass]);

    // guard clause: sin vidrio en el tema no hace falta ningún filtro
    if (!isGlass) {
        return null;
    }

    return (
        <svg aria-hidden="true" focusable="false" width="0" height="0" style={{position: 'absolute', width: 0, height: 0, overflow: 'hidden'}}>
            {Object.values(GLASS_LENS).map((lens) => (
                // objectBoundingBox: el mapa se estira al tamaño de cada vidrio, sea un chip o la barra entera
                <filter key={lens.filterId} id={lens.filterId} x="0" y="0" width="1" height="1" primitiveUnits="objectBoundingBox"
                        colorInterpolationFilters="sRGB">
                    <feImage result="lensMap" x="0" y="0" width="1" height="1" preserveAspectRatio="none" href={lensDisplacementMapOf(lens.edgeFraction)} />
                    <feDisplacementMap in="SourceGraphic" in2="lensMap" scale={lens.scale} xChannelSelector="R" yChannelSelector="G" />
                </filter>
            ))}
        </svg>
    );
}
