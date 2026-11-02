// La barra del editor de texto: estilo (texto, título, subtítulo), negrita, cursiva, subrayado y tachado, listas, cita,
// código, liga, alineación, quitar el formato y deshacer o rehacer. Solo trae los botones que se piden (features) y cada uno
// dice si está puesto (aria-pressed) y su nombre al pasar el cursor.
//
// OJO: los botones no se llevan el foco al picarlos (onMouseDown sin acción): si se lo llevaran, el texto elegido se
// perdería antes de darle formato.
//
// Genérico del paquete: function (regla de la casa).
import {useRef, useState} from 'react';
import {useEditorState} from '@tiptap/react';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import CodeIcon from '@mui/icons-material/Code';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatClearIcon from '@mui/icons-material/FormatClear';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';

import {RICH_TEXT_HEADING_LEVELS} from '@/richText/richTextExtensions.js';
import RichTextLinkPopover from '@/richText/RichTextLinkPopover.jsx';
import {RICH_TEXT_FEATURE} from '@/richText/richTextRules.js';

// el estilo del renglón: texto normal o uno de los títulos
const PARAGRAPH_STYLE = 'paragraph';
const headingStyleOf = (level) => `heading${level}`;
const TEXT_ALIGNMENTS = Object.freeze([
    {value: 'left', Icon: FormatAlignLeftIcon},
    {value: 'center', Icon: FormatAlignCenterIcon},
    {value: 'right', Icon: FormatAlignRightIcon},
]);
// las marcas que se ponen y se quitan con un botón
const MARK_BUTTONS = Object.freeze([
    {feature: RICH_TEXT_FEATURE.bold, mark: 'bold', Icon: FormatBoldIcon, toggle: (chain) => chain.toggleBold()},
    {feature: RICH_TEXT_FEATURE.italic, mark: 'italic', Icon: FormatItalicIcon, toggle: (chain) => chain.toggleItalic()},
    {feature: RICH_TEXT_FEATURE.underline, mark: 'underline', Icon: FormatUnderlinedIcon, toggle: (chain) => chain.toggleUnderline()},
    {feature: RICH_TEXT_FEATURE.strike, mark: 'strike', Icon: FormatStrikethroughIcon, toggle: (chain) => chain.toggleStrike()},
]);
// los bloques que se ponen y se quitan con un botón
const BLOCK_BUTTONS = Object.freeze([
    {feature: RICH_TEXT_FEATURE.bulletList, node: 'bulletList', Icon: FormatListBulletedIcon, toggle: (chain) => chain.toggleBulletList()},
    {feature: RICH_TEXT_FEATURE.orderedList, node: 'orderedList', Icon: FormatListNumberedIcon, toggle: (chain) => chain.toggleOrderedList()},
    {feature: RICH_TEXT_FEATURE.blockquote, node: 'blockquote', Icon: FormatQuoteIcon, toggle: (chain) => chain.toggleBlockquote()},
    {feature: RICH_TEXT_FEATURE.codeBlock, node: 'codeBlock', Icon: CodeIcon, toggle: (chain) => chain.toggleCodeBlock()},
]);

/**
 * Un botón de la barra: no se lleva el foco, dice si está puesto y su nombre.
 *
 * @param {{label: string, isActive?: boolean, disabled?: boolean, onClick: (event: object) => void, children: import('react').ReactNode}} props
 */
function ToolbarButton({label, isActive, disabled, onClick, children}) {
    return (
        <Tooltip title={label}>
            <span>
                <IconButton size="small" aria-label={label} aria-pressed={isActive ?? undefined} disabled={disabled} color={isActive ? 'primary' : 'default'}
                            onMouseDown={(event) => event.preventDefault()} onClick={onClick}
                            sx={isActive ? {bgcolor: 'action.selected'} : undefined}>
                    {children}
                </IconButton>
            </span>
        </Tooltip>
    );
}

/**
 * @param {object} props
 * @param {import('@tiptap/react').Editor|null} props.editor
 * @param {string[]} props.features
 * @param {boolean} props.disabled
 * @param {(key: string, values?: object) => string} props.t el traductor del editor (namespace richText)
 * @param {import('react').ReactNode} [props.actions] botones del proyecto al final de la barra
 */
