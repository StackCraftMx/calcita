// Sucursales: la lista y el mapa (MapView de /maps) juntos. Elegir una sucursal en la lista vuela a su alfiler y abre su
// globo; picar un alfiler la marca en la lista. Arriba, el filtro por estado (abiertas, en remodelación, cerradas).
// «Agregar sucursal» abre el formulario en una ventana (NewBranchDialog); al guardar, la nueva sale en la lista y el mapa
// vuela a ella. El botón va en el encabezado: con la barra en cápsulas sube solo a la barra como ícono con su tooltip
// (BarActionButton); en el teléfono flota arriba a la derecha.
// El globo de cada alfiler es del proyecto (renderPopup de MapView): su estado, sus pedidos del mes y «Cómo llegar», que
// abre la ruta en OpenStreetMap.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DirectionsOutlinedIcon from '@mui/icons-material/DirectionsOutlined';
import Typography from '@mui/material/Typography';
import {BarActionButton, PageHeading, SegmentedControl, Tag, formatNumber, useToolkitTranslation} from '@stackcraftmx/calcita';
import {MapView} from '@stackcraftmx/calcita/maps';

import {BRANCH_STATUS, loadBranches} from '@/modules/branches/branchesApi.js';
import {NewBranchDialog} from '@/modules/branches/NewBranchDialog.jsx';

// «todas» en el filtro: sin estado
const ALL = 'all';
const MAP_HEIGHT_PIXELS = 520;
// la ruta hasta una sucursal en OpenStreetMap (el mismo proveedor de los mosaicos del mapa)
const directionsUrlOf = ([latitude, longitude]) => `https://www.openstreetmap.org/directions?route=%3B${latitude}%2C${longitude}`;

export const BranchesPage = () => {
    const {t} = useToolkitTranslation('branches');
    const [status, setStatus] = useState(ALL);
    const [branches, setBranches] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    // cada vez que se abre el formulario, otra key: arranca en blanco
    const [addingRound, setAddingRound] = useState(0);
    // cambia después de guardar: vuelve a pedir la lista
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setBranches(null);
        loadBranches({status: status === ALL ? null : status}, controller.signal)
            .then(setBranches)
            .catch((caught) => caught.name !== 'AbortError' && setError(caught.message));
        return () => controller.abort();
    }, [status, reloadToken]);

    const openNewBranch = () => {
        setAddingRound((round) => round + 1);
        setIsAdding(true);
    };
    // la nueva puede no entrar en el filtro de ahorita: se ven todas, se vuelve a pedir la lista y el mapa vuela a ella
    const showNewBranch = (branch) => {
        setIsAdding(false);
        setStatus(ALL);
        setReloadToken((token) => token + 1);
        setSelectedId(branch.id);
    };

    const statusOptions = [ALL, ...Object.values(BRANCH_STATUS)].map((value) => ({value, label: t(`status.${value}`)}));

    return (
        <Stack spacing={3}>
            <PageHeading title={t('page.title')} description={t('page.description')}
                         actions={<BarActionButton label={t('add.button')} icon={<AddRoundedIcon />} onClick={openNewBranch} />} />
            <SegmentedControl ariaLabel={t('status.label')} value={status} onChange={setStatus} options={statusOptions} />
            {error && <Alert severity="error">{error}</Alert>}
            <Grid container spacing={2}>
                <Grid size={{xs: 12, md: 4}}>
                    <Paper variant="outlined" sx={{borderRadius: 3, maxHeight: MAP_HEIGHT_PIXELS, overflowY: 'auto', p: 1}}>
                        {!branches && <Skeleton variant="rounded" height={MAP_HEIGHT_PIXELS / 2} />}
                        <List disablePadding aria-label={t('list')}>
                            {branches?.map((branch) => (
                                <ListItemButton key={branch.id} selected={branch.id === selectedId} onClick={() => setSelectedId(branch.id)} sx={{borderRadius: 2}}>
                                    <ListItemText primary={`${branch.name} · ${branch.city}`}
                                                  secondary={branch.orders ? t('orders', {count: formatNumber(branch.orders)}) : branch.address} />
                                    <Tag label={t(`status.${branch.status}`)} color={branch.tone} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                </Grid>
                <Grid size={{xs: 12, md: 8}}>
                    <MapView ariaLabel={t('map')} height={MAP_HEIGHT_PIXELS} selectedId={selectedId} onSelect={setSelectedId}
                             markers={(branches ?? []).map((branch) => ({
                                 id: branch.id, position: branch.position, title: `${branch.name} · ${branch.city}`, description: branch.address, tone: branch.tone,
                                 status: branch.status, orders: branch.orders,
                             }))}
                             // el globo del proyecto: recibe el marcador con sus campos propios (status, orders)
                             renderPopup={(marker) => (
                                 <Stack spacing={0.75} sx={{minWidth: 200}}>
                                     <Typography variant="subtitle2" component="p">{marker.title}</Typography>
                                     <Typography variant="body2" color="text.secondary" component="p">{marker.description}</Typography>
                                     <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                                         <Tag label={t(`status.${marker.status}`)} color={marker.tone} />
                                         {marker.orders > 0 && <Typography variant="caption">{t('orders', {count: formatNumber(marker.orders)})}</Typography>}
                                     </Stack>
                                     <Button size="small" startIcon={<DirectionsOutlinedIcon />} href={directionsUrlOf(marker.position)} target="_blank" rel="noreferrer"
                                             sx={{alignSelf: 'flex-start'}}>
                                         {t('directions')}
                                     </Button>
                                 </Stack>
                             )} />
                </Grid>
            </Grid>
            <NewBranchDialog key={addingRound} open={isAdding} onClose={() => setIsAdding(false)} onCreated={showNewBranch} />
        </Stack>
    );
};
