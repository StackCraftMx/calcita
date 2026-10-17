// La navegación de react-router para ToolkitProvider: tiene justo las tres piezas que piden los componentes del paquete.
//
//   <ToolkitProvider navigation={reactRouterNavigation}>
//
// Va dentro del router (RouterProvider o BrowserRouter), porque sus hooks leen el router.
import {Link, useLocation, useNavigate} from 'react-router';

export const reactRouterNavigation = Object.freeze({useNavigate, useLocation, Link});
