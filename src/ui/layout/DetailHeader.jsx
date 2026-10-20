// Encabezado de una página de detalle (un solo registro: un pedido, un usuario...): eyebrow con el contexto, el título
// que dice QUÉ registro es, sus insignias a un lado del título (estatus, intento...) y las acciones a la derecha.
//
// Por qué aparte de PageHeader: ese es el encabezado centrado de un listado. En un detalle lo primero que se lee es qué
// registro se está viendo y en qué estado está; por eso el título y sus insignias van juntos, arriba a la izquierda.
//
// También pone el título de la pestaña (DocumentTitle) y, dentro de AppLayout, sube el título a la barra al deslizar.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaDetailHeader con defaultProps y
// styleOverrides de sus partes: root, titleArea, title, badges, actions.
//
// Genérico del paquete: function (regla de la casa). No sabe de negocio: todo llega por props, ya traducido.
import {useRef} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {useRegisterPageTitle} from '@/appShell/pageTitle.jsx';
import DocumentTitle from '@/ui/navigation/DocumentTitle.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaDetailHeader)
const THEME_NAME = 'CalcitaDetailHeader';
const DetailRoot = piecePart(THEME_NAME, 'Root', Box);
const DetailTitleArea = piecePart(THEME_NAME, 'TitleArea', Box);
const DetailTitle = piecePart(THEME_NAME, 'Title', Typography);
const DetailBadges = piecePart(THEME_NAME, 'Badges', Stack);
const DetailActions = piecePart(THEME_NAME, 'Actions', Stack);

/**
 * @param {object} props
 * @param {string} props.title texto ya traducido
 * @param {string} [props.eyebrow] contexto arriba del título (p. ej. el producto)
 * @param {import('react').ReactNode} [props.badges] insignias junto al título (chips de estatus, intento...)
 * @param {import('react').ReactNode} [props.actions] botones a la derecha
 * @param {string} [props.documentTitle] título de la pestaña si difiere del visible
 */
export default function DetailHeader(props) {
    // lo que el proyecto puso en su tema (components.CalcitaDetailHeader.defaultProps) y encima lo que llega aquí
    const {title, eyebrow, badges, actions, documentTitle, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const titleRef = useRef(null);
    useRegisterPageTitle(title, titleRef);
    return (
        <DetailRoot component="header" ownSx={{display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mb: 2.5}}>
            <DocumentTitle title={documentTitle ?? title} />
            <DetailTitleArea ownSx={{minWidth: 0}}>
                {/* el contexto se lee de un vistazo (en overline se veía
                    muy chico); text.secondary y no text.disabled: se lee (WCAG no lo exime) */}
                {eyebrow && <DetailTitle variant="subtitle1" color="text.secondary" component="p" ownSx={{fontWeight: 700}}>{eyebrow}</DetailTitle>}
                <DetailBadges direction="row" spacing={1.5} useFlexGap ownSx={{alignItems: 'center', flexWrap: 'wrap'}}>
                    <Typography ref={titleRef} variant="h5" component="h1">{title}</Typography>
                    {badges}
                </DetailBadges>
            </DetailTitleArea>
            {actions && <DetailActions direction="row" spacing={1} useFlexGap ownSx={{flexWrap: 'wrap'}}>{actions}</DetailActions>}
        </DetailRoot>
    );
}
