import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

const CARD_WIDTH = 320;

// la forma de lo que viene mientras carga: la página no brinca cuando llegan los datos
const LoadingSkeleton = () => (
    <Stack spacing={1} sx={{width: CARD_WIDTH, maxWidth: '100%'}}>
        <Stack direction="row" spacing={1.5} sx={{alignItems: 'center'}}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{flexGrow: 1}}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
            </Box>
        </Stack>
        <Skeleton variant="rounded" height={96} />
    </Stack>
);

export default LoadingSkeleton;
