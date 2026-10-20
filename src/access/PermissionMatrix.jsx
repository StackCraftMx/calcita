// Los permisos de un perfil, agrupados (un grupo por módulo), para la pantalla de «Perfiles y permisos»: cada grupo con
// su casilla de «todos» (a medias si tiene algunos) y cuántos tiene, y cada permiso con su nombre y, si hace falta, qué
// deja hacer en palabras normales.
//
//   <PermissionMatrix groups={PERMISSION_GROUPS} value={profile.abilities} onChange={setAbilities} />
//
// Los permisos son los mismos textos que piden los menu.js y las rutas (access: {ability: 'orders.view'}), así que lo que
// se palomea aquí es lo que el menú enseña o esconde. La lista de grupos la arma el proyecto (RBAC propio); guardar es
// cosa de la pantalla.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaPermissionMatrix con defaultProps y
// styleOverrides de sus partes: permission, checkbox, group, groupHeader, groupTitle, grid.
//
// Genérico del paquete: function (regla de la casa). No sabe de negocio: todo llega ya traducido.
import {useId} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {groupStateOf, withPermission, withPermissionGroup} from '@/access/permissionGroups.js';
import ComponentTexts from '@/toolkit/ComponentTexts.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaPermissionMatrix)
const THEME_NAME = 'CalcitaPermissionMatrix';
const PermissionsPermission = piecePart(THEME_NAME, 'Permission', FormControlLabel);
const PermissionsCheckbox = piecePart(THEME_NAME, 'Checkbox', Checkbox);
const PermissionsGroup = piecePart(THEME_NAME, 'Group', Paper);
const PermissionsGroupHeader = piecePart(THEME_NAME, 'GroupHeader', Stack);
const PermissionsGroupTitle = piecePart(THEME_NAME, 'GroupTitle', Typography);
const PermissionsGrid = piecePart(THEME_NAME, 'Grid', Box);

/**
 * Un permiso: su casilla, su nombre y qué deja hacer.
 *
 * @param {{permission: {key: string, label: string, description?: string}, isGranted: boolean, readOnly: boolean, onToggle: (isGranted: boolean) => void}} props
 */
function PermissionOption({permission, isGranted, readOnly, onToggle}) {
    return (
        <PermissionsPermission
            ownSx={{alignItems: 'flex-start', m: 0, gap: 0.5}}
            control={<PermissionsCheckbox size="small" checked={isGranted} disabled={readOnly} onChange={(event) => onToggle(event.target.checked)}
                               slotProps={{input: {'data-permission': permission.key}}} ownSx={{mt: -0.5}} />}
            label={(
                <Box>
                    <Typography variant="body2">{permission.label}</Typography>
                    {permission.description && <Typography variant="caption" color="text.secondary" component="p">{permission.description}</Typography>}
                </Box>
            )}
        />
    );
}

/**
 * Un grupo: su encabezado con «todos» y cuántos tiene, y sus permisos.
 *
 * OJO: es un grupo con role="group" y no un <fieldset>: el navegador pinta el <legend> encima del borde y dejaba una franja
 * blanca arriba del encabezado.
 *
 * @param {{group: object, value: string[], onChange: Function, isReadOnly: boolean}} props
 */
function PermissionGroup({group, value, onChange, isReadOnly}) {
    const {t} = useToolkitTranslation('access');
    const titleId = useId();
    const state = groupStateOf(group, value);
    return (
        <PermissionsGroup variant="outlined" role="group" aria-labelledby={titleId} data-group={group.key} ownSx={{overflow: 'hidden'}}>
            <PermissionsGroupHeader direction="row" spacing={1} ownSx={{alignItems: 'center', px: 1.5, py: 0.75, borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover'}}>
                <Checkbox size="small" checked={state.isAll} indeterminate={state.isSome} disabled={isReadOnly || state.total === 0}
                          onChange={(event) => onChange(withPermissionGroup(value, group, event.target.checked))}
                          slotProps={{input: {'aria-label': t('permissions.allOf', {group: group.label})}}} />
                <PermissionsGroupTitle id={titleId} variant="subtitle2" component="h3" ownSx={{flexGrow: 1}}>{group.label}</PermissionsGroupTitle>
                <Chip size="small" label={t('permissions.countOf', {count: state.grantedCount, total: state.total})}
                      color={state.grantedCount > 0 ? 'primary' : 'default'} variant={state.isAll ? 'filled' : 'outlined'} />
            </PermissionsGroupHeader>
            <PermissionsGrid ownSx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 1.5, p: 2}}>
                {group.permissions.map((permission) => (
                    <PermissionOption key={permission.key} permission={permission} isGranted={value.includes(permission.key)} readOnly={isReadOnly}
                                      onToggle={(isGranted) => onChange(withPermission(value, permission.key, isGranted))} />
                ))}
            </PermissionsGrid>
        </PermissionsGroup>
    );
}

/**
 * @param {object} props
 * @param {Array<{key: string, label: string, permissions: Array<{key: string, label: string, description?: string}>}>} props.groups
 * @param {string[]} props.value los permisos del perfil
 * @param {(value: string[]) => void} [props.onChange] sin ella, o con readOnly, solo se ven
 * @param {boolean} [props.readOnly] un perfil que no se puede cambiar (el de administración)
 * @param {object} [props.texts] los textos que cambian, con la forma de `access` en los textos del paquete
 */
export default function PermissionMatrix(props) {
    // lo que el proyecto puso en su tema (components.CalcitaPermissionMatrix.defaultProps) y encima lo que llega aquí
    const {groups, value, onChange, readOnly = false, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const isReadOnly = readOnly || !onChange;
    return (
        <ComponentTexts namespace="access" texts={texts}>
            <Stack spacing={1.5}>
                {groups.map((group) => <PermissionGroup key={group.key} group={group} value={value} onChange={onChange} isReadOnly={isReadOnly} />)}
            </Stack>
        </ComponentTexts>
    );
}
