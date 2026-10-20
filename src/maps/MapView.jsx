// Un mapa con marcadores (@stackcraftmx/calcita/maps): Leaflet con los mosaicos de OpenStreetMap. Cada marcador es un
// alfiler del color del tema (mapMarkers.js); el elegido va más grande, el mapa vuela a él y abre su globo. Al cambiar los
// marcadores, el mapa se acomoda para que se vean todos.
//
//   <MapView markers={[{id: 'gdl', position: [20.67, -103.35], title: 'Sucursal Guadalajara', tone: 'success'}]}
//            selectedId={selectedId} onSelect={setSelectedId} ariaLabel="Mapa de sucursales" />
//
// En oscuro los mosaicos se oscurecen con un filtro (OpenStreetMap solo los da claros). Los mosaicos públicos de
// OpenStreetMap son para poco tráfico y piden su crédito: para mucho uso, un proveedor propio en tileLayer.
//
// Se extiende sin tocar el framework: cualquier contenido en el globo (renderPopup: un estado, un botón, una foto, «Cómo
// llegar»), capas propias de react-leaflet adentro (children: zonas de entrega, un radio), el clic en el mapa (onMapClick:
// agregar un punto) y lo demás de MapContainer de Leaflet (mapProps).
//
// OJO, Next.js: Leaflet usa window al cargarse; en Next se importa con next/dynamic y ssr: false.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaMapView con defaultProps y
// styleOverrides de sus partes: popupText, root.
//
// Genérico del paquete: function (regla de la casa).
import 'leaflet/dist/leaflet.css';
import {useEffect, useMemo, useRef} from 'react';
import L from 'leaflet';
import {MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents} from 'react-leaflet';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';

import {MAP_PIN_SIZE, boundsOfMarkers, mapPinHtmlOf} from '@/maps/mapMarkers.js';
import {paletteOf} from '@/theme/components/paletteOf.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaMapView)
const THEME_NAME = 'CalcitaMapView';
const MapPopupText = piecePart(THEME_NAME, 'PopupText', Typography);
const MapRoot = piecePart(THEME_NAME, 'Root', Box);

/** Los mosaicos de OpenStreetMap con su crédito (lo pide su política de uso). */
export const OPEN_STREET_MAP_TILES = Object.freeze({
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

// México completo cuando no hay marcadores
const DEFAULT_CENTER = Object.freeze([23.6, -102.5]);
const DEFAULT_ZOOM = 5;
// al volar a un marcador elegido, al menos este acercamiento
const SELECTED_ZOOM = 13;
// al acomodar el mapa a los marcadores: el margen (px) y que no se acerque de más con uno solo
const FIT_PADDING_PIXELS = 48;
const FIT_MAX_ZOOM = 13;
const DEFAULT_HEIGHT_PIXELS = 420;

/**
 * Acomoda el mapa para que se vean todos los marcadores cada vez que cambian.
 *
 * @param {{bounds: [[number, number], [number, number]]|null}} props
 */
function FitToMarkers({bounds}) {
    const map = useMap();
    const boundsKey = JSON.stringify(bounds);
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, {padding: [FIT_PADDING_PIXELS, FIT_PADDING_PIXELS], maxZoom: FIT_MAX_ZOOM});
        }
        // OJO: depende del texto del recuadro y no del arreglo: el arreglo es nuevo en cada pintada y el mapa se movería solo
    }, [map, boundsKey]);
    return null;
}

/**
 * Vuela al marcador elegido y abre su globo.
 *
 * @param {{selectedMarker: object|undefined, markerRefs: object}} props
 */
function FlyToSelected({selectedMarker, markerRefs}) {
    const map = useMap();
    useEffect(() => {
        if (!selectedMarker) {
            return;
        }
        map.flyTo(selectedMarker.position, Math.max(map.getZoom(), SELECTED_ZOOM));
        markerRefs.current.get(selectedMarker.id)?.openPopup();
    }, [map, selectedMarker, markerRefs]);
    return null;
}

/**
 * Avisa cada clic en el mapa (fuera de un marcador) con su posición.
 *
 * @param {{onMapClick: (position: [number, number]) => void}} props
 */
function MapClicks({onMapClick}) {
    useMapEvents({click: (event) => onMapClick([event.latlng.lat, event.latlng.lng])});
    return null;
}

/**
 * Lo que dice el globo de un marcador cuando la pantalla no da el suyo: su título y su descripción.
 *
 * @param {{marker: {title: string, description?: string}}} props
 */
function DefaultPopupContent({marker}) {
    return (
        <>
            <Typography variant="subtitle2" component="p">{marker.title}</Typography>
            {marker.description && <MapPopupText variant="body2" color="text.secondary" component="p" ownSx={{m: 0}}>{marker.description}</MapPopupText>}
        </>
    );
}

