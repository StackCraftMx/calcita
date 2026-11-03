// Pruebas de la revisión de textos del CLI (calcita check:texts), sobre un proyecto chiquito en una carpeta temporal.
import assert from 'node:assert/strict';
import {mkdir, mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';

import {checkTexts} from './checkTexts.js';

/** Un proyecto con un módulo de pedidos: sus textos y una pantalla que los pide. */
async function projectWith({ordersTexts, pageCode}) {
    const projectRoot = await mkdtemp(join(tmpdir(), 'calcita-textos-'));
    await mkdir(join(projectRoot, 'src/modules/orders'), {recursive: true});
    await writeFile(join(projectRoot, 'src/modules/orders/ordersTexts.js'), `export const ordersTexts = ${JSON.stringify(ordersTexts)};\n`);
    await writeFile(join(projectRoot, 'src/modules/orders/OrdersPage.jsx'), pageCode);
    return projectRoot;
}

// los de Calcita, para no depender de su dist/ en la prueba
const PACKAGE_TEXTS = {es: {common: {actions: {save: 'Guardar'}}}, en: {common: {actions: {save: 'Save'}}}};

test('todo en su lugar: sin problemas, y cuenta las llaves revisadas', async () => {
    const projectRoot = await projectWith({
        ordersTexts: {es: {orders: {title: 'Pedidos', count_one: '{{count}} pedido', count_other: '{{count}} pedidos'}}, en: {orders: {title: 'Orders', count_one: '{{count}} order', count_other: '{{count}} orders'}}},
        pageCode: "const {t} = useToolkitTranslation('orders');\nt('title'); t('count', {count: 2}); t('common:actions.save');\n",
    });
    const result = await checkTexts({projectRoot, packageTexts: PACKAGE_TEXTS});
    assert.deepEqual(result.problems, []);
    assert.equal(result.checkedKeys, 3);
});

test('una llave que no existe se dice con su archivo, su renglón y su idioma; con defaultValue no', async () => {
    const projectRoot = await projectWith({
        ordersTexts: {es: {orders: {title: 'Pedidos'}}, en: {orders: {title: 'Orders'}}},
        pageCode: "const {t} = useToolkitTranslation('orders');\nt('title');\nt('tabs.documents');\nt('tabs.optional', {defaultValue: ''});\n",
    });
    const {problems} = await checkTexts({projectRoot, packageTexts: PACKAGE_TEXTS});
    assert.equal(problems.length, 2);
    assert.match(problems[0], /OrdersPage\.jsx:3 {2}«orders:tabs\.documents» no existe en es/);
});

test('lo que está en un idioma y falta en otro se dice', async () => {
    const projectRoot = await projectWith({
        ordersTexts: {es: {orders: {title: 'Pedidos', empty: 'Sin pedidos'}}, en: {orders: {title: 'Orders'}}},
        pageCode: "const {t} = useToolkitTranslation('orders');\nt('title');\n",
    });
    const {problems} = await checkTexts({projectRoot, packageTexts: PACKAGE_TEXTS});
    assert.deepEqual(problems, ['«orders:empty» está en es y falta en en']);
});

test('el archivo que junta los textos (con el glob de Vite) se salta: no es un archivo de textos', async () => {
    const projectRoot = await projectWith({
        ordersTexts: {es: {orders: {title: 'Pedidos'}}, en: {orders: {title: 'Orders'}}},
        pageCode: "const {t} = useToolkitTranslation('orders');\nt('title');\n",
    });
    await mkdir(join(projectRoot, 'src/app'), {recursive: true});
    await writeFile(join(projectRoot, 'src/app/appTexts.js'), "import {combineTexts} from '@stackcraftmx/calcita';\nconst files = import.meta.glob('@/modules/*/*Texts.js', {eager: true});\n");
    const {problems, textFiles} = await checkTexts({projectRoot, packageTexts: PACKAGE_TEXTS});
    assert.deepEqual(problems, []);
    assert.deepEqual(textFiles, ['src/modules/orders/ordersTexts.js']);
});

test('un archivo de textos que reexporta otro con @/ se lee, y lo reexportado cuenta una vez (no como repetido)', async () => {
    const projectRoot = await projectWith({
        ordersTexts: {es: {orders: {title: 'Pedidos'}}, en: {orders: {title: 'Orders'}}},
        pageCode: "const {t} = useToolkitTranslation('orders');\nt('title');\nt('files.pdf');\n",
    });
    // fileNameTexts.js también es un archivo de textos: se lee solo y otra vez por medio de texts.js
    await writeFile(join(projectRoot, 'src/modules/orders/fileNameTexts.js'), "export const fileNameTexts = {es: {orders: {files: {pdf: 'PDF'}}}, en: {orders: {files: {pdf: 'PDF'}}}};\n");
    await writeFile(join(projectRoot, 'src/modules/orders/texts.js'), "export {fileNameTexts} from '@/modules/orders/fileNameTexts.js';\n");
    const {problems, checkedKeys} = await checkTexts({projectRoot, packageTexts: PACKAGE_TEXTS});
    assert.deepEqual(problems, []);
    assert.equal(checkedKeys, 2);
});

test('un archivo de textos que no se puede leer para la revisión: no sale la lista de llaves faltantes', async () => {
    const projectRoot = await projectWith({
        ordersTexts: {es: {orders: {title: 'Pedidos'}}, en: {orders: {title: 'Orders'}}},
        pageCode: "const {t} = useToolkitTranslation('customers');\nt('title');\nt('detail.rfc');\n",
    });
    await mkdir(join(projectRoot, 'src/modules/customers'), {recursive: true});
    await writeFile(join(projectRoot, 'src/modules/customers/texts.js'), "export {customerTexts} from '@/modules/customers/missing.js';\n");
    const {problems, checkedKeys} = await checkTexts({projectRoot, packageTexts: PACKAGE_TEXTS});
    assert.equal(checkedKeys, 0);
    assert.equal(problems.length, 2);
    assert.match(problems[0], /src\/modules\/customers\/texts\.js: no se pudo leer/);
    assert.match(problems[1], /No revisé las llaves/);
});

test('sin archivos de textos o sin la carpeta del código no sale «todo en su lugar»: un verde falso es peor que un rojo', async () => {
    const projectRoot = await mkdtemp(join(tmpdir(), 'calcita-textos-'));
    const withoutFolder = await checkTexts({projectRoot, packageTexts: PACKAGE_TEXTS});
    assert.match(withoutFolder.problems[0], /No existe la carpeta src\//);

    await mkdir(join(projectRoot, 'src'), {recursive: true});
    await writeFile(join(projectRoot, 'src/main.jsx'), "t('common:actions.save');\n");
    const withoutTexts = await checkTexts({projectRoot, packageTexts: PACKAGE_TEXTS});
    assert.match(withoutTexts.problems[0], /No encontré archivos de textos/);
});

test('con el código en otra carpeta (un Laravel: resources/js) se revisa ahí, y @/ apunta a esa carpeta', async () => {
    const projectRoot = await mkdtemp(join(tmpdir(), 'calcita-textos-'));
    await mkdir(join(projectRoot, 'resources/js/modules/orders'), {recursive: true});
    await writeFile(join(projectRoot, 'resources/js/modules/orders/ordersNames.js'), "export const ordersNames = {es: {orders: {title: 'Pedidos'}}, en: {orders: {title: 'Orders'}}};\n");
    await writeFile(join(projectRoot, 'resources/js/modules/orders/texts.js'), "export {ordersNames} from '@/modules/orders/ordersNames.js';\n");
    await writeFile(join(projectRoot, 'resources/js/modules/orders/OrdersPage.jsx'), "const {t} = useToolkitTranslation('orders');\nt('title');\nt('missing');\n");
    const {problems, checkedKeys, sourceFolder} = await checkTexts({projectRoot, sourceFolder: 'resources/js/', packageTexts: PACKAGE_TEXTS});
    assert.equal(sourceFolder, 'resources/js');
    assert.equal(checkedKeys, 2);
    assert.deepEqual(problems, [
        'resources/js/modules/orders/OrdersPage.jsx:3  «orders:missing» no existe en es',
        'resources/js/modules/orders/OrdersPage.jsx:3  «orders:missing» no existe en en',
    ]);
});
