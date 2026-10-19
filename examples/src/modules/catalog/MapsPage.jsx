// Hecho en Calcita · el mapa (MapView de /maps): el ejemplo vivo y su código en JS y TS (para copiar).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import BranchMap from '@/modules/catalog/demos/maps/BranchMap.tsx';

const loadSource = () => import('@/modules/catalog/demos/maps/BranchMap.tsx?demo-source');

// «Cómo se extiende»: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts (maps.demo.extend.<id>)
const MAP_EXTENSIONS = [
    {id: 'markers', option: 'markers', example: "markers={[{id: 'mty', position: [25.67, -100.31], title: 'Monterrey', tone: 'success'}]}"},
    {id: 'selected', option: 'selectedId', example: 'selectedId={selectedBranchId}'},
    {id: 'onSelect', option: 'onSelect', example: 'onSelect={setSelectedBranchId}'},
    {id: 'ariaLabel', option: 'ariaLabel', example: 'ariaLabel="Sucursales de la tienda"'},
    {id: 'height', option: 'height', example: 'height={420}'},
    {id: 'tileLayer', option: 'tileLayer', example: "tileLayer={{url: 'https://…/{z}/{x}/{y}.png', attribution: '© Su proveedor'}}"},
    {id: 'renderPopup', option: 'renderPopup', example: 'renderPopup={(marker) => <BranchPopup branch={marker} />}'},
    {id: 'ownFields', option: 'markers[].(sus campos)', example: "markers={[{id, position, title, status: 'open', orders: 412}]}  // llegan a renderPopup"},
    {id: 'onMapClick', option: 'onMapClick', example: 'onMapClick={([latitude, longitude]) => addPoint(latitude, longitude)}'},
    {id: 'layers', option: 'children (react-leaflet)', example: '<MapView …><Circle center={center} radius={8000} /></MapView>'},
    {id: 'mapProps', option: 'mapProps', example: 'mapProps={{scrollWheelZoom: true, minZoom: 4}}'},
];

export const MapsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('maps.title')} description={t('maps.description')} />
            <DemoSection title={t('maps.demo.title')} description={t('maps.demo.description')}
                         extensions={extensionRowsOf(t, 'maps.demo', MAP_EXTENSIONS)} Demo={BranchMap} loadSource={loadSource} />
        </Stack>
    );
};
