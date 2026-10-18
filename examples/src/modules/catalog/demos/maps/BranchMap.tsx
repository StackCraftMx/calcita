// MapView (@stackcraftmx/calcita/maps): alfileres del color del tema; elegir uno vuela a él y abre su globo. El mapa se
// acomoda solo para que se vean todos.
import {useState} from 'react';
import {MapView} from '@stackcraftmx/calcita/maps';

const BRANCHES = [
    {id: 'cdmx', position: [19.4326, -99.1332] as [number, number], title: 'Ciudad de México', description: 'Av. Madero 32', tone: 'success'},
    {id: 'gdl', position: [20.6736, -103.3707] as [number, number], title: 'Guadalajara', description: 'Av. Chapultepec 215', tone: 'success'},
    {id: 'mty', position: [25.6531, -100.3592] as [number, number], title: 'Monterrey', description: 'En remodelación', tone: 'warning'},
];

const BranchMap = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    return <MapView markers={BRANCHES} selectedId={selectedId} onSelect={setSelectedId} ariaLabel="Mapa de sucursales" height={360} />;
};

export default BranchMap;
