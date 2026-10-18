import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// Una liga a otro sitio que abre otra pestaña: rel="noopener noreferrer" le quita a esa pestaña la forma de cambiar esta
// (window.opener) y de saber de dónde vino. Los navegadores nuevos ya ponen noopener solos con target="_blank"; se escribe
// igual, para los demás.
const ExternalLinks = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack direction="row" spacing={3}>
            <Link href="https://developer.mozilla.org/es/docs/Web/HTTP/CSP" target="_blank" rel="noopener noreferrer">
                {t('security.links.csp')}
            </Link>
            <Link href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer">
                {t('security.links.owasp')}
            </Link>
        </Stack>
    );
};

export default ExternalLinks;
