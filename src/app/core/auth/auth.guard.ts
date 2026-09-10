import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { ROL } from '../models/usuario.model';

/** Requiere sesión iniciada; si no, manda al login guardando el destino. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/ingresar'], {
        queryParams: { returnUrl: state.url },
      });
};

/** Requiere rol Administrador. */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.hasRole(ROL.ADMIN)) return true;
  if (auth.isAuthenticated()) return router.createUrlTree(['/']);
  return router.createUrlTree(['/ingresar'], {
    queryParams: { returnUrl: state.url },
  });
};

/** Para login/registro: si ya hay sesión, no tiene sentido mostrarlos. */
export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? router.createUrlTree(['/']) : true;
};
