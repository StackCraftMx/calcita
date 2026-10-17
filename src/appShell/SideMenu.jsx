// Lo de adentro del menú lateral (el fijo de escritorio y el cajón del teléfono): arriba el logo y el nombre de la app
// (solo en el cajón del teléfono: en escritorio van en la barra), en medio las secciones del menú (composeMenu, con el
// título de cada sección) y abajo lo que el proyecto quiera (sidebarFooter: una tarjeta de ayuda, el plan contratado…).
//
// Es una columna de toda la altura: el menú crece y se desliza solo, y el pie se queda abajo.
// Encogido (solo íconos): el título de cada sección se vuelve una rayita del mismo alto (los huecos entre secciones se
// quedan parejos y nada brinca al abrirlo), el pie se quita (escondido seguía ocupando su lugar y sacaba la barra de
// desplazamiento). La barra de desplazamiento no se pinta nunca: se comía el ancho de los nombres (la rueda sigue).
// Con el vidrio del tema, los títulos de sección van como se escriben («Operación») y no en mayúsculas: la guía de Liquid
// Glass de Apple los dejó de poner en mayúsculas porque se leen mejor.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useRef, useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';

import {menuItemLabelOf, menuSectionsOf} from '@/appShell/menuItemText.js';
import {APP_BAR_HEIGHT_PIXELS} from '@/appShell/shellSizes.js';
import SideMenuEntry from '@/appShell/SideMenuEntry.jsx';
import {glassStylesOf, isGlassTheme} from '@/theme/glassSurface.js';

// lo alto del desvanecido en la orilla del menú que tiene más (px)
const SCROLL_FADE_PIXELS = 28;
// el estilo minimalista del tema (THEME_LOOK.minimal; se repite el texto para no importar el tema desde el menú)
const MINIMAL_LOOK = 'minimal';
// la flecha: a cuánto de la orilla va y cuánto se repite al deslizar un tramo (px)
const SCROLL_ARROW_INSET_PIXELS = 4;
const SCROLL_STEP_OVERLAP_PIXELS = 44;

/** La flecha de una orilla del menú: un botoncito de vidrio centrado que lo desliza un tramo. */
function ScrollArrow({label, onClick, sx, children}) {
    return (
        <Tooltip title={label} placement="right">
            <IconButton size="small" aria-label={label} onClick={onClick}
                        sx={[(theme) => ({
                            position: 'absolute', left: '50%', transform: 'translateX(-50%)', zIndex: 1, width: 32, height: 24, borderRadius: '999px',
                            ...(isGlassTheme(theme) ? glassStylesOf(theme, {isControl: true}) : {bgcolor: 'background.paper', boxShadow: 2}),
                        }), sx]}>
                {children}
            </IconButton>
        </Tooltip>
    );
}

// el logo de 28 px queda centrado en el menú encogido de 64 px: (64 - 28) / 2
const BRAND_LEFT_PADDING = '18px';
// la letra del título de sección (rem): en mayúsculas, más chica; con vidrio, como se escribe, un poco más grande. Con
// alto de renglón 2, la mitad del renglón mide lo mismo que la letra: ahí va la rayita del encogido
const SECTION_TITLE_FONT_REM = Object.freeze({solid: 0.6875, glass: 0.75});

/**
 * @param {object} props
 * @param {import('react').ReactNode} [props.logo] el logo chico (28 px), el que se queda con el menú encogido
 * @param {string} props.brandName el nombre de la app
 * @param {string} [props.brandCaption] el renglón chico debajo del nombre («Panel de administración»)
 * @param {string} props.homePath
 * @param {object[]} props.menuItems lo que regresa composeMenu
 * @param {object|null} props.activeItem
 * @param {boolean} props.collapsed
 * @param {import('react').ReactNode} [props.footer]
 * @param {boolean} [props.showBrand] el logo y el nombre arriba; por omisión sí (en escritorio van en la barra)
 * @param {() => void} [props.onNavigate]
 * @param {Record<string, number>} [props.menuBadges] los conteos del servidor por badgeKey
 * @param {import('react').ReactNode} [props.railTop] arriba del menú encogido que hace de barra: la ☰ y el logo
 * @param {import('react').ReactNode} [props.railBottom] abajo de ese menú: los ajustes y la cuenta
 */
