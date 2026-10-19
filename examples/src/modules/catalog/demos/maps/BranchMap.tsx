// MapView (@stackcraftmx/calcita/maps): alfileres del color del tema; elegir uno vuela a él y abre su globo. El mapa se
// acomoda solo para que se vean todos. El globo puede llevar cualquier cosa (renderPopup): aquí su dirección y un botón; un
// clic en el mapa avisa su posición (onMapClick) y las capas propias de react-leaflet van adentro (aquí, el radio de entrega).
import {useState} from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {Circle} from 'react-leaflet';
import {toastInfo} from '@stackcraftmx/calcita';
import {MapView} from '@stackcraftmx/calcita/maps';

const BRANCHES = [
    {id: 'cdmx', position: [19.4326, -99.1332] as [number, number], title: 'Ciudad de México', description: 'Av. Madero 32', tone: 'success'},
    {id: 'gdl', position: [20.6736, -103.3707] as [number, number], title: 'Guadalajara', description: 'Av. Chapultepec 215', tone: 'success'},
    {id: 'mty', position: [25.6531, -100.3592] as [number, number], title: 'Monterrey', description: 'En remodelación', tone: 'warning'},
];

// el radio de entrega de la sucursal de la Ciudad de México (m)
const DELIVERY_RADIUS_METERS = 8000;

const BranchMap = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    return (
        <MapView markers={BRANCHES} selectedId={selectedId} onSelect={setSelectedId} ariaLabel="Mapa de sucursales" height={360}
                 // 1. el globo: lo que necesite (aquí la dirección y un botón)
                 renderPopup={(marker) => (
                     <Stack spacing={0.5}>
                         <Typography variant="subtitle2" component="p">{marker.title}</Typography>
                         <Typography variant="body2" color="text.secondary" component="p">{marker.description}</Typography>
                         <Button size="small" onClick={() => toastInfo(`Se pidió un repartidor a ${marker.title}.`)}>Pedir repartidor</Button>
                     </Stack>
                 )}
                 // 2. un clic en el mapa, con su posición
                 onMapClick={([latitude, longitude]) => toastInfo(`Picó en ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`)}>
            {/* 3. capas propias de react-leaflet: el radio de entrega */}
            <Circle center={BRANCHES[0].position} radius={DELIVERY_RADIUS_METERS} pathOptions={{color: '#2E7D32', weight: 1, fillOpacity: 0.08}} />
        </MapView>
    );
};

export default BranchMap;
