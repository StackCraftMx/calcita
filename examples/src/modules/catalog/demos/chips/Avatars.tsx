import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Stack from '@mui/material/Stack';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {initialsOf} from '@stackcraftmx/calcita';

// personas de mentira
const SAMPLE_PEOPLE = ['Ana Martínez', 'Luis Herrera', 'Mónica Vega', 'Bruno Díaz', 'Irene Campos', 'Héctor Navarro'];
// chico en listas densas, el de omisión y el de un encabezado (px)
const AVATAR_SIZES = [28, 40, 56];
const AVATAR_SHAPES = ['circular', 'rounded', 'square'] as const;
// cuántos enseña el grupo antes del «+N»
const AVATAR_GROUP_MAX = 4;

// initialsOf salta «de», «la»…: «Usuario de Ejemplo» → UE
const Avatars = () => (
    <Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} sx={{alignItems: 'center'}}>
            {SAMPLE_PEOPLE.slice(0, 3).map((person) => <Avatar key={person} alt={person}>{initialsOf(person)}</Avatar>)}
            <Avatar><PersonOutlineIcon /></Avatar>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{alignItems: 'center'}}>
            {AVATAR_SIZES.map((size) => (
                <Avatar key={size} sx={{width: size, height: size, fontSize: size * 0.4}}>{initialsOf(SAMPLE_PEOPLE[1])}</Avatar>
            ))}
            {AVATAR_SHAPES.map((shape) => <Avatar key={shape} variant={shape}>{initialsOf(SAMPLE_PEOPLE[2])}</Avatar>)}
        </Stack>
        <AvatarGroup max={AVATAR_GROUP_MAX} sx={{justifyContent: 'flex-end'}}>
            {SAMPLE_PEOPLE.map((person) => <Avatar key={person} alt={person}>{initialsOf(person)}</Avatar>)}
        </AvatarGroup>
    </Stack>
);

export default Avatars;
