import { Routes } from '@angular/router';

import { adminGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'ingresar',
    loadComponent: () =>
      import('./features/identidad/login/login').then((m) => m.Login),
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
    ],
  },
  { path: '**', redirectTo: '' },
];
