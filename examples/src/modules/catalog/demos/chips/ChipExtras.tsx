import {useState} from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import {initialsOf, useToolkitTranslation} from '@stackcraftmx/calcita';

// una persona de mentira
const SAMPLE_PERSON = 'Ana Martínez';
const INITIAL_TAGS = ['retail', 'wholesale'];

const ChipExtras = () => {
    const {t} = useToolkitTranslation('catalog');
    const [visibleTags, setVisibleTags] = useState(INITIAL_TAGS);
    const removeTag = (tag: string) => setVisibleTags((tags) => tags.filter((current) => current !== tag));

    return (
        <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
            <Chip icon={<FavoriteBorderIcon />} label={t('samples.favorite')} variant="outlined" />
            <Chip avatar={<Avatar>{initialsOf(SAMPLE_PERSON)}</Avatar>} label={SAMPLE_PERSON} variant="outlined" />
            {/* la × quita la etiqueta; al quitar las dos aparece la forma de regresarlas */}
            {visibleTags.map((tag) => <Chip key={tag} label={t(`samples.${tag}`)} onDelete={() => removeTag(tag)} />)}
            {visibleTags.length === 0 && (
                <Chip label={t('chips.extras.restore')} variant="outlined" onClick={() => setVisibleTags(INITIAL_TAGS)} />
            )}
            <Chip size="small" label={t('sizes.small')} />
        </Stack>
    );
};

export default ChipExtras;