/**
 * @param {object} props
 * @param {Array<{id: string, position: [number, number], title: string, description?: string, tone?: string} & Record<string, any>>} props.markers
 *     tone: un color del tema (primary, success, warning, error, info…); por omisión primary
 * @param {string|null} [props.selectedId]
 * @param {(markerId: string) => void} [props.onSelect] al picar un marcador
 * @param {string} props.ariaLabel ya traducido: qué enseña el mapa
 * @param {number} [props.height] px
 * @param {{url: string, attribution: string}} [props.tileLayer] por omisión OpenStreetMap
 * @param {(marker: any) => import('react').ReactNode} [props.renderPopup] lo que dice el globo de un marcador (recibe el
 *     marcador tal cual, con sus campos propios); por omisión su título y su descripción
 * @param {(position: [number, number]) => void} [props.onMapClick] al picar el mapa fuera de un marcador
 * @param {import('react').ReactNode} [props.children] capas propias de react-leaflet (Circle, Polygon, GeoJSON…)
 * @param {object} [props.mapProps] lo demás de MapContainer de react-leaflet (scrollWheelZoom, minZoom…)
 */
export default function MapView(props) {
    // lo que el proyecto puso en su tema (components.CalcitaMapView.defaultProps) y encima lo que llega aquí
    const {
    markers, selectedId = null, onSelect, ariaLabel, height = DEFAULT_HEIGHT_PIXELS, tileLayer = OPEN_STREET_MAP_TILES, renderPopup, onMapClick,
    children, mapProps,
    ...unknownProps
} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const theme = useTheme();
    const palette = paletteOf(theme);
    const markerRefs = useRef(new Map());
    const bounds = useMemo(() => boundsOfMarkers(markers), [markers]);
    const selectedMarker = markers.find((marker) => marker.id === selectedId);

    // el ícono de cada marcador: se arma de nuevo solo si cambia su color o si se elige
    const iconOf = (marker) => {
        const isSelected = marker.id === selectedId;
        const size = isSelected ? MAP_PIN_SIZE.selected : MAP_PIN_SIZE.normal;
        const color = (palette[marker.tone] ?? palette.primary).main;
        return L.divIcon({html: mapPinHtmlOf(color, isSelected), className: '', iconSize: [size, size], iconAnchor: [size / 2, size], popupAnchor: [0, -size]});
    };

    return (
        <MapRoot role="region" aria-label={ariaLabel} ownSx={(currentTheme) => ({
            height, borderRadius: 3, overflow: 'hidden', position: 'relative', zIndex: 0,
            '& .leaflet-container': {height: '100%', width: '100%', fontFamily: 'inherit', bgcolor: 'action.hover'},
            '& .leaflet-bar': {border: 0, borderRadius: '10px', overflow: 'hidden', boxShadow: currentTheme.shadows[2]},
            '& .leaflet-bar a': {bgcolor: 'background.paper', color: 'text.primary', borderBottomColor: 'divider'},
            '& .leaflet-popup-content-wrapper, & .leaflet-popup-tip': {bgcolor: 'background.paper', color: 'text.primary'},
            '& .leaflet-popup-content-wrapper': {borderRadius: '12px'},
            '& .leaflet-control-attribution': {bgcolor: 'background.paper', color: 'text.secondary', '& a': {color: 'inherit'}},
            // OpenStreetMap solo da mosaicos claros: en oscuro se invierten y se regresa el tono (el agua sigue azul)
            ...currentTheme.applyStyles('dark', {'& .leaflet-tile-pane': {filter: 'invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9)'}}),
        })}>
            <MapContainer center={markers[0]?.position ?? DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom={false} {...mapProps}>
                <TileLayer url={tileLayer.url} attribution={tileLayer.attribution} />
                {onMapClick && <MapClicks onMapClick={onMapClick} />}
                {children}
                <FitToMarkers bounds={bounds} />
                <FlyToSelected selectedMarker={selectedMarker} markerRefs={markerRefs} />
                {markers.map((marker) => (
                    <Marker key={marker.id} position={marker.position} icon={iconOf(marker)} title={marker.title} alt={marker.title}
                            zIndexOffset={marker.id === selectedId ? 1000 : 0}
                            ref={(leafletMarker) => (leafletMarker ? markerRefs.current.set(marker.id, leafletMarker) : markerRefs.current.delete(marker.id))}
                            eventHandlers={{click: () => onSelect?.(marker.id)}}>
                        <Popup>
                            {renderPopup ? renderPopup(marker) : <DefaultPopupContent marker={marker} />}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </MapRoot>
    );
}
