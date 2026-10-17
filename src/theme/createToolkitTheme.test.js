// Pruebas del tema del framework con y sin vidrio. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {createToolkitTheme} from '@/theme/createToolkitTheme.js';
import {GLASS_INSET_PIXELS, GLASS_OPACITY, GLASS_PANEL_RADIUS_PIXELS, glassOpacityOf, isGlassTheme} from '@/theme/glassSurface.js';

test('sin vidrio el tema no lo anota y los componentes del framework pintan sólido', () => {
    const theme = createToolkitTheme();

    assert.equal(isGlassTheme(theme), false);
    assert.equal(theme.components.MuiDialog, undefined);
});

test('con glass: true el tema lo anota con la opacidad de omisión y suma los ajustes de vidrio', () => {
    const theme = createToolkitTheme({glass: true});

    assert.equal(isGlassTheme(theme), true);
    assert.equal(glassOpacityOf(theme), GLASS_OPACITY);
    ['MuiDialog', 'MuiTooltip', 'MuiTabs', 'MuiToggleButtonGroup', 'MuiFab', 'MuiPickerPopper'].forEach((componentName) => {
        assert.ok(theme.components[componentName], `falta ${componentName}`);
    });
});

test('la opacidad que pide el proyecto llega a las superficies', () => {
    const theme = createToolkitTheme({glass: {opacity: 0.7}});
    const paper = theme.components.MuiPopover.styleOverrides.paper({theme, ownerState: {}});

    assert.equal(glassOpacityOf(theme), 0.7);
    assert.match(paper.backgroundColor, / 70%, transparent\)$/);
});

test('una opacidad fuera de 0 a 1 truena con su motivo (un 80 en lugar de 0.8 dejaba la barra sin fondo)', () => {
    assert.throws(() => createToolkitTheme({glass: {opacity: 80}}), /va de 0 a 1/);
});

test('los ajustes de vidrio se suman a los normales: la barra fija es vidrio neutro y cambia su línea por el brillo', () => {
    const theme = createToolkitTheme({glass: true});
    const appBar = theme.components.MuiAppBar.styleOverrides.root({theme, ownerState: {position: 'sticky', color: 'primary'}});

    // un vidrio naranja al 80 % se veía sólido: la barra es del color de las tarjetas, con letra oscura, como el menú lateral
    assert.equal(appBar.color, theme.vars.palette.text.primary);
    assert.match(appBar.backgroundColor, new RegExp(`^color-mix\\(in srgb, ${theme.vars.palette.background.paper.replace(/[()]/g, '\\$&')} 60%`));
    assert.equal(appBar.borderBottom, 'none');
    assert.match(appBar.backdropFilter, /blur\(20px\)/);
});

test('un diálogo a pantalla completa se queda sólido: es para leer', () => {
    const theme = createToolkitTheme({glass: true});
    const fullScreenPaper = theme.components.MuiDialog.styleOverrides.paper({theme, ownerState: {fullScreen: true}});

    assert.deepEqual(fullScreenPaper, {});
});

test('las tarjetas del contenido se quedan sólidas salvo que el proyecto pida glass: {surfaces: true}', () => {
    const floatingOnly = createToolkitTheme({glass: true});
    const withSurfaces = createToolkitTheme({glass: {surfaces: true}});
    const outlinedCard = withSurfaces.components.MuiPaper.styleOverrides.root({theme: withSurfaces, ownerState: {variant: 'outlined'}});
    const elevatedPaper = withSurfaces.components.MuiPaper.styleOverrides.root({theme: withSurfaces, ownerState: {variant: 'elevation'}});

    assert.equal(floatingOnly.components.MuiPaper, undefined);
    assert.equal(withSurfaces.toolkit.glass.surfaces, true);
    assert.match(outlinedCard.backdropFilter, /blur\(20px\)/);
    assert.equal(outlinedCard.borderColor, 'transparent');
    assert.deepEqual(elevatedPaper, {});
});

test('con glass: {surfaces: true} el contenido lleva material: esmerilado, sin el brillo del borde de los controles (HIG Materials)', () => {
    const theme = createToolkitTheme({glass: {surfaces: true}});
    const card = theme.components.MuiCard.styleOverrides.root({theme, ownerState: {}});
    const popover = theme.components.MuiPopover.styleOverrides.paper({theme, ownerState: {}});

    assert.match(card.backdropFilter, /blur\(20px\)/);
    assert.equal(card.backgroundImage, 'none');
    assert.doesNotMatch(card.boxShadow, /inset/);
    // lo que flota sí lleva el brillo del vidrio
    assert.match(popover.boxShadow, /^inset/);
    // material delgado: menos opaco que el vidrio (0.6 - 0.15): las tarjetas dejan pasar el color de atrás
    assert.match(card.backgroundColor, / 45%, transparent\)$/);
});

