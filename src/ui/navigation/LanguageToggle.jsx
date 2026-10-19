// El botón de idioma de la barra y de las pantallas de entrada.
//
// Los idiomas son los que ofrece la app (ToolkitProvider `languages`; por omisión español e inglés):
//   - con dos, un botón que cambia al otro (dice su código: «EN»);
//   - con tres o más, el botón dice el de ahora y abre un menú con cada uno en su propio idioma («Português»), como lo busca
//     quien lo habla; el elegido con su palomita.
//
// Solo avisa el idioma nuevo (onLanguageChange de ToolkitProvider). Lo demás lo hace el proyecto: su i18n, el header
// Accept-Language de las peticiones y volver a pedir los datos del servidor, que traen textos traducidos. Las traducciones de
// un idioma que agregue el proyecto van en `texts` de ToolkitProvider: el paquete solo trae español e inglés.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaLanguageToggle con defaultProps y
// styleOverrides de sus partes: button.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {DEFAULT_LANGUAGES} from '@/toolkit/toolkitSettings.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaLanguageToggle)
const THEME_NAME = 'CalcitaLanguageToggle';
const LanguageButton = piecePart(THEME_NAME, 'Button', Button);

/** Los idiomas que traen los textos del paquete. */
export const LANGUAGES = Object.freeze(DEFAULT_LANGUAGES.map((entry) => entry.code));

/**
 * @param {object} [props]
 * @param {boolean} [props.inverted] texto blanco para fondos oscuros
 * @param {(language: string) => void} [props.onChange] además de avisar a ToolkitProvider, cada que se elige un idioma
 * @param {object} [props.texts] los textos que cambian, con la forma de `common`: {language: {switchToNamed, choose}}
 */
export default function LanguageToggle(props) {
    // lo que el proyecto puso en su tema (components.CalcitaLanguageToggle.defaultProps) y encima lo que llega aquí
    const {inverted = false, onChange, texts} = usePieceProps(props, THEME_NAME);
    const {t, language, changeLanguage} = useToolkitTranslation('common', texts);
    const {languages = DEFAULT_LANGUAGES} = useToolkitSettings();
    const [menuAnchor, setMenuAnchor] = useState(null);
    const current = languages.find((entry) => entry.code === language) ?? languages[0];
    const buttonSx = {minWidth: 0, fontWeight: 700, letterSpacing: '0.08em', color: inverted ? 'common.white' : 'text.secondary'};

    const choose = (code) => {
        setMenuAnchor(null);
        changeLanguage(code);
        onChange?.(code);
    };

    // con dos: un botón que cambia al otro
    if (languages.length <= 2) {
        const next = languages.find((entry) => entry.code !== current.code) ?? current;
        // el aviso de siempre para español e inglés; para otro idioma, con su nombre
        const ariaLabel = t(`language.switchTo.${next.code}`, {defaultValue: t('language.switchToNamed', {name: next.label})});
        return (
            <LanguageButton size="small" variant="text" onClick={() => choose(next.code)} lang={next.code} aria-label={ariaLabel} ownSx={buttonSx}>
                {next.code.toUpperCase()}
            </LanguageButton>
        );
    }

    // con tres o más: el de ahora y un menú con todos
    return (
        <>
            <LanguageButton size="small" variant="text" onClick={(event) => setMenuAnchor(event.currentTarget)} aria-haspopup="menu"
                    aria-expanded={Boolean(menuAnchor)} aria-label={t('language.choose', {name: current.label})} ownSx={buttonSx}>
                {current.code.toUpperCase()}
            </LanguageButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                {languages.map((entry) => (
                    <MenuItem key={entry.code} lang={entry.code} selected={entry.code === current.code} onClick={() => choose(entry.code)}>
                        {entry.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
