// La ventanita para poner o cambiar la liga del texto elegido: la dirección (solo https, http, mailto o tel; un dominio suelto
// se completa con https://), «Poner la liga» y «Quitar». Una dirección que no se acepta se dice en su campo.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';

import TextInput from '@/inputs/TextInput.jsx';
import {linkUrlOf} from '@/richText/richTextRules.js';

/**
 * @param {object} props
 * @param {HTMLElement|null} props.anchorElement el botón de la liga (null: cerrada)
 * @param {string} props.initialUrl la liga que ya tiene el texto ('' si no tiene)
 * @param {(url: string) => void} props.onSave recibe la dirección ya revisada
 * @param {() => void} props.onRemove
 * @param {() => void} props.onClose
 * @param {(key: string) => string} props.t el traductor del editor
 */
export default function RichTextLinkPopover({anchorElement, initialUrl, onSave, onRemove, onClose, t}) {
    const [typedUrl, setTypedUrl] = useState(initialUrl);
    const [isRejected, setIsRejected] = useState(false);

    const save = () => {
        const url = linkUrlOf(typedUrl);
        if (!url) {
            setIsRejected(true);
            return;
        }
        onSave(url);
    };

    return (
        <Popover open={Boolean(anchorElement)} anchorEl={anchorElement} onClose={onClose}
                 anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} slotProps={{paper: {sx: {p: 2, width: 340, maxWidth: 'calc(100vw - 32px)'}}}}>
            <form noValidate onSubmit={(event) => {
                event.preventDefault();
                save();
            }}>
                <TextInput label={t('linkDialog.url')} value={typedUrl} autoFocus placeholder="https://"
                           onChange={(value) => {
                               setTypedUrl(value);
                               setIsRejected(false);
                           }}
                           error={isRejected ? t('linkDialog.invalid') : undefined} />
                <Stack direction="row" sx={{gap: 1, justifyContent: 'flex-end'}}>
                    {initialUrl && <Button color="error" onClick={onRemove}>{t('linkDialog.remove')}</Button>}
                    <Button type="submit" variant="contained">{t('linkDialog.save')}</Button>
                </Stack>
            </form>
        </Popover>
    );
}
