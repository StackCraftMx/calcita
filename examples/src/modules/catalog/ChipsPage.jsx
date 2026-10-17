// Catálogo · chips y etiquetas: Chip en sus variantes y colores, con ícono, avatar o para quitar; las etiquetas del
// framework (Tag, StatusChip con su diccionario, QuickFilters); las insignias (Badge) y los avatares.
//
// Con el vidrio del tema (HIG de Apple, «Materials» y «Buttons»): el chip que solo informa es contenido y no lleva vidrio;
// el que se pica es un control y se vuelve cápsula de vidrio, y el elegido, de su color con brillo.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {PageHeading, QuickFilters, StatusChip, Tag, initialsOf, useToolkitTranslation} from '@stackcraftmx/calcita';

import {ORDER_STATUS} from '@/core';
import {ShowcaseSection, Specimen} from '@/modules/catalog/Showcase.jsx';

const CHIP_COLORS = Object.freeze(['default', 'primary', 'secondary', 'success', 'error', 'warning', 'info']);
const BADGE_COLORS = Object.freeze(['primary', 'secondary', 'error', 'success']);
const AVATAR_VARIANTS = Object.freeze(['circular', 'rounded', 'square']);
// las medidas de avatar que se comparan (px): chico en listas densas, el de omisión y el de un encabezado
const AVATAR_SIZES = Object.freeze([28, 40, 56]);
// un número grande para ver el tope de la insignia (99+)
const BADGE_OVERFLOW_COUNT = 120;
// personas de mentira para los avatares
const SAMPLE_PEOPLE = Object.freeze(['Ana Martínez', 'Luis Herrera', 'Mónica Vega', 'Bruno Díaz', 'Irene Campos', 'Héctor Navarro']);
// cuántos avatares enseña el grupo antes del «+N»
const AVATAR_GROUP_MAX = 4;
// los filtros rápidos de ejemplo, con sus conteos de mentira
const QUICK_FILTER_COUNTS = Object.freeze({pending: 13, paid: 14, delivered: 1207});

