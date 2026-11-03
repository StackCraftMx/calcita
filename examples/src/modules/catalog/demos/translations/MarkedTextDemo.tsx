// Un texto con una palabra resaltada en UNA llave: quien traduce ve la frase completa y la pantalla dice cómo se pinta
// cada marca. No es HTML: solo se pintan las marcas que se nombran; lo demás sale como texto.
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {MarkedText, useToolkitTranslation} from '@stackcraftmx/calcita';

const MarkedTextDemo = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Box sx={{display: 'grid', gap: 2}}>
            {/* 1. Una marca: la palabra va del color del tema */}
            <Typography variant="h5" component="p">
                <MarkedText text={t('translations.marked.sample.headline')}
                            marks={{highlight: <Box component="span" sx={{color: 'primary.main', fontWeight: 700}} />}} />
            </Typography>
            {/* 2. Varias marcas, una dentro de otra: una liga con negritas adentro */}
            <Typography variant="body2" color="text.secondary">
                <MarkedText text={t('translations.marked.sample.terms', {version: '2026-11'})}
                            marks={{terms: <Link href="#terminos" />, strong: 'strong'}} />
            </Typography>
            {/* 3. Lo que viene en un dato (un nombre con «<b>») sale tal cual: no es una marca que se nombre */}
            <Typography variant="body2">
                <MarkedText text={t('translations.marked.sample.greeting', {name: '<b>Ana</b>'})}
                            marks={{highlight: (children) => <Box component="mark" sx={{px: 0.5, borderRadius: 1}}>{children}</Box>}} />
            </Typography>
        </Box>
    );
};

export default MarkedTextDemo;
