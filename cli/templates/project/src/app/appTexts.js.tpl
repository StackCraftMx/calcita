// Todos los textos de la app: los de la barra y los de cada módulo, juntos por idioma.
//
// Los de los módulos se descubren solos (modules/<módulo>/*Texts.js): módulo nuevo = cero ediciones aquí.
//
// OJO: constante de módulo. ToolkitProvider vuelve a configurar todo cuando cambian sus textos; un objeto nuevo en cada
// pintada lo haría en cada pintada.
import {combineTexts} from '@/app/combineTexts.js';
import {shellTexts} from '@/app/shellTexts.js';

const MODULE_TEXT_FILES = import.meta.glob('@/modules/*/*Texts.js', {eager: true});

// cada archivo de textos exporta un solo objeto {es, en}
const moduleTexts = Object.values(MODULE_TEXT_FILES).flatMap((textFile) => Object.values(textFile));

export const APP_TEXTS = combineTexts([shellTexts, ...moduleTexts]);
