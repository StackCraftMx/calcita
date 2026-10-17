// Catálogo · botones: Button en sus tres variantes, colores, tamaños, con ícono y sus estados; el grupo de botones, el
// botón de ícono, el botón flotante, el marcado rápido (SpeedDial) y CopyButton del framework.
//
// Con el vidrio del tema (reglas de la HIG de Apple, «Buttons»): el relleno es el «prominente» (color de fondo con brillo),
// el de borde es una cápsula de vidrio con letra de un solo color y el grupo con borde es una sola cápsula.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import ShareIcon from '@mui/icons-material/Share';
import {CopyButton, PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {ShowcaseSection, Specimen} from '@/modules/catalog/Showcase.jsx';

const BUTTON_VARIANTS = Object.freeze(['contained', 'outlined', 'text']);
// los colores del tema que acepta un botón (el color es información: rojo para lo que borra, verde para lo que confirma)
const BUTTON_COLORS = Object.freeze(['primary', 'secondary', 'success', 'error', 'warning', 'info']);
const BUTTON_SIZES = Object.freeze(['small', 'medium', 'large']);
const ICON_BUTTON_COLORS = Object.freeze(['default', 'primary', 'error']);
// cuánto tarda el ejemplo de «esperando» (milisegundos): lo que tardaría un servidor en guardar
const SAVING_DEMO_MILLISECONDS = 2000;
// lo que mide la caja del marcado rápido: lo justo para que sus acciones se abran a la derecha sin taparse
const SPEED_DIAL_BOX_HEIGHT = 96;
// el folio de ejemplo que copia CopyButton (dato de mentira)
const SAMPLE_FOLIO = 'P-2375';

export const ButtonsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const [isSaving, setIsSaving] = useState(false);

    const save = () => {
        setIsSaving(true);
        window.setTimeout(() => setIsSaving(false), SAVING_DEMO_MILLISECONDS);
    };

    const speedDialActions = [
        {key: 'copy', Icon: ContentCopyIcon},
        {key: 'save', Icon: SaveIcon},
        {key: 'share', Icon: ShareIcon},
    ];

    return (
        <Stack spacing={3}>
            <PageHeading title={t('buttons.title')} description={t('buttons.description')} />

            <ShowcaseSection title={t('buttons.variants.title')} description={t('buttons.variants.description')}>
                {BUTTON_VARIANTS.map((variant) => (
                    <Specimen key={variant} label={t(`variants.${variant}`)} code={`variant="${variant}"`}>
                        <Button variant={variant}>{t('samples.save')}</Button>
                    </Specimen>
                ))}
            </ShowcaseSection>

            <ShowcaseSection title={t('buttons.colors.title')} description={t('buttons.colors.description')}>
                {BUTTON_VARIANTS.map((variant) => (
                    <Specimen key={variant} wide label={t(`variants.${variant}`)} code={`variant="${variant}" color="primary | secondary | success | error | warning | info"`}>
                        {BUTTON_COLORS.map((color) => <Button key={color} variant={variant} color={color}>{t(`colors.${color}`)}</Button>)}
                    </Specimen>
                ))}
            </ShowcaseSection>

            <ShowcaseSection title={t('buttons.sizes.title')} description={t('buttons.sizes.description')}>
                {BUTTON_SIZES.map((size) => (
                    <Specimen key={size} label={t(`sizes.${size}`)} code={`size="${size}"`}>
                        <Button variant="contained" size={size}>{t('samples.save')}</Button>
                        <Button variant="outlined" size={size}>{t('samples.cancel')}</Button>
                    </Specimen>
                ))}
            </ShowcaseSection>

            <ShowcaseSection title={t('buttons.icons.title')} description={t('buttons.icons.description')}>
                <Specimen label={t('buttons.icons.start')} code="startIcon={<DownloadIcon />}">
                    <Button variant="outlined" startIcon={<DownloadIcon />}>{t('samples.download')}</Button>
                </Specimen>
                <Specimen label={t('buttons.icons.end')} code="endIcon={<SendIcon />}">
                    <Button variant="contained" endIcon={<SendIcon />}>{t('samples.send')}</Button>
                </Specimen>
                <Specimen label={t('buttons.icons.destructive')} code='color="error" startIcon={<DeleteOutlineIcon />}'>
                    <Button variant="outlined" color="error" startIcon={<DeleteOutlineIcon />}>{t('samples.delete')}</Button>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('buttons.states.title')} description={t('buttons.states.description')}>
                <Specimen label={t('states.disabled')} code="disabled">
                    {BUTTON_VARIANTS.map((variant) => <Button key={variant} variant={variant} disabled>{t('samples.save')}</Button>)}
                </Specimen>
                <Specimen label={t('states.loading')} code='loading loadingPosition="start"'>
                    <Button variant="contained" loading={isSaving} loadingPosition="start" startIcon={<SaveIcon />} onClick={save}>
                        {isSaving ? t('samples.saving') : t('samples.save')}
                    </Button>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('buttons.group.title')} description={t('buttons.group.description')}>
                {BUTTON_VARIANTS.map((variant) => (
                    <Specimen key={variant} label={t(`variants.${variant}`)} code={`<ButtonGroup variant="${variant}">`}>
                        <ButtonGroup variant={variant} aria-label={t('buttons.group.ariaLabel')}>
                            <Button>{t('samples.previous')}</Button>
                            <Button>{t('samples.today')}</Button>
                            <Button>{t('samples.next')}</Button>
                        </ButtonGroup>
                    </Specimen>
                ))}
                <Specimen label={t('buttons.group.vertical')} code='orientation="vertical"'>
                    <ButtonGroup orientation="vertical" aria-label={t('buttons.group.ariaLabel')}>
                        <Button>{t('samples.edit')}</Button>
                        <Button>{t('samples.share')}</Button>
                        <Button>{t('samples.delete')}</Button>
                    </ButtonGroup>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('buttons.iconButtons.title')} description={t('buttons.iconButtons.description')}>
                {ICON_BUTTON_COLORS.map((color) => (
                    <Specimen key={color} label={t(`colors.${color}`)} code={`<IconButton color="${color}" aria-label="…">`}>
                        <Tooltip title={t('samples.edit')}><IconButton color={color} aria-label={t('samples.edit')}><EditIcon /></IconButton></Tooltip>
                        <Tooltip title={t('samples.share')}><IconButton color={color} aria-label={t('samples.share')}><ShareIcon /></IconButton></Tooltip>
                        <Tooltip title={t('samples.delete')}><IconButton color={color} aria-label={t('samples.delete')}><DeleteOutlineIcon /></IconButton></Tooltip>
                    </Specimen>
                ))}
                <Specimen label={t('buttons.iconButtons.sizes')} code='size="small | medium | large"'>
                    {BUTTON_SIZES.map((size) => (
                        <Tooltip key={size} title={t(`sizes.${size}`)}><IconButton size={size} aria-label={t('samples.edit')}><EditIcon fontSize="inherit" /></IconButton></Tooltip>
                    ))}
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('buttons.fab.title')} description={t('buttons.fab.description')}>
                <Specimen label={t('colors.primary')} code='<Fab color="primary" aria-label="…">'>
                    <Fab color="primary" aria-label={t('samples.add')}><AddIcon /></Fab>
                </Specimen>
                <Specimen label={t('colors.default')} code='<Fab aria-label="…">'>
                    <Fab aria-label={t('samples.edit')}><EditIcon /></Fab>
                </Specimen>
                <Specimen label={t('buttons.fab.extended')} code='variant="extended"'>
                    <Fab variant="extended" color="primary"><AddIcon sx={{mr: 1}} />{t('samples.newOrder')}</Fab>
                </Specimen>
                <Specimen label={t('buttons.fab.sizes')} code='size="small | medium | large"'>
                    {BUTTON_SIZES.map((size) => <Fab key={size} size={size} color="secondary" aria-label={t('samples.add')}><AddIcon /></Fab>)}
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('buttons.speedDial.title')} description={t('buttons.speedDial.description')}>
                <Specimen wide label={t('buttons.speedDial.label')} code='<SpeedDial direction="right">'>
                    <Box sx={{position: 'relative', height: SPEED_DIAL_BOX_HEIGHT, width: '100%'}}>
                        <SpeedDial ariaLabel={t('buttons.speedDial.ariaLabel')} direction="right" icon={<SpeedDialIcon />}
                                   sx={{position: 'absolute', left: 0, top: 0}}>
                            {speedDialActions.map(({key, Icon}) => (
                                <SpeedDialAction key={key} icon={<Icon />} slotProps={{tooltip: {title: t(`samples.${key}`)}}} />
                            ))}
                        </SpeedDial>
                    </Box>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('frameworkTitle')} description={t('buttons.framework.description')}>
                <Specimen label="CopyButton" code={`<CopyButton value="${SAMPLE_FOLIO}" />`}>
                    <CopyButton value={SAMPLE_FOLIO} />
                </Specimen>
            </ShowcaseSection>
        </Stack>
    );
};
