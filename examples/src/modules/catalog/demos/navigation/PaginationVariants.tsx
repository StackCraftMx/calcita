import {useState} from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const PAGE_COUNT = 12;

// con vidrio, la página actual va en su gota
const PaginationVariants = () => {
    const [page, setPage] = useState(3);
    return (
        <Stack spacing={2}>
            <Pagination count={PAGE_COUNT} page={page} onChange={(event, value) => setPage(value)} />
            <Pagination variant="outlined" count={PAGE_COUNT} page={page} onChange={(event, value) => setPage(value)} />
            <Pagination shape="rounded" count={PAGE_COUNT} page={page} onChange={(event, value) => setPage(value)} showFirstButton showLastButton />
            <Pagination size="small" count={5} />
            <Pagination size="large" count={5} />
        </Stack>
    );
};

export default PaginationVariants;
