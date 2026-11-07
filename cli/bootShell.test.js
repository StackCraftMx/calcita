// El armazón del primer arranque (la silueta del marco mientras baja la app) vive en dos lugares: el index.html de los
// ejemplos (de ahí lo enseña Hecho en Calcita para copiarlo) y la plantilla que arma `calcita new`. Esta prueba revisa que
// digan lo mismo: un arreglo en uno que no llega al otro dejaría proyectos nuevos con el armazón viejo.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {test} from 'node:test';

const BOOT_SHELL_START = '<!-- calcita:boot-shell';
const BOOT_SHELL_END = '<!-- /calcita:boot-shell -->';

/** El armazón de un index.html, de su comentario de inicio a su comentario de fin. */
async function bootShellOf(relativePath) {
    const html = await readFile(join(process.cwd(), relativePath), 'utf8');
    const start = html.indexOf(BOOT_SHELL_START);
    const end = html.indexOf(BOOT_SHELL_END);
    assert.ok(start >= 0 && end > start, `${relativePath} no trae el armazón del primer arranque`);
    return html.slice(start, end + BOOT_SHELL_END.length);
}

test('la plantilla de calcita new trae el mismo armazón del primer arranque que los ejemplos', async () => {
    assert.equal(await bootShellOf('cli/templates/project/index.html.tpl'), await bootShellOf('examples/index.html'));
});

test('el armazón va adentro de #root (React lo reemplaza al pintar) y no fija color-scheme (pelearía con MUI)', async () => {
    const html = await readFile(join(process.cwd(), 'examples/index.html'), 'utf8');
    const shell = await bootShellOf('examples/index.html');

    assert.ok(html.indexOf('<div id="root">') < html.indexOf(BOOT_SHELL_START));
    assert.ok(html.indexOf(BOOT_SHELL_END) < html.indexOf('</div>\n<script'));
    // la propiedad suelta (color-scheme: …), no la consulta prefers-color-scheme, que sí va
    assert.doesNotMatch(shell.replace(/<!--[\s\S]*?-->/g, ''), /(^|[^-])color-scheme\s*:/m);
    assert.match(shell, /prefers-color-scheme:\s*dark/);
});
