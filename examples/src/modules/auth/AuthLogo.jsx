// El logo de las pantallas de entrar (el mismo de la barra).
//
// Lo renderiza la app: arrow (regla de la casa).
import Box from '@mui/material/Box';

import {publicUrlOf} from '@/core';

export const AuthLogo = () => <Box component="img" src={publicUrlOf('branding/stackcraft-logo.svg')} alt="" sx={{width: 28, height: 28, borderRadius: '50%'}} />;
