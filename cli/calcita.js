#!/usr/bin/env node
// El CLI de Calcita: arma un proyecto nuevo con preguntas y el esqueleto de módulos, pantallas, formularios y componentes,
// con la forma de los ejemplos (un módulo por carpeta, con su menú, sus rutas, sus textos y su API).
//
//   npx @stackcraftmx/calcita new mi-tienda          (o: pnpm dlx @stackcraftmx/calcita new mi-tienda)
//   pnpm exec calcita make:module purchase-orders    (dentro del proyecto)
//
// Solo node, sin dependencias: corre antes de que el proyecto tenga nada instalado. Los textos para la persona van en
// español; los nombres que escribe (módulos, pantallas…), en inglés y sin acentos, como el resto del código.
//
// OJO: los imports del CLI van con «./» y no con el alias @/: el CLI se publica tal cual y node no conoce el alias.
import {basename, resolve} from 'node:path';
import {argv, cwd, exit, stdin, stdout} from 'node:process';
import {parseArgs} from 'node:util';

import {askQuestions} from './askQuestions.js';
import {makeComponent} from './makeComponent.js';
import {makeForm} from './makeForm.js';
import {makeModule} from './makeModule.js';
import {makePage} from './makePage.js';
import {namesOf} from './names.js';
import {newProject} from './newProject.js';
import {QUESTIONS, answersFromFlags, checkedAnswers, defaultAnswersOf} from './projectAnswers.js';
import {screenLabelsOf} from './screenLabels.js';
import {CliError} from './templateFiles.js';

const HELP = `Calcita: proyectos y esqueletos con la forma de los ejemplos.

  calcita new <carpeta>                      un proyecto nuevo (pregunta cómo lo quiere)
  calcita init                               lo mismo, en la carpeta actual (vacía)
  calcita make:module <módulo>               un módulo: menú, ruta, pantalla, formulario, API, textos y servidor de mentira
  calcita make:page <módulo> <Pantalla>      otra pantalla en un módulo, con su ruta
  calcita make:form <módulo> <Formulario>    un formulario con sus reglas y sus textos
  calcita make:component <Componente>        un componente en src/core (lo usan varios módulos)
       --module <módulo>                     … o solo de un módulo

Opciones:
  -y, --yes                 sin preguntas: lo recomendado, más lo que diga cada opción
  --label-es, --label-en    el nombre en pantalla de un módulo o una pantalla nueva
${QUESTIONS.map((question) => `  --${namesOf(question.key).kebab}=${question.options ? question.options.map(([value]) => value).join('|') : '…'}`).join('\n')}

Los nombres van en inglés y sin acentos (purchase-orders, OrderDetail); el texto en pantalla, con --label-es y --label-en.`;

// las respuestas de «new» también llegan como opciones: --menu-position=top
const ANSWER_OPTIONS = Object.fromEntries(QUESTIONS.map((question) => [namesOf(question.key).kebab, {type: 'string'}]));

const {values: options, positionals} = parseArgs({
    args: argv.slice(2),
    allowPositionals: true,
    options: {
        'yes': {type: 'boolean', short: 'y'},
        'help': {type: 'boolean', short: 'h'},
        'module': {type: 'string'},
        'label-es': {type: 'string'},
        'label-en': {type: 'string'},
        ...ANSWER_OPTIONS,
    },
});
const [command, ...commandArguments] = positionals;
// se pregunta solo en una terminal de verdad y sin --yes (en un script se usa lo recomendado)
const canAsk = Boolean(stdin.isTTY) && !options.yes;

/** Las respuestas que llegaron como opciones, con la llave de su pregunta (menuPosition). */
function answersInOptions() {
    return Object.fromEntries(QUESTIONS
        .map((question) => [question.key, options[namesOf(question.key).kebab]])
        .filter(([, value]) => value !== undefined));
}

/** Imprime lo escrito, una ruta por renglón. */
function printWritten(written) {
    stdout.write(`${written.map((path) => `  + ${path}`).join('\n')}\n`);
}

async function runNew(folder) {
    if (!folder) {
        throw new CliError('Falta la carpeta del proyecto: calcita new mi-tienda');
    }
    const folderName = basename(resolve(folder));
    const presetAnswers = answersInOptions();
    const answers = canAsk
        ? checkedAnswers({...defaultAnswersOf(folderName), ...presetAnswers, ...await askQuestions({...defaultAnswersOf(folderName), ...presetAnswers}, presetAnswers)})
        : answersFromFlags(folderName, presetAnswers);
    const {projectRoot, written} = await newProject({folder, answers});
    stdout.write(`\nListo: ${projectRoot}\n`);
    printWritten(written);
    const enterFolder = folder === '.' ? '' : `  cd ${folder}\n`;
    stdout.write(`\nPara arrancar:\n${enterFolder}  pnpm install\n  pnpm dev\n`);
    if (answers.auth === 'yes') {
        stdout.write('\nEn la pantalla de entrar, «Entrar con la cuenta de ejemplo» entra sin escribir nada (servidor de mentira).\n');
    }
}

async function runMakeModule(moduleName) {
    const labels = await screenLabelsOf({
        defaultLabel: namesOf(moduleName ?? 'module').human, labelEs: options['label-es'], labelEn: options['label-en'], canAsk, what: 'el módulo',
    });
    const {written, path} = await makeModule({projectRoot: cwd(), moduleName, labels});
    printWritten(written);
    stdout.write(`\nListo: ya sale en el menú y en ${path}.\n`);
}

async function runMakePage(moduleName, pageName) {
    const labels = await screenLabelsOf({
        defaultLabel: namesOf(pageName ?? 'page').human, labelEs: options['label-es'], labelEn: options['label-en'], canAsk, what: 'la pantalla',
    });
    const {written, path, manualLines} = await makePage({projectRoot: cwd(), moduleName, pageName, labels});
    printWritten(written);
    if (manualLines) {
        stdout.write(`\nNo reconocí la forma de routes.js del módulo: agregue a mano estos renglones (la constante y la ruta):\n${manualLines.join('\n')}\n`);
    }
    stdout.write(`\nListo: la pantalla está en ${path}.\n`);
}

async function runMakeForm(moduleName, formName) {
    const written = await makeForm({projectRoot: cwd(), moduleName, formName});
    printWritten(written);
    // el componente es el .jsx que se escribió: la pantalla le dice qué hacer con los datos
    const componentName = written.find((path) => path.endsWith('.jsx'))?.split('/').at(-1).replace('.jsx', '');
    stdout.write(`\nListo. En una pantalla del módulo: <${componentName} onSubmit={addRecord} onSaved={showSaved} /> (las funciones de su *Api.js).\n`);
}

async function runMakeComponent(componentName) {
    printWritten(await makeComponent({projectRoot: cwd(), componentName, moduleName: options.module}));
    stdout.write('\nListo.\n');
}

const COMMANDS = Object.freeze({
    'new': runNew,
    'init': () => runNew('.'),
    'make:module': runMakeModule,
    'make:page': runMakePage,
    'make:form': runMakeForm,
    'make:component': runMakeComponent,
});

try {
    const run = COMMANDS[command];
    if (options.help || !command) {
        stdout.write(`${HELP}\n`);
    } else if (!run) {
        throw new CliError(`No conozco el comando «${command}». Vea: calcita --help`);
    } else {
        await run(...commandArguments);
    }
} catch (error) {
    // un error que se le explica a la persona sale solo con su mensaje; uno del CLI, completo (para reportarlo)
    stdout.write(error instanceof CliError ? `\n${error.message}\n` : `\n${error.stack}\n`);
    exit(1);
}
