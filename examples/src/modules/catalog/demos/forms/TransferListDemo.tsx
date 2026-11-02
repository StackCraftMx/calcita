// La lista de transferencia: para elegir muchos de una lista larga viendo siempre qué quedó de cada lado (las sucursales
// donde puede comprar un cliente, los usuarios que pueden ver un reporte). Se marcan y se pasan con ›; » pasa todos;
// doble clic pasa uno directo. Cada columna busca por su cuenta. Al campo le llega la lista de los elegidos.
import {useState} from 'react';
import Typography from '@mui/material/Typography';
import {TransferListInput} from '@stackcraftmx/calcita';

// ─── Las opciones (en su proyecto salen del API) ───
const BRANCHES = [
    ['cdmx-centro', 'Centro Histórico', 'Ciudad de México'], ['cdmx-polanco', 'Polanco', 'Ciudad de México'],
    ['gdl-chapultepec', 'Chapultepec', 'Guadalajara'], ['gdl-providencia', 'Providencia', 'Guadalajara'],
    ['mty-san-pedro', 'San Pedro', 'Monterrey'], ['mty-cumbres', 'Cumbres', 'Monterrey'], ['pue-centro', 'Centro', 'Puebla'],
    ['qro-juriquilla', 'Juriquilla', 'Querétaro'], ['mid-montejo', 'Paseo de Montejo', 'Mérida'], ['tij-rio', 'Zona Río', 'Tijuana'],
].map(([value, label, city]) => ({value, label, description: city}));

const TransferListDemo = () => {
    const [allowedBranches, setAllowedBranches] = useState<Array<string | number>>(['cdmx-centro', 'gdl-chapultepec']);

    return (
        <>
            {/* 1. Todas las opciones y lo elegido; con más de 8 opciones cada columna trae su buscador */}
            <TransferListInput label="Sucursales donde puede comprar" value={allowedBranches} onChange={setAllowedBranches} options={BRANCHES}
                               availableTitle="Todas las sucursales" chosenTitle="Puede comprar en" />
            {/* 2. Lo que viaja: los elegidos, en el orden en que se pasaron */}
            <Typography variant="body2" color="text.secondary" sx={{mt: 1, overflowWrap: 'anywhere'}}>Viaja: {JSON.stringify(allowedBranches)}</Typography>
        </>
    );
};

export default TransferListDemo;
