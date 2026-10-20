// Elegir qué pantallas van en la barra de pestañas del teléfono: una lista de todo el menú con un interruptor por renglón.
// Sale dentro de la hoja de «Más» (MobileTabBar) al picar «Editar la barra».
//
//   - Hasta PINNABLE_TAB_LIMIT (las que caben junto a «Más»); llenas, las demás se apagan hasta quitar una.
//   - Al menos una: el interruptor de la última no se puede apagar (sin ninguna, la barra volvería sola a las del proyecto
//     y parecería que no hizo caso).
//   - Lo elegido se guarda al picar «Listo»; «Como venía» regresa a las que eligió el proyecto.
//   - Van en el orden del menú: acomodarlas arrastrando sería otra decisión para la persona y otra cosa que probar.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaTabBarEditor con defaultProps y
// styleOverrides de sus partes: root, header, title, list, itemIcon, footer.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import {menuItemLabelOf} from '@/appShell/menuItemText.js';
import {PINNABLE_TAB_LIMIT, menuItemKeyOf} from '@/navigation/appMenu.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaTabBarEditor)
const THEME_NAME = 'CalcitaTabBarEditor';
const EditorRoot = piecePart(THEME_NAME, 'Root', Box);
const EditorHeader = piecePart(THEME_NAME, 'Header', Box);
const EditorTitle = piecePart(THEME_NAME, 'Title', Typography);
const EditorList = piecePart(THEME_NAME, 'List', List);
const EditorItemIcon = piecePart(THEME_NAME, 'ItemIcon', ListItemIcon);
const EditorFooter = piecePart(THEME_NAME, 'Footer', Box);

/**
 * @param {object} props
 * @param {object[]} props.menuItems todo el menú (lo que regresa composeMenu)
 * @param {string[]} props.pinnedKeys las que van hoy en la barra (menuItemKeyOf)
 * @param {(keys: string[]) => void} props.onDone con las elegidas, en el orden del menú
 * @param {() => void} props.onReset regresar a las del proyecto
 */
export default function TabBarEditor(props) {
    // lo que el proyecto puso en su tema (components.CalcitaTabBarEditor.defaultProps) y encima lo que llega aquí
    const {menuItems, pinnedKeys, onDone, onReset, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('layout');
    const [chosenKeys, setChosenKeys] = useState(pinnedKeys);
    const isFull = chosenKeys.length >= PINNABLE_TAB_LIMIT;

    const toggle = (key, isOn) => setChosenKeys((current) => (isOn ? [...current, key] : current.filter((chosenKey) => chosenKey !== key)));
    // en el orden del menú, no en el que se fueron picando
    const chosenInMenuOrder = () => menuItems.map(menuItemKeyOf).filter((key) => chosenKeys.includes(key));

    return (
        <EditorRoot ownSx={{display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0}}>
            <EditorHeader ownSx={{px: 2, pt: 2, pb: 1, flexShrink: 0}}>
                <EditorTitle variant="subtitle1" component="h2" ownSx={{fontWeight: 600}}>{t('drawer.editTabs')}</EditorTitle>
                <Typography variant="body2" color="text.secondary">{t('drawer.editTabsHint', {count: PINNABLE_TAB_LIMIT})}</Typography>
            </EditorHeader>
            <EditorList dense ownSx={{overflowY: 'auto', flex: '1 1 auto', minHeight: 0, px: 1}}>
                {menuItems.map((menuItem) => {
                    const key = menuItemKeyOf(menuItem);
                    const label = menuItemLabelOf(menuItem, t);
                    const isOn = chosenKeys.includes(key);
                    const isLastOne = isOn && chosenKeys.length === 1;
                    const switchId = `tab-bar-editor-${key}`;
                    return (
                        <ListItem key={key} secondaryAction={(
                            <Switch edge="end" checked={isOn} disabled={(!isOn && isFull) || isLastOne}
                                    onChange={(event) => toggle(key, event.target.checked)}
                                    slotProps={{input: {id: switchId, 'aria-label': t('drawer.tabInBar', {label})}}} />
                        )}>
                            {menuItem.Icon && <EditorItemIcon ownSx={{minWidth: 40}}><menuItem.Icon /></EditorItemIcon>}
                            <ListItemText primary={<label htmlFor={switchId}>{label}</label>} />
                        </ListItem>
                    );
                })}
            </EditorList>
            <EditorFooter ownSx={{display: 'flex', justifyContent: 'space-between', gap: 1, px: 2, py: 1.5, flexShrink: 0}}>
                <Button onClick={onReset}>{t('drawer.resetTabs')}</Button>
                <Button variant="contained" onClick={() => onDone(chosenInMenuOrder())}>{t('drawer.doneEditing')}</Button>
            </EditorFooter>
        </EditorRoot>
    );
}
