import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

const VARIANTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'overline', 'button'] as const;
// lo ancho del nombre de cada variante (px)
const NAME_WIDTH = 96;

// la escala del tema; cada tamaño con el espaciado entre letras de Apple para su medida
const TypographyScale = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack spacing={1.5}>
            {VARIANTS.map((variant) => (
                <Stack key={variant} direction={{xs: 'column', sm: 'row'}} spacing={{xs: 0.5, sm: 2}} sx={{alignItems: {sm: 'baseline'}}}>
                    <Typography variant="caption" component="code" color="text.secondary"
                                sx={{width: NAME_WIDTH, flexShrink: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'}}>
                        {variant}
                    </Typography>
                    <Typography variant={variant} component="p" noWrap sx={{minWidth: 0}}>{t('surfaces.typography.sample')}</Typography>
                </Stack>
            ))}
        </Stack>
    );
};

export default TypographyScale;
