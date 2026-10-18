// Elegir qué pantallas van en la barra de pestañas del teléfono: una lista de todo el menú con un interruptor por renglón.
// Sale dentro de la hoja de «Más» (MobileTabBar) al picar «Editar la barra».
//
//   - Hasta PINNABLE_TAB_LIMIT (las que caben junto a «Más»); llenas, las demás se apagan hasta quitar una.
//   - Al menos una: el interruptor de la última no se puede apagar (sin ninguna, la barra volvería sola a las del proyecto
//     y parecería que no hizo caso).
//   - Lo elegido se guarda al picar «Listo»; «Como venía» regresa a las que eligió el proyecto.
//   - Van en el orden del menú: acomodarlas arrastrando sería otra decisión para la persona y otra cosa que probar.
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

/**
 * @param {object} props
 * @param {object[]} props.menuItems todo el menú (lo que regresa composeMenu)
 * @param {string[]} props.pinnedKeys las que van hoy en la barra (menuItemKeyOf)
 * @param {(keys: string[]) => void} props.onDone con las elegidas, en el orden del menú
 * @param {() => void} props.onReset regresar a las del proyecto
 */
export default function TabBarEditor({menuItems, pinnedKeys, onDone, onReset}) {
    const {t} = useToolkitTranslation('layout');
    const [chosenKeys, setChosenKeys] = useState(pinnedKeys);
    const isFull = chosenKeys.length >= PINNABLE_TAB_LIMIT;

    const toggle = (key, isOn) => setChosenKeys((current) => (isOn ? [...current, key] : current.filter((chosenKey) => chosenKey !== key)));
    // en el orden del menú, no en el que se fueron picando
    const chosenInMenuOrder = () => menuItems.map(menuItemKeyOf).filter((key) => chosenKeys.includes(key));

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0}}>
            <Box sx={{px: 2, pt: 2, pb: 1, flexShrink: 0}}>
                <Typography variant="subtitle1" component="h2" sx={{fontWeight: 600}}>{t('drawer.editTabs')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('drawer.editTabsHint', {count: PINNABLE_TAB_LIMIT})}</Typography>
            </Box>
            <List dense sx={{overflowY: 'auto', flex: '1 1 auto', minHeight: 0, px: 1}}>
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
                            {menuItem.Icon && <ListItemIcon sx={{minWidth: 40}}><menuItem.Icon /></ListItemIcon>}
                            <ListItemText primary={<label htmlFor={switchId}>{label}</label>} />
                        </ListItem>
                    );
                })}
            </List>
            <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, px: 2, py: 1.5, flexShrink: 0}}>
                <Button onClick={onReset}>{t('drawer.resetTabs')}</Button>
                <Button variant="contained" onClick={() => onDone(chosenInMenuOrder())}>{t('drawer.doneEditing')}</Button>
            </Box>
        </Box>
    );
}
