// Todos los textos de la app para ToolkitProvider: los de la barra, los de core y los de cada módulo, juntos por idioma.
//
// Los de los módulos se descubren solos (modules/<módulo>/<módulo>Texts.js): módulo nuevo = cero ediciones aquí.
//
// OJO: constante de módulo. ToolkitProvider vuelve a configurar todo cuando cambia `texts`; un objeto nuevo en cada
// pintada lo haría en cada pintada.
import {combineTexts} from '@/app/combineTexts.js';
import {shellTexts} from '@/app/shellTexts.js';
import {coreTexts} from '@/core';

const MODULE_TEXT_FILES = import.meta.glob('@/modules/*/*Texts.js', {eager: true});

// cada archivo de textos exporta un solo objeto {es, en}
const moduleTexts = Object.values(MODULE_TEXT_FILES).flatMap((textFile) => Object.values(textFile));

export const APP_TEXTS = combineTexts([shellTexts, coreTexts, ...moduleTexts]);
