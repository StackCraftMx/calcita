import type {MouseEvent} from 'react';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const UNDERLINES = ['always', 'hover', 'none'] as const;

const LinkUnderlines = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack direction="row" spacing={3} useFlexGap sx={{flexWrap: 'wrap'}}>
            {UNDERLINES.map((underline) => (
                <Link key={underline} href="#" onClick={(event: MouseEvent) => event.preventDefault()} underline={underline}>
                    {t(`navigation.links.underline.${underline}`)}
                </Link>
            ))}
        </Stack>
    );
};

export default LinkUnderlines;
