// Cambiar una PARTE de una pieza de Calcita sin pedirle nada al paquete, como en MUI: `slots` pone otro componente en lugar de
// una parte y `slotProps` le da props de más. El nombre de la parte es el mismo de styleOverrides (root, avatar, titles…; la
// lista de cada pieza está en el README). Desde la pantalla o, para toda la app, desde el tema (defaultProps).
import type {ReactNode} from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import {ThemeProvider, createTheme, useTheme} from '@mui/material/styles';
import {RecordCard} from '@stackcraftmx/calcita';

// 1. La parte que se cambia: en lugar del círculo con iniciales, el ícono de la tienda en un cuadro
const StoreAvatar = ({children}: {children?: ReactNode}) => (
    <Avatar variant="rounded" sx={{width: 44, height: 44, bgcolor: 'primary.main'}} aria-label={typeof children === 'string' ? children : undefined}>
        <StorefrontRoundedIcon />
    </Avatar>
);

const PieceSlotsDemo = () => {
    // 3. Para toda la app (aquí, solo para esta tarjeta): en el tema, la tarjeta con más sombra y sin borde
    const outerTheme = useTheme();
    const appTheme = createTheme(outerTheme, {
        components: {CalcitaRecordCard: {defaultProps: {slotProps: {root: {variant: 'elevation', elevation: 3}}}}},
    });

    return (
        <Stack spacing={1.5}>
            {/* 2. Desde la pantalla: otro avatar (slots) y el título como h2 (slotProps) */}
            <RecordCard eyebrow="SUC-014" title="Sucursal Centro" subtitle="Abierta de 9 a 19 h" avatar="Sucursal Centro"
                        slots={{avatar: StoreAvatar}} slotProps={{titles: {'data-zona': 'centro'}}}
                        groups={[{key: 'today', title: 'Hoy', facts: [{label: 'Pedidos', value: '42'}, {label: 'Entregas', value: '38'}]}]} />
            <ThemeProvider theme={appTheme}>
                <RecordCard eyebrow="SUC-015" title="Sucursal Norte" avatar="Sucursal Norte"
                            groups={[{key: 'today', title: 'Hoy', facts: [{label: 'Pedidos', value: '17'}, {label: 'Entregas', value: '15'}]}]} />
            </ThemeProvider>
        </Stack>
    );
};

export default PieceSlotsDemo;