export default function SideMenu({
    logo, brandName, brandCaption, homePath, menuItems, activeItem, collapsed, footer, showBrand = true, onNavigate, railTop, railBottom, menuBadges,
}) {
    const {t} = useToolkitTranslation('layout');
    const {Link: RouterLink} = useToolkitNavigation();
    const theme = useTheme();
    // con vidrio y con el minimalista (los dos siguen a Apple) los títulos de sección van como se escriben, no en mayúsculas
    const isAppleStyle = isGlassTheme(theme) || theme.toolkit?.look === MINIMAL_LOOK;
    const sectionTitleFontRem = isAppleStyle ? SECTION_TITLE_FONT_REM.glass : SECTION_TITLE_FONT_REM.solid;
    const fadeWhenCollapsed = (theme) => ({opacity: collapsed ? 0 : 1, transition: theme.transitions.create('opacity')});
    // el menú no lleva barra de desplazamiento (ver abajo): cuando no cabe, se desvanece en la orilla de donde hay más, para
    // que se entienda que se desliza (lo reportaron: «no se entiende que scrollea»)
    const listRef = useRef(null);
    const [hiddenEdges, setHiddenEdges] = useState({top: false, bottom: false});
    useEffect(() => {
        const list = listRef.current;
        if (!list) {
            return undefined;
        }
        const measure = () => setHiddenEdges({
            top: list.scrollTop > 1,
            bottom: list.scrollTop + list.clientHeight < list.scrollHeight - 1,
        });
        measure();
        list.addEventListener('scroll', measure, {passive: true});
        const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
        resizeObserver?.observe(list);
        return () => {
            list.removeEventListener('scroll', measure);
            resizeObserver?.disconnect();
        };
    }, [menuItems, collapsed]);
    // la flecha desliza el menú lo que mide su parte visible, menos un renglón para no perder de vista dónde se iba
    const scrollMenu = (direction) => listRef.current?.scrollBy({top: direction * (listRef.current.clientHeight - SCROLL_STEP_OVERLAP_PIXELS), behavior: 'smooth'});
    const fadeMask = `linear-gradient(to bottom, ${hiddenEdges.top ? 'transparent' : 'black'}, black ${SCROLL_FADE_PIXELS}px, black calc(100% - ${SCROLL_FADE_PIXELS}px), ${hiddenEdges.bottom ? 'transparent' : 'black'})`;

    return (
        // OJO: flex y no height 100%: dentro de la hoja de «Más» (que solo tiene alto máximo) un 100 % no se resuelve, el menú
        // crecía sin límite y la hoja no se deslizaba (lo reportaron con el teléfono acostado)
        <Box sx={{display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0}}>
            {showBrand && (
                <>
                    <ButtonBase component={RouterLink} to={homePath} onClick={onNavigate} aria-label={brandName}
                                sx={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1.25, minHeight: APP_BAR_HEIGHT_PIXELS,
                                     pl: BRAND_LEFT_PADDING, pr: 2, flexShrink: 0}}>
                        <Box sx={{width: 28, height: 28, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{logo}</Box>
                        <Box sx={(theme) => ({minWidth: 0, textAlign: 'left', ...fadeWhenCollapsed(theme)})}>
                            <Typography variant="subtitle2" component="span" noWrap sx={{display: 'block', fontWeight: 600, lineHeight: 1.3}}>{brandName}</Typography>
                            {brandCaption && <Typography variant="caption" component="span" color="text.secondary" noWrap sx={{display: 'block', lineHeight: 1.3}}>{brandCaption}</Typography>}
                        </Box>
                    </ButtonBase>
                    <Divider />
                </>
            )}

            {railTop && <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, pt: 1.25, pb: 0.5, flexShrink: 0}}>{railTop}</Box>}

            {/* la lista y sus flechas: cuando no cabe, una flecha en la orilla de donde hay más (como los menús largos de la Mac)
                que la desliza un tramo; el desvanecido la refuerza. Sin barra de desplazamiento no se entendía que había más */}
            <Box sx={{position: 'relative', flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
                <List ref={listRef} component="nav" aria-label={t('drawer.ariaLabel')} dense disablePadding
                      sx={{
                          px: 1, pt: 1, pb: 2, flexGrow: 1, minHeight: 0, height: '100%', overflowY: 'auto', overflowX: 'hidden',
                          // sin barra de desplazamiento, abierto o encogido (se desliza igual con la rueda, el trackpad o el
                          // teclado, como en la Mac, donde la barra solo sale al deslizar): a la vista se veía una raya junto a
                          // los nombres, y aunque fuera transparente se comía su ancho y cortaba «Alta con react-hook-form»
                          scrollbarWidth: 'none',
                          maskImage: fadeMask,
                          WebkitMaskImage: fadeMask,
                          '&::-webkit-scrollbar': {display: 'none'},
                      }}>
                    {menuSectionsOf(menuItems, t).map((section, sectionIndex) => (
                        <Box component="li" key={section.title ?? `section-${sectionIndex}`} sx={{listStyle: 'none'}}>
                            <List dense disablePadding
                                  subheader={section.title ? (
                                      <ListSubheader disableSticky component="div"
                                                     sx={(theme) => ({position: 'relative', bgcolor: 'transparent', px: 1.5, pt: 1.5, lineHeight: 2, fontSize: `${sectionTitleFontRem}rem`,
                                                                      fontWeight: 600, letterSpacing: isAppleStyle ? 0 : '0.08em', textTransform: isAppleStyle ? 'none' : 'uppercase',
                                                                      color: 'text.secondary', whiteSpace: 'nowrap',
                                                                      // encogido: en lugar del título, una rayita a media altura del renglón
                                                                      '&::after': {
                                                                          content: '""', position: 'absolute', left: '25%', right: '25%', height: '1px',
                                                                          top: `calc(${theme.spacing(1.5)} + ${sectionTitleFontRem}rem)`, bgcolor: 'divider',
                                                                          opacity: collapsed ? 1 : 0, transition: theme.transitions.create('opacity'),
                                                                      }})}>
                                          <Box component="span" sx={fadeWhenCollapsed}>{section.title}</Box>
                                      </ListSubheader>
                                  ) : null}>
                                {section.menuItems.map((menuItem) => (
                                    <SideMenuEntry key={menuItem.to ?? menuItemLabelOf(menuItem, t)} menuItem={menuItem} activeItem={activeItem} collapsed={collapsed}
                                                   onNavigate={onNavigate} menuBadges={menuBadges} />
                                ))}
                            </List>
                        </Box>
                    ))}
                    {/* la tarjeta de abajo va al final de lo que se desliza, no fija: en una pantalla baja (el teléfono acostado) se
                        comía el menú y solo se veía «Inicio» (lo reportaron) */}
                    {footer && (
                        <Box component="li" sx={{listStyle: 'none', pt: 2, px: 0.5, display: collapsed ? 'none' : 'block'}}>{footer}</Box>
                    )}
                </List>
                {hiddenEdges.top && (
                    <ScrollArrow label={t('drawer.scrollUp')} onClick={() => scrollMenu(-1)} sx={{top: SCROLL_ARROW_INSET_PIXELS}}>
                        <KeyboardArrowUpRoundedIcon fontSize="small" />
                    </ScrollArrow>
                )}
                {hiddenEdges.bottom && (
                    <ScrollArrow label={t('drawer.scrollDown')} onClick={() => scrollMenu(1)} sx={{bottom: SCROLL_ARROW_INSET_PIXELS}}>
                        <KeyboardArrowDownRoundedIcon fontSize="small" />
                    </ScrollArrow>
                )}
            </Box>

            {railBottom && <Box sx={{display: 'flex', justifyContent: 'center', pt: 1, pb: 1.25, flexShrink: 0, borderTop: 1, borderColor: 'divider'}}>{railBottom}</Box>}
        </Box>
    );
}
