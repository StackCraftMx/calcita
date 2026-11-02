// Las insignias: un ícono y un texto corto con el color de lo que significan, para destacar algo de un registro en su
// encabezado o en su tarjeta. Tres estilos: con borde (resalta), tenue (varias juntas sin ruido) y sin caja (dentro de un
// renglón). Mejor desde un diccionario: el texto, la explicación, el color y el ícono se escriben UNA vez.
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import {ICON_BADGE_VARIANT, IconBadge, dictionaryEntryOf} from '@stackcraftmx/calcita';

// 1. Desde un diccionario: la entrada trae su ícono (los textos van en el namespace dictionaries, paymentMethod.card…)
const PAYMENT_METHOD = {
    card: dictionaryEntryOf('card', 'paymentMethod.card', 'default', {icon: CreditCardOutlinedIcon}),
    transfer: dictionaryEntryOf('transfer', 'paymentMethod.transfer', 'default', {icon: AccountBalanceOutlinedIcon}),
};

const IconBadges = () => (
    <Stack spacing={2.5}>
        {/* 2. Los tres estilos */}
        <Stack direction="row" useFlexGap sx={{gap: 1, flexWrap: 'wrap', alignItems: 'center'}}>
            <IconBadge icon={VerifiedUserOutlinedIcon} label="Envío asegurado" tone="success" tooltip="Cubre el valor del pedido si se pierde" />
            <IconBadge icon={EventRepeatOutlinedIcon} label="3 meses sin intereses" tone="info" variant={ICON_BADGE_VARIANT.soft} />
            <IconBadge icon={ReceiptLongOutlinedIcon} label="Requiere factura" tone="primary" variant={ICON_BADGE_VARIANT.plain} />
        </Stack>
        {/* 3. Los colores dicen algo: verde lo bueno, ámbar lo que pide atención, rojo lo que no siguió */}
        <Stack direction="row" useFlexGap sx={{gap: 1, flexWrap: 'wrap'}}>
            <IconBadge icon={Inventory2OutlinedIcon} label="Frágil" tone="warning" />
            <IconBadge icon={Inventory2OutlinedIcon} label="Sin existencias" tone="error" variant={ICON_BADGE_VARIANT.soft} />
            <IconBadge icon={Inventory2OutlinedIcon} label="Producto de temporada" tone="default" variant={ICON_BADGE_VARIANT.soft} />
            <IconBadge icon={VerifiedUserOutlinedIcon} label="Grande, para un encabezado" tone="success" size="medium" />
        </Stack>
        {/* 4. Desde el diccionario: el texto y la explicación cambian de idioma solos */}
        <Stack direction="row" useFlexGap sx={{gap: 1, flexWrap: 'wrap', alignItems: 'center'}}>
            <IconBadge dictionary={PAYMENT_METHOD} value="card" variant={ICON_BADGE_VARIANT.soft} />
            <IconBadge dictionary={PAYMENT_METHOD} value="transfer" variant={ICON_BADGE_VARIANT.soft} />
            <Typography variant="body2" color="text.secondary">
                Pagado con <IconBadge dictionary={PAYMENT_METHOD} value="card" variant={ICON_BADGE_VARIANT.plain} /> el 2 de noviembre.
            </Typography>
        </Stack>
    </Stack>
);

export default IconBadges;
