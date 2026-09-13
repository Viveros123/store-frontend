import { Routes } from '@angular/router';

import {
  adminGuard,
  authGuard,
  encargadoGuard,
  noAuthGuard,
  proveedorGuard,
  redirectStaffGuard,
} from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/tienda/tienda-layout').then((m) => m.TiendaLayout),
    children: [
      {
        path: '',
        canActivate: [redirectStaffGuard],
        loadComponent: () =>
          import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'catalogo',
        loadComponent: () =>
          import('./features/tienda/catalogo-page').then(
            (m) => m.CatalogoPage,
          ),
      },
      {
        path: 'catalogo/:id',
        loadComponent: () =>
          import('./features/tienda/producto-detalle-cliente-page').then(
            (m) => m.ProductoDetalleClientePage,
          ),
      },
    ],
  },
  {
    path: 'ingresar',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./features/identidad/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./features/identidad/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'mi-cuenta',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/identidad/mi-cuenta/mi-cuenta').then((m) => m.MiCuenta),
  },
  {
    path: 'mis-reservas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservas/mis-reservas-page').then(
        (m) => m.MisReservasPage,
      ),
  },
  {
    path: 'carrito',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/carrito/carrito-page').then((m) => m.CarritoPage),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ventas/checkout-page').then((m) => m.CheckoutPage),
  },
  {
    path: 'checkout/resultado',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ventas/checkout-resultado-page').then(
        (m) => m.CheckoutResultadoPage,
      ),
  },
  {
    path: 'mis-compras',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ventas/mis-compras-page').then(
        (m) => m.MisComprasPage,
      ),
  },
  {
    path: 'proveedor',
    canActivate: [proveedorGuard],
    loadComponent: () =>
      import('./features/portal-proveedor/proveedor-layout').then(
        (m) => m.ProveedorLayout,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'productos' },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/portal-proveedor/mis-productos-page').then(
            (m) => m.MisProductosPage,
          ),
      },
      {
        path: 'productos/:id',
        loadComponent: () =>
          import('./features/portal-proveedor/mi-producto-detalle-page').then(
            (m) => m.MiProductoDetallePage,
          ),
      },
    ],
  },
  {
    path: 'encargado',
    canActivate: [encargadoGuard],
    loadComponent: () =>
      import('./features/encargado/encargado-layout').then(
        (m) => m.EncargadoLayout,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'reservas' },
      {
        path: 'reservas',
        loadComponent: () =>
          import('./features/encargado/reservas-sucursal-page').then(
            (m) => m.ReservasSucursalPage,
          ),
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./features/inventario/inventario-page').then(
            (m) => m.InventarioPage,
          ),
      },
      {
        path: 'movimientos',
        loadComponent: () =>
          import('./features/inventario/movimientos-page').then(
            (m) => m.MovimientosPage,
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'usuarios' },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/identidad/usuarios/usuarios-page').then(
            (m) => m.UsuariosPage,
          ),
      },
      {
        path: 'sucursales',
        loadComponent: () =>
          import('./features/sucursales/sucursales-page').then(
            (m) => m.SucursalesPage,
          ),
      },
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./features/proveedores/proveedores-page').then(
            (m) => m.ProveedoresPage,
          ),
      },
      {
        path: 'catalogo-base',
        loadComponent: () =>
          import('./features/catalogo/catalogo-base-page').then(
            (m) => m.CatalogoBasePage,
          ),
      },
      {
        path: 'temporadas',
        loadComponent: () =>
          import('./features/temporadas/temporadas-page').then(
            (m) => m.TemporadasPage,
          ),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/productos-page').then(
            (m) => m.ProductosPage,
          ),
      },
      {
        path: 'productos/:id',
        loadComponent: () =>
          import('./features/productos/producto-detalle-page').then(
            (m) => m.ProductoDetallePage,
          ),
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./features/inventario/inventario-page').then(
            (m) => m.InventarioPage,
          ),
      },
      {
        path: 'movimientos',
        loadComponent: () =>
          import('./features/inventario/movimientos-page').then(
            (m) => m.MovimientosPage,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
