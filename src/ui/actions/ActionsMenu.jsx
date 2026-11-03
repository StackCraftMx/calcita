// Un botón «⋯» con un menú de acciones: el de cada tarjeta del tablero, el de cada columna, el de cada mensaje de la bandeja,
// el de cada tarjeta de registro. Las acciones las da la pantalla (label ya traducido, ícono, color, apagada); sin acciones
// no se pinta nada.
//
//   <ActionsMenu label="Acciones de «Junta de cierre»"
//                actions={[{key: 'delete', label: 'Borrar', icon: <DeleteOutlineIcon fontSize="small" />, color: 'error', onClick: remove}]} />
//
// Tan flexible como un menú de sistema (cada renglón es uno de estos):
//   {key, label, icon?, description?, color?, disabled?, onClick}   una acción; onClick recibe el evento del clic
//   {key, label, to, replace?}                                      una pantalla de la app, con la navegación del proyecto
//                                                                   (react-router, Next o la del navegador): el clic normal
//                                                                   navega sin recargar y Cmd/Ctrl+clic o el botón de en
//                                                                   medio la abren en otra pestaña, como cualquier liga
//   {key, label, href, download?}                                   una liga de afuera (bajar un documento, otro sistema)
//   {key, label, children: [...]}                                   un submenú: se abre DENTRO del mismo menú, con «‹ Regresar»
//                                                                   arriba (igual en el teléfono); también con → y ←
//   {type: 'section', key, label}                                   un título de sección
//   {type: 'divider', key}                                          una línea
//   {key, render: ({close}) => …}                                   un renglón propio (abre su ventana y cierra el menú)
//
// El clic no llega a lo de abajo: no levanta una tarjeta que se arrastra ni abre el renglón donde vive.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaActionsMenu con defaultProps y
// styleOverrides de sus partes: item, itemIcon.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useRef, useState} from 'react';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/** Los renglones que no son acciones. */
export const ACTIONS_MENU_ROW = Object.freeze({section: 'section', divider: 'divider'});

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaActionsMenu)
const THEME_NAME = 'CalcitaActionsMenu';
const ActionsItem = piecePart(THEME_NAME, 'Item', MenuItem);
const ActionsItemIcon = piecePart(THEME_NAME, 'ItemIcon', ListItemIcon);

/**
 * Los renglones del nivel abierto y sus títulos, siguiendo las llaves de los submenús abiertos.
 *
 * @param {object[]} actions
 * @param {string[]} path las llaves de los submenús abiertos, del primero al último
 * @returns {{items: object[], parents: object[]}}
 */
function levelOf(actions, path) {
    const parents = [];
    let items = actions;
    for (const key of path) {
        const parent = items.find((item) => item.key === key);
        if (!parent?.children) {
            break;
        }
        parents.push(parent);
        items = parent.children;
    }
    return {items, parents};
}