test('con vidrio, los títulos chicos en mayúsculas (overline) van como se escriben', () => {
    const theme = createToolkitTheme({glass: true});
    const overline = theme.components.MuiTypography.styleOverrides.overline({theme, ownerState: {variant: 'overline'}});

    assert.equal(overline.textTransform, 'none');
    // en tipo oración, sin el espaciado de las versalitas: el de Apple para su tamaño (13 px)
    assert.equal(overline.letterSpacing, '-0.006em');
});

test('el grupo de botones con borde es una sola cápsula de vidrio y sus botones no llevan vidrio propio', () => {
    const theme = createToolkitTheme({glass: true});
    const {root, grouped} = theme.components.MuiButtonGroup.styleOverrides;
    const groupRoot = root({theme, ownerState: {variant: 'outlined'}});
    const button = grouped({theme, ownerState: {variant: 'outlined', orientation: 'horizontal'}});

    assert.match(groupRoot.backdropFilter, /blur/);
    assert.equal(button.backdropFilter, 'none');
    assert.equal(button.boxShadow, 'none');
});

test('los cajones que salen encima flotan separados de la orilla; el fijo del menú lateral no', () => {
    const theme = createToolkitTheme({glass: true});
    const paperOf = (ownerState) => theme.components.MuiDrawer.styleOverrides.paper({theme, ownerState});
    const bottomSheet = paperOf({variant: 'temporary', anchor: 'bottom'});
    const permanent = paperOf({variant: 'permanent', anchor: 'left'});

    assert.equal(bottomSheet.bottom, `${GLASS_INSET_PIXELS}px`);
    assert.equal(bottomSheet.borderRadius, GLASS_PANEL_RADIUS_PIXELS);
    assert.equal(permanent.bottom, undefined);
});

test('el renglón elegido de un menú lleva palomita en lugar de fondo de color, y con el teclado encima sí se marca', () => {
    const theme = createToolkitTheme({glass: true});
    const menuItem = theme.components.MuiMenuItem.styleOverrides.root({theme, ownerState: {}});

    assert.match(menuItem['&.Mui-selected::after'].content, /✓/);
    assert.equal(menuItem['&.Mui-selected'].backgroundColor, 'transparent');
    assert.notEqual(menuItem['&.Mui-selected.Mui-focusVisible, &.Mui-selected:focus-visible'].backgroundColor, 'transparent');
});