export const ChipsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const [isPicked, setIsPicked] = useState(false);
    const [quickFilter, setQuickFilter] = useState('');
    const [visibleTags, setVisibleTags] = useState(['retail', 'wholesale']);

    const quickFilterOptions = [
        {value: '', label: t('chips.framework.all'), count: QUICK_FILTER_COUNTS.pending + QUICK_FILTER_COUNTS.paid + QUICK_FILTER_COUNTS.delivered},
        ...Object.entries(QUICK_FILTER_COUNTS).map(([status, count]) => ({value: status, label: t(`chips.framework.status.${status}`), count})),
    ];

    return (
        <Stack spacing={3}>
            <PageHeading title={t('chips.title')} description={t('chips.description')} />

            <ShowcaseSection title={t('chips.variants.title')} description={t('chips.variants.description')}>
                <Specimen label={t('chips.variants.infoFilled')} code='<Chip label="…" />'>
                    <Chip label={t('samples.retail')} />
                </Specimen>
                <Specimen label={t('chips.variants.infoOutlined')} code='variant="outlined"'>
                    <Chip label={t('samples.retail')} variant="outlined" />
                </Specimen>
                <Specimen label={t('chips.variants.clickable')} code='variant="outlined" onClick={…}'>
                    <Chip label={t('samples.wholesale')} variant="outlined" onClick={() => setIsPicked((picked) => !picked)} />
                </Specimen>
                <Specimen label={t('chips.variants.picked')} code='color="primary" onClick={…}'>
                    <Chip label={t('samples.wholesale')} color="primary" onClick={() => setIsPicked((picked) => !picked)} />
                </Specimen>
                <Specimen label={t('chips.variants.toggle')} code="variant={elegido ? 'filled' : 'outlined'}">
                    <Chip label={t('samples.favorite')} color={isPicked ? 'primary' : 'default'} variant={isPicked ? 'filled' : 'outlined'}
                          onClick={() => setIsPicked((picked) => !picked)} aria-pressed={isPicked} />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('chips.colors.title')} description={t('chips.colors.description')}>
                <Specimen wide label={t('variants.filled')} code='color="default | primary | secondary | success | error | warning | info"'>
                    {CHIP_COLORS.map((color) => <Chip key={color} label={t(`colors.${color}`)} color={color} />)}
                </Specimen>
                <Specimen wide label={t('variants.outlined')} code='variant="outlined" color="…"'>
                    {CHIP_COLORS.map((color) => <Chip key={color} label={t(`colors.${color}`)} color={color} variant="outlined" />)}
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('chips.extras.title')} description={t('chips.extras.description')}>
                <Specimen label={t('chips.extras.icon')} code="icon={<FavoriteBorderIcon />}">
                    <Chip icon={<FavoriteBorderIcon />} label={t('samples.favorite')} variant="outlined" />
                </Specimen>
                <Specimen label={t('chips.extras.avatar')} code="avatar={<Avatar>…</Avatar>}">
                    <Chip avatar={<Avatar>{initialsOf(SAMPLE_PEOPLE[0])}</Avatar>} label={SAMPLE_PEOPLE[0]} variant="outlined" />
                </Specimen>
                <Specimen label={t('chips.extras.deletable')} code="onDelete={…}">
                    {visibleTags.map((tag) => (
                        <Chip key={tag} label={t(`samples.${tag}`)} onDelete={() => setVisibleTags((tags) => tags.filter((current) => current !== tag))} />
                    ))}
                    {visibleTags.length === 0 && (
                        <Chip label={t('chips.extras.restore')} variant="outlined" onClick={() => setVisibleTags(['retail', 'wholesale'])} />
                    )}
                </Specimen>
                <Specimen label={t('sizes.small')} code='size="small"'>
                    <Chip size="small" label={t('samples.retail')} />
                    <Chip size="small" label={t('samples.wholesale')} variant="outlined" onClick={() => {}} />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('frameworkTitle')} description={t('chips.framework.description')}>
                <Specimen label="Tag" code='<Tag label="…" tooltip="…" />'>
                    <Tag label={t('samples.retail')} tooltip={t('chips.framework.tagTooltip')} />
                    <Tag label={t('samples.wholesale')} color="info" tooltip={t('chips.framework.tagTooltip')} />
                </Specimen>
                <Specimen label={t('chips.framework.statusDot')} code='<StatusChip dictionary={ORDER_STATUS} value="…" />'>
                    {Object.keys(ORDER_STATUS).map((status) => <StatusChip key={status} dictionary={ORDER_STATUS} value={status} />)}
                </Specimen>
                <Specimen label={t('chips.framework.statusChip')} code='variant="chip"'>
                    {Object.keys(ORDER_STATUS).map((status) => <StatusChip key={status} dictionary={ORDER_STATUS} value={status} variant="chip" />)}
                </Specimen>
                <Specimen wide label="QuickFilters" code="<QuickFilters value={…} onChange={…} options={[{value, label, count}]} />">
                    <QuickFilters value={quickFilter} onChange={setQuickFilter} options={quickFilterOptions}
                                  caption={t('chips.framework.quickCaption')} ariaLabel={t('chips.framework.quickCaption')} />
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('chips.badges.title')} description={t('chips.badges.description')}>
                {BADGE_COLORS.map((color) => (
                    <Specimen key={color} label={t(`colors.${color}`)} code={`<Badge badgeContent={4} color="${color}">`}>
                        <IconButton aria-label={t('chips.badges.messages', {count: 4})}>
                            <Badge badgeContent={4} color={color}><MailOutlineIcon /></Badge>
                        </IconButton>
                    </Specimen>
                ))}
                <Specimen label={t('chips.badges.max')} code="max={99}">
                    <IconButton aria-label={t('chips.badges.messages', {count: BADGE_OVERFLOW_COUNT})}>
                        <Badge badgeContent={BADGE_OVERFLOW_COUNT} max={99} color="error"><NotificationsNoneIcon /></Badge>
                    </IconButton>
                </Specimen>
                <Specimen label={t('chips.badges.dot')} code='variant="dot"'>
                    <IconButton aria-label={t('chips.badges.news')}>
                        <Badge variant="dot" color="error"><NotificationsNoneIcon /></Badge>
                    </IconButton>
                </Specimen>
            </ShowcaseSection>

            <ShowcaseSection title={t('chips.avatars.title')} description={t('chips.avatars.description')}>
                <Specimen label={t('chips.avatars.initials')} code="<Avatar>{initialsOf(name)}</Avatar>">
                    {SAMPLE_PEOPLE.slice(0, 3).map((person) => <Avatar key={person} alt={person}>{initialsOf(person)}</Avatar>)}
                </Specimen>
                <Specimen label={t('chips.avatars.icon')} code="<Avatar><PersonOutlineIcon /></Avatar>">
                    <Avatar><PersonOutlineIcon /></Avatar>
                </Specimen>
                <Specimen label={t('chips.avatars.sizes')} code="sx={{width: 28, height: 28}}">
                    {AVATAR_SIZES.map((size) => <Avatar key={size} sx={{width: size, height: size, fontSize: size * 0.4}}>{initialsOf(SAMPLE_PEOPLE[1])}</Avatar>)}
                </Specimen>
                <Specimen label={t('chips.avatars.shapes')} code='variant="circular | rounded | square"'>
                    {AVATAR_VARIANTS.map((variant) => <Avatar key={variant} variant={variant}>{initialsOf(SAMPLE_PEOPLE[2])}</Avatar>)}
                </Specimen>
                <Specimen label={t('chips.avatars.group')} code={`<AvatarGroup max={${AVATAR_GROUP_MAX}}>`}>
                    <AvatarGroup max={AVATAR_GROUP_MAX}>
                        {SAMPLE_PEOPLE.map((person) => <Avatar key={person} alt={person}>{initialsOf(person)}</Avatar>)}
                    </AvatarGroup>
                </Specimen>
            </ShowcaseSection>
        </Stack>
    );
};
