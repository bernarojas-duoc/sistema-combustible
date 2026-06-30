import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/usuario.model';

/**
 * Fábrica de guards que restringe una ruta a un rol concreto. Si la sesión no
 * tiene el rol requerido, redirige al dashboard correspondiente a su rol.
 *
 * @param rolRequerido rol que la ruta exige (supervisor o administrativo).
 *
 * @example
 * { path: 'supervisor', canActivate: [authGuard, rolGuard('supervisor')] }
 */
export function rolGuard(rolRequerido: Rol): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const sesion = auth.sesion();

    if (!sesion) return router.createUrlTree(['/login']);
    if (sesion.rol === rolRequerido) return true;
    return router.createUrlTree([auth.rutaInicio(sesion.rol)]);
  };
}
