import {useState} from 'react';
import Stack from '@mui/material/Stack';
import {QuickFilters, StatusChip, Tag, dictionaryEntryOf, useToolkitTranslation} from '@stackcraftmx/calcita';

// El estado de un pedido como llega del API → su texto (dictionaries:orderStatus.<valor>), su explicación y su color.
// El color es información: verde lo que terminó bien, ámbar lo que espera, rojo lo que no siguió.
const ORDER_STATUS = {
    pending: dictionaryEntryOf('pending', 'orderStatus.pending', 'warning', {hasShortLabel: true}),
    paid: dictionaryEntryOf('paid', 'orderStatus.paid', 'default'),
    shipped: dictionaryEntryOf('shipped', 'orderStatus.shipped', 'info'),
    delivered: dictionaryEntryOf('delivered', 'orderStatus.delivered', 'success'),
    canceled: dictionaryEntryOf('canceled', 'orderStatus.canceled', 'error'),
};

// conteos de mentira para los filtros rápidos (en la app vienen del servidor)
const QUICK_FILTER_COUNTS = {pending: 13, paid: 14, delivered: 1207};

const FrameworkTags = () => {
    const {t} = useToolkitTranslation('catalog');
    const [quickFilter, setQuickFilter] = useState('');

    const totalCount = Object.values(QUICK_FILTER_COUNTS).reduce((sum, count) => sum + count, 0);
    const quickFilterOptions = [
        {value: '', label: t('chips.framework.all'), count: totalCount},
        ...Object.entries(QUICK_FILTER_COUNTS).map(([status, count]) => ({value: status, label: t(`chips.framework.status.${status}`), count})),
    ];

    return (
        <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
                <Tag label={t('samples.retail')} tooltip={t('chips.framework.tagTooltip')} />
                <Tag label={t('samples.wholesale')} color="info" tooltip={t('chips.framework.tagTooltip')} />
            </Stack>
            <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
                {Object.keys(ORDER_STATUS).map((status) => <StatusChip key={status} dictionary={ORDER_STATUS} value={status} />)}
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
                {Object.keys(ORDER_STATUS).map((status) => <StatusChip key={status} dictionary={ORDER_STATUS} value={status} variant="chip" />)}
            </Stack>
            <QuickFilters value={quickFilter} onChange={setQuickFilter} options={quickFilterOptions}
                          caption={t('chips.framework.quickCaption')} ariaLabel={t('chips.framework.quickCaption')} />
        </Stack>
    );
};

export default FrameworkTags;