test('con vidrio, el «cargando» es la ruedita de iPhone (rayitas a saltos) y el que dice cuánto falta conserva su anillo', () => {
    const theme = createToolkitTheme({glass: true});
    const rootOf = (variant) => theme.components.MuiCircularProgress.styleOverrides.root({theme, ownerState: {variant}});
    const spinner = rootOf('indeterminate');

    assert.match(spinner.maskImage, /^url\("data:image\/svg\+xml,/);
    assert.equal(spinner.animationTimingFunction, 'steps(8)');
    assert.deepEqual(rootOf('determinate'), {});
    assert.equal(theme.components.MuiCircularProgress.defaultProps.enableTrackSlot, true);
});

test('un control chico de vidrio (el botón con borde) lleva sombra corta, no la de un panel', () => {
    const theme = createToolkitTheme({glass: true});
    const outlined = theme.components.MuiButton.styleOverrides.outlined({theme, ownerState: {color: 'primary'}});
    const popover = theme.components.MuiPopover.styleOverrides.paper({theme, ownerState: {}});

    // la sombra del panel (la de la ventanita, 0 6px 20px) no está en el botón: él lleva la corta
    assert.match(popover.boxShadow, /0 6px 20px/);
    assert.doesNotMatch(outlined.boxShadow, /0 6px 20px/);
});

test('el interruptor tiene la forma del de iPhone: la perilla adentro de la pista, también el chico', () => {
    const theme = createToolkitTheme({glass: true});
    const rootOf = (size) => theme.components.MuiSwitch.styleOverrides.root({theme, ownerState: {size}});

    // la perilla recorre lo ancho de la pista menos ella misma y sus márgenes: 46 - 24 - 4 y 36 - 18 - 4
    assert.equal(rootOf('medium')['& .MuiSwitch-switchBase.Mui-checked'].transform, 'translateX(18px)');
    assert.equal(rootOf('small')['& .MuiSwitch-switchBase.Mui-checked'].transform, 'translateX(14px)');
});

test('dentro de una tarjeta, el botón con borde es el «bordered» de Apple (relleno tenue) y no vidrio', () => {
    const theme = createToolkitTheme({glass: true});
    const outlined = theme.components.MuiButton.styleOverrides.outlined({theme, ownerState: {color: 'error'}});
    const insideCard = outlined['.MuiPaper-root &:not(.MuiButtonGroup-grouped), body[data-glass-lens="on"] .MuiPaper-root &:not(.MuiButtonGroup-grouped)'];

    assert.match(outlined.backdropFilter, /blur/);
    assert.equal(insideCard.backdropFilter, 'none');
    assert.match(insideCard.backgroundColor, /^color-mix\(in srgb, .* 12%, transparent\)$/);
});

test('los campos: etiqueta arriba siempre a la vista, cápsula de vidrio sobre el lienzo y relleno gris dentro de una tarjeta', () => {
    const theme = createToolkitTheme({glass: true});
    const label = theme.components.MuiInputLabel.styleOverrides.root({theme, ownerState: {variant: 'outlined'}});
    const field = theme.components.MuiOutlinedInput.styleOverrides.root({theme, ownerState: {multiline: false}});

    assert.equal(theme.components.MuiInputLabel.defaultProps.shrink, true);
    assert.equal(label.position, 'relative');
    assert.match(field.backdropFilter, /blur/);
    assert.equal(field['.MuiPaper-root &, body[data-glass-lens="on"] .MuiPaper-root &'].backdropFilter, 'none');
    assert.match(field['&.Mui-focused'].outline, /^3px solid/);
});

test('un botón con relleno de color lleva la letra de un solo color, no la de su tinte (reporte: «el naranja se pierde»)', () => {
    const theme = createToolkitTheme({glass: true});
    const outlined = theme.components.MuiButton.styleOverrides.outlined({theme, ownerState: {color: 'error'}});
    const insideCard = outlined['.MuiPaper-root &:not(.MuiButtonGroup-grouped), body[data-glass-lens="on"] .MuiPaper-root &:not(.MuiButtonGroup-grouped)'];
    const textButton = theme.components.MuiButton.styleOverrides.text({theme, ownerState: {color: 'primary'}});

    assert.equal(insideCard.color, theme.vars.palette.text.primary);
    assert.match(insideCard.backgroundColor, /error/);
    assert.match(textButton.color, /70%, black\)$/);
});

test('lo elegido en oscuro conserva su fondo de oscuro aunque lleve la letra del color del tema (no se pisan)', () => {
    const theme = createToolkitTheme({glass: true});
    const action = theme.components.MuiBottomNavigationAction.styleOverrides.root({theme});
    const listButton = theme.components.MuiListItemButton.styleOverrides.root({theme, ownerState: {}});
    const darkKeyOf = (styles) => Object.keys(styles).find((key) => key.includes('dark'));
    const selected = action['&.Mui-selected'];
    const darkSelected = selected[darkKeyOf(selected)];

    // antes la parte oscura de la letra borraba la de la gota y el elegido salía con el fondo de claro
    assert.match(darkSelected.backgroundColor, /white[^)]*\) 18%, transparent\)$/);
    assert.match(darkSelected.color, /70%, white\)$/);
    assert.ok(listButton);
});

test('el estilo minimalista: superficies por su tono, sin sombras, sin vidrio y el botón con borde tonal', () => {
    const theme = createToolkitTheme({look: 'minimal', glass: true});
    const outlined = theme.components.MuiButton.styleOverrides.outlined({theme, ownerState: {color: 'primary'}});

    assert.equal(theme.toolkit.look, 'minimal');
    assert.equal(theme.toolkit.glass, null);
    assert.equal(theme.colorSchemes.light.palette.background.default, '#F2F2F7');
    assert.equal(theme.colorSchemes.dark.palette.background.paper, '#1C1C1E');
    assert.ok(theme.shadows.every((shadow) => shadow === 'none'));
    assert.equal(outlined.border, 0);
    assert.match(outlined.backgroundColor, /14%, transparent\)$/);
});