export default function RichTextToolbar({editor, features, disabled, t, actions}) {
    const [linkAnchor, setLinkAnchor] = useState(null);
    const linkButtonRef = useRef(null);
    const has = (feature) => features.includes(feature);
    // lo que está puesto donde está el cursor: la barra se pinta otra vez solo cuando eso cambia
    const state = useEditorState({
        editor,
        selector: ({editor: current}) => {
            if (!current) {
                return null;
            }
            const headingLevel = RICH_TEXT_HEADING_LEVELS.find((level) => current.isActive('heading', {level}));
            return {
                marks: Object.fromEntries(MARK_BUTTONS.filter(({feature}) => has(feature)).map(({mark}) => [mark, current.isActive(mark)])),
                blocks: Object.fromEntries(BLOCK_BUTTONS.filter(({feature}) => has(feature)).map(({node}) => [node, current.isActive(node)])),
                textStyle: headingLevel ? headingStyleOf(headingLevel) : PARAGRAPH_STYLE,
                alignment: TEXT_ALIGNMENTS.find(({value}) => current.isActive({textAlign: value}))?.value ?? TEXT_ALIGNMENTS[0].value,
                isLink: has(RICH_TEXT_FEATURE.link) && current.isActive('link'),
                linkHref: has(RICH_TEXT_FEATURE.link) ? current.getAttributes('link').href ?? '' : '',
                canUndo: has(RICH_TEXT_FEATURE.history) && current.can().undo(),
                canRedo: has(RICH_TEXT_FEATURE.history) && current.can().redo(),
            };
        },
    });

    if (!editor || !state) {
        return null;
    }
    const chain = () => editor.chain().focus();
    const isDisabled = disabled || !editor.isEditable;

    return (
        <>
            {has(RICH_TEXT_FEATURE.textStyle) && (
                <Select size="small" variant="standard" disableUnderline value={state.textStyle} disabled={isDisabled}
                        inputProps={{'aria-label': t('toolbar.textStyle')}} sx={{minWidth: 110, mx: 0.5, fontSize: 14}}
                        onChange={(event) => {
                            const style = event.target.value;
                            const level = RICH_TEXT_HEADING_LEVELS.find((candidate) => headingStyleOf(candidate) === style);
                            (level ? chain().setHeading({level}) : chain().setParagraph()).run();
                        }}>
                    <MenuItem value={PARAGRAPH_STYLE}>{t('toolbar.paragraph')}</MenuItem>
                    {RICH_TEXT_HEADING_LEVELS.map((level) => (
                        <MenuItem key={level} value={headingStyleOf(level)}>{t(`toolbar.${headingStyleOf(level)}`)}</MenuItem>
                    ))}
                </Select>
            )}
            {MARK_BUTTONS.filter(({feature}) => has(feature)).map(({feature, mark, Icon, toggle}) => (
                <ToolbarButton key={feature} label={t(`toolbar.${feature}`)} isActive={state.marks[mark]} disabled={isDisabled}
                               onClick={() => toggle(chain()).run()}>
                    <Icon fontSize="small" />
                </ToolbarButton>
            ))}
            <Divider orientation="vertical" flexItem sx={{mx: 0.5}} />
            {BLOCK_BUTTONS.filter(({feature}) => has(feature)).map(({feature, node, Icon, toggle}) => (
                <ToolbarButton key={feature} label={t(`toolbar.${feature}`)} isActive={state.blocks[node]} disabled={isDisabled}
                               onClick={() => toggle(chain()).run()}>
                    <Icon fontSize="small" />
                </ToolbarButton>
            ))}
            {has(RICH_TEXT_FEATURE.link) && (
                <span ref={linkButtonRef}>
                    <ToolbarButton label={t('toolbar.link')} isActive={state.isLink} disabled={isDisabled}
                                   onClick={() => setLinkAnchor(linkButtonRef.current)}>
                        <InsertLinkIcon fontSize="small" />
                    </ToolbarButton>
                </span>
            )}
            {has(RICH_TEXT_FEATURE.align) && (
                <>
                    <Divider orientation="vertical" flexItem sx={{mx: 0.5}} />
                    {TEXT_ALIGNMENTS.map(({value, Icon}) => (
                        <ToolbarButton key={value} label={t(`toolbar.align.${value}`)} isActive={state.alignment === value} disabled={isDisabled}
                                       onClick={() => chain().setTextAlign(value).run()}>
                            <Icon fontSize="small" />
                        </ToolbarButton>
                    ))}
                </>
            )}
            {has(RICH_TEXT_FEATURE.clear) && (
                <ToolbarButton label={t('toolbar.clear')} disabled={isDisabled} onClick={() => chain().unsetAllMarks().clearNodes().run()}>
                    <FormatClearIcon fontSize="small" />
                </ToolbarButton>
            )}
            {has(RICH_TEXT_FEATURE.history) && (
                <>
                    <Divider orientation="vertical" flexItem sx={{mx: 0.5}} />
                    <ToolbarButton label={t('toolbar.undo')} disabled={isDisabled || !state.canUndo} onClick={() => chain().undo().run()}>
                        <UndoIcon fontSize="small" />
                    </ToolbarButton>
                    <ToolbarButton label={t('toolbar.redo')} disabled={isDisabled || !state.canRedo} onClick={() => chain().redo().run()}>
                        <RedoIcon fontSize="small" />
                    </ToolbarButton>
                </>
            )}
            {actions}
            {linkAnchor && (
                <RichTextLinkPopover anchorElement={linkAnchor} initialUrl={state.linkHref} t={t}
                                     onClose={() => setLinkAnchor(null)}
                                     onSave={(url) => {
                                         chain().extendMarkRange('link').setLink({href: url}).run();
                                         setLinkAnchor(null);
                                     }}
                                     onRemove={() => {
                                         chain().extendMarkRange('link').unsetLink().run();
                                         setLinkAnchor(null);
                                     }} />
            )}
        </>
    );
}
