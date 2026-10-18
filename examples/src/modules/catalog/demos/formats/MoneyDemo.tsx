// Dinero sin problemas de decimales (Money de /money): guarda centavos enteros, como el backend. 0.1 + 0.2 en JavaScript da
// 0.30000000000000004; con Money da 0.30. Se lee del JSON en texto («2899.88»), se opera y se pinta con su moneda.
// Multiplicar y dividir redondean con la regla que se elija (por omisión, la mitad se aleja del cero).
import {DefinitionList} from '@stackcraftmx/calcita';
import {MONEY_ROUNDING, Money} from '@stackcraftmx/calcita/money';

// lo que llegaría del API: los importes en texto, nunca como número de punto flotante
const ORDER = {subtotal: '2499.90', shipping: '149.00', ivaRate: '0.16'};

const MoneyDemo = () => {
    // 1. Leer los montos del texto del JSON
    const subtotal = Money.fromString(ORDER.subtotal);
    const shipping = Money.fromString(ORDER.shipping);
    // 2. Operar: la tasa también en texto; dividir con la regla de redondeo que pida el negocio
    const iva = subtotal.plus(shipping).times(ORDER.ivaRate);
    const total = subtotal.plus(shipping).plus(iva);
    const threePayments = total.dividedBy(3, {rounding: MONEY_ROUNDING.halfEven});

    // 3. Pintar con format() y mandar al API con JSON.stringify (va como texto exacto)
    return (
        <DefinitionList entries={[
            {label: '0.1 + 0.2 (JavaScript)', value: String(0.1 + 0.2)},
            {label: "Money.fromString('0.10').plus(Money.fromString('0.20'))", value: Money.fromString('0.10').plus(Money.fromString('0.20')).format()},
            {label: 'Subtotal + envío', value: subtotal.plus(shipping).format()},
            {label: 'IVA (16 %)', value: iva.format()},
            {label: 'Total', value: total.format()},
            {label: 'En 3 pagos', value: threePayments.format()},
            {label: 'Para mandarlo al API', value: JSON.stringify({total})},
        ]} />
    );
};

export default MoneyDemo;
