// La sesión en una pantalla propia: useAccount da quién está dentro, cómo volver a leer la sesión y cómo salir.
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useAccount} from '@stackcraftmx/calcita/account';

const AccountGreeting = () => {
    const {session, signOut} = useAccount();
    if (!session) {
        return null;
    }
    return (
        <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
            <Typography>Hola, {session.user.name.split(' ')[0]}</Typography>
            <Button onClick={signOut}>Salir</Button>
        </Stack>
    );
};

export default AccountGreeting;
