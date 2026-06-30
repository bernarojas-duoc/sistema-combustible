import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional que protege las rutas privadas: si no hay sesión activa,
 * redirige al login. Sustituye al `requireAuth()` del antiguo `auth.js`.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticado()) return true;
  return router.createUrlTree(['/login']);
};
