import {useState} from 'react';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';

// una calificación de mentira con medio punto
const SAMPLE_RATING = 3.5;

const Ratings = () => {
    const [rating, setRating] = useState<number | null>(4);
    return (
        <Stack direction="row" spacing={4} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
            <Rating value={rating} onChange={(event, value) => setRating(value)} />
            <Rating value={SAMPLE_RATING} precision={0.5} readOnly />
            <Rating defaultValue={3} size="small" />
            <Rating defaultValue={3} size="large" />
        </Stack>
    );
};

export default Ratings;
