// Cambia los textos de un namespace del paquete para todo lo que va adentro: un módulo con su propio vocabulario
// («pedido» en lugar de «registro» en todas sus tablas) sin tocar el idioma completo del proveedor.
//
//   <ComponentTexts namespace="table" texts={{count: {records_one: '{{total}} pedido', records_other: '{{total}} pedidos'}}}>
//       <ServerTable … />
//   </ComponentTexts>
//
// `texts` lleva la misma forma y las mismas llaves que ese namespace en los textos del paquete (src/locales/es.js), con sus
// plurales (_one, _other) y {{variables}}, ya en el idioma de la pantalla. Lo que no trae sale del proveedor y del paquete.
// Los componentes con varios textos reciben lo mismo en su prop `texts`, que gana sobre esto.
//
// Genérico del paquete: function (regla de la casa).
import {useContext, useMemo} from 'react';

import {ComponentTextsContext} from '@/toolkit/componentTextsContext.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {object} props
 * @param {string} props.namespace 'table', 'common', 'account'… (los de src/locales/es.js)
 * @param {object} [props.texts] los textos que cambian, con la forma de ese namespace
 * @param {import('react').ReactNode} props.children
 */
export default function ComponentTexts({namespace, texts, children, ...unknownProps}) {
    warnUnknownProps('ComponentTexts', unknownProps);
    const parent = useContext(ComponentTextsContext);
    const layer = useMemo(() => ({namespace, texts, parent}), [namespace, texts, parent]);

    return <ComponentTextsContext value={layer}>{children}</ComponentTextsContext>;
}