/**
 * @param {object} props
 * @param {string} props.label el nombre del botón (lector de pantalla y su tooltip), ya traducido
 * @param {Array<{key: string, type?: string, label?: string, icon?: import('react').ReactNode, description?: string, color?: string, disabled?: boolean, onClick?: (event: import('react').MouseEvent<HTMLElement>) => void, to?: string, replace?: boolean, href?: string, download?: string|boolean, children?: object[], render?: (helpers: {close: () => void}) => import('react').ReactNode}>} [props.actions]
 * @param {import('react').ReactNode} [props.icon] otro ícono para el botón (por omisión «⋯»)
 * @param {'small'|'medium'} [props.size]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function ActionsMenu(props) {
    // lo que el proyecto puso en su tema (components.CalcitaActionsMenu.defaultProps) y encima lo que llega aquí
    const {label, actions, icon, size = 'small', texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    // las pantallas de la app (to) van con el enlace de la navegación del proyecto: así el clic normal no recarga la app
    const {Link} = useToolkitNavigation();
    const [anchor, setAnchor] = useState(null);
    // los submenús abiertos (llaves), del primero al último
    const [path, setPath] = useState([]);
    const listRef = useRef(null);
    const {items, parents} = levelOf(actions ?? [], path);

    // al entrar o salir de un submenú, el foco va a su primer renglón (con el teclado se sigue sin el ratón)
    useEffect(() => {
        if (anchor) {
            listRef.current?.querySelector('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
        }
    }, [path, anchor]);

    if (!actions?.length) {
        return null;
    }
    const close = () => {
        setAnchor(null);
        setPath([]);
    };
    const goBack = () => setPath((current) => current.slice(0, -1));

    return (
        <>
            <Tooltip title={label}>
                <IconButton size={size} aria-label={label} aria-haspopup="menu"
                            onClick={(event) => {
                                event.stopPropagation();
                                setAnchor(event.currentTarget);
                            }}>
                    {icon ?? <MoreHorizRoundedIcon fontSize="small" />}
                </IconButton>
            </Tooltip>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close} onClick={(event) => event.stopPropagation()}
                  slotProps={{list: {ref: listRef, onKeyDown: (event) => {
                      if (event.key === 'ArrowLeft' && path.length > 0) {
                          event.preventDefault();
                          goBack();
                      }
                  }}}}>
                {parents.length > 0 && [
                    <ActionsItem key="__back" onClick={goBack} ownSx={{fontWeight: 600}}>
                        <ActionsItemIcon><ChevronLeftRoundedIcon fontSize="small" /></ActionsItemIcon>
                        <ListItemText primary={parents.at(-1).label} secondary={t('actionsMenu.back')} />
                    </ActionsItem>,
                    <Divider key="__back-divider" />,
                ]}
                {items.map((item) => {
                    if (item.type === ACTIONS_MENU_ROW.divider) {
                        return <Divider key={item.key} />;
                    }
                    if (item.type === ACTIONS_MENU_ROW.section) {
                        return <ListSubheader key={item.key} sx={{lineHeight: 2.5, bgcolor: 'transparent'}}>{item.label}</ListSubheader>;
                    }
                    if (item.render) {
                        return <li key={item.key}>{item.render({close})}</li>;
                    }
                    const hasChildren = Boolean(item.children?.length);
                    // a dónde lleva el renglón: una pantalla de la app (to), una liga de afuera (href) o nada (una acción)
                    let destinationProps = {};
                    if (item.to) {
                        destinationProps = {component: Link, to: item.to, ...(item.replace && {replace: true})};
                    } else if (item.href) {
                        destinationProps = {component: 'a', href: item.href, download: item.download};
                    }
                    return (
                        <ActionsItem
                            key={item.key}
                            disabled={item.disabled}
                            {...destinationProps}
                            aria-haspopup={hasChildren ? 'menu' : undefined}
                            onKeyDown={(event) => {
                                if (hasChildren && event.key === 'ArrowRight') {
                                    event.preventDefault();
                                    setPath((current) => [...current, item.key]);
                                }
                            }}
                            onClick={(event) => {
                                if (hasChildren) {
                                    setPath((current) => [...current, item.key]);
                                    return;
                                }
                                close();
                                // con el evento la pantalla decide (saber si fue con Cmd/Ctrl, o detener una liga propia)
                                item.onClick?.(event);
                            }}
                            ownSx={item.color ? {color: `${item.color}.main`} : undefined}
                        >
                            {item.icon && <ActionsItemIcon ownSx={item.color ? {color: 'inherit'} : undefined}>{item.icon}</ActionsItemIcon>}
                            <ListItemText primary={item.label} secondary={item.description} />
                            {hasChildren && <ChevronRightRoundedIcon fontSize="small" sx={{ml: 2, color: 'text.secondary'}} />}
                        </ActionsItem>
                    );
                })}
            </Menu>
        </>
    );
}
