// Un esqueleto ENCIMA de algo que tiene que seguir montado mientras carga, en lugar de en su lugar: un tablero de un
// tercero (Tableau, Power BI, un mapa) que, si se desmonta, empieza de cero (Tableau tarda de 20 a 25 segundos). El
// contenido se pinta desde el principio debajo y el esqueleto lo tapa hasta que la pantalla dice que ya está listo (el
// evento del propio tablero: «firstinteractive» en Tableau).
//
//   const [isReady, setIsReady] = useState(false);
//   <SkeletonOverlay isLoading={!isReady}>
//       <tableau-viz src={url} onFirstInteractive={() => setIsReady(true)} />
//   </SkeletonOverlay>
//
// Por omisión tapa con la forma de un tablero (DashboardSkeleton); `skeleton` pone otra. Mientras carga, el contenido va
// con aria-busy (el lector de pantalla no lo lee a medias) y el esqueleto dice «Cargando».
//
// OJO: el esqueleto tapa lo que mide el contenido. Si lo que carga no tiene alto hasta que termina (un iframe vacío), se le
// da su alto al contenido (o a esta pieza con sx), o el esqueleto no se vería.
//
// Se cambia desde el tema del proyecto: components.CalcitaSkeletonOverlay con defaultProps y styleOverrides de sus partes
// root y cover.
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';

import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import DashboardSkeleton from '@/ui/skeletons/DashboardSkeleton.jsx';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaSkeletonOverlay)
const THEME_NAME = 'CalcitaSkeletonOverlay';
const OverlayRoot = piecePart(THEME_NAME, 'Root', Box);
const OverlayCover = piecePart(THEME_NAME, 'Cover', Box);

/**
 * @param {object} props
 * @param {boolean} props.isLoading mientras sea true, el esqueleto tapa el contenido
 * @param {import('react').ReactNode} props.children lo que carga; se monta desde el principio y no se desmonta
 * @param {import('react').ReactNode} [props.skeleton] la forma que tapa; por omisión la de un tablero (DashboardSkeleton)
 * @param {import('@mui/material').SxProps} [props.sx]
 */
function SkeletonOverlayContent(props) {
    const {isLoading, children, skeleton, sx, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);

    return (
        <OverlayRoot sx={sx} ownSx={{position: 'relative'}}>
            <Box aria-busy={isLoading || undefined}>{children}</Box>
            {/* encima y del color del papel: lo de abajo no se ve a medias mientras se arma */}
            {isLoading && (
                <OverlayCover ownSx={{position: 'absolute', inset: 0, bgcolor: 'background.paper', overflow: 'hidden'}}>
                    {skeleton ?? <DashboardSkeleton height="100%" />}
                </OverlayCover>
            )}
        </OverlayRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const SkeletonOverlay = withPieceSlots(SkeletonOverlayContent, THEME_NAME);
export default SkeletonOverlay;
