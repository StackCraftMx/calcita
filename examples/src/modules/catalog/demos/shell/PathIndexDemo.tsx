// Direcciones con nombre: cada módulo publica las suyas en su paths.js y el índice las junta. Una pantalla que lleva a la de
// OTRO módulo la pide por nombre, sin importarlo: pathOf('admin:clients:providerList'). Lo que la ruta pide (:userId) se
// sustituye y lo que sobra va como consulta; un nombre que no existe truena diciendo qué sí hay.
//
// En su proyecto el índice se arma con el glob (aquí va escrito, para verlo en la página):
//   export const {pathOf} = createPathIndex(import.meta.glob('@/modules/**/paths.js', {eager: true}));
// Las direcciones del API, igual, con uris.js: createPathIndex(import.meta.glob('@/modules/**/uris.js', {eager: true}), {exportName: 'uris'}).
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {createPathIndex} from '@stackcraftmx/calcita';

const CODE_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

// 1. Lo que da el glob: cada archivo con lo que publica (el camino del módulo sale de su carpeta)
const {pathOf} = createPathIndex({
    '/src/modules/admin/clients/paths.js': {paths: {providerList: '/admin/user/providers/list'}},
    '/src/modules/admin/profile/paths.js': {paths: {detail: '/admin/user/detail/:groupId/:userId'}},
    '/src/modules/orders/paths.js': {paths: {list: '/orders'}},
});

// 2. Las llamadas y lo que dan (un error también es una respuesta: dice qué sí hay)
const CALLS: Array<{code: string, run: () => string}> = [
    {code: "pathOf('admin:clients:providerList')", run: () => pathOf('admin:clients:providerList')},
    {code: "pathOf('admin:profile:detail', {groupId: 2, userId: 7675})", run: () => pathOf('admin:profile:detail', {groupId: 2, userId: 7675})},
    {code: "pathOf('admin:profile:detail', {groupId: 2, userId: 7675, tab: 'documentos'})", run: () => pathOf('admin:profile:detail', {groupId: 2, userId: 7675, tab: 'documentos'})},
    {code: "pathOf('orders:list', {orders_status: 'canceled'})", run: () => pathOf('orders:list', {orders_status: 'canceled'})},
    {code: "pathOf('admin:clientes:providerList')", run: () => pathOf('admin:clientes:providerList')},
    {code: "pathOf('admin:profile:detail', {groupId: 2})", run: () => pathOf('admin:profile:detail', {groupId: 2})},
];

const resultOf = (run: () => string) => {
    try {
        return run();
    } catch (error) {
        return `✗ ${(error as Error).message}`;
    }
};

const PathIndexDemo = () => (
    <TableContainer>
        <Table size="small" aria-label="Direcciones con nombre">
            <TableHead>
                <TableRow>
                    <TableCell>Se escribe</TableCell>
                    <TableCell>Sale</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {CALLS.map(({code, run}) => (
                    <TableRow key={code}>
                        <TableCell sx={{fontFamily: CODE_FONT, fontSize: 13}}>{code}</TableCell>
                        <TableCell sx={{fontFamily: CODE_FONT, fontSize: 13, overflowWrap: 'anywhere'}}>{resultOf(run)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

export default PathIndexDemo;
