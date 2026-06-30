import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/** Elemento de menú con ruta, etiqueta e icono. */
interface NavLink {
  ruta: string;
  etiqueta: string;
  icono: string;
}

/**
 * Barra de navegación superior. Muestra los enlaces correspondientes al rol del
 * usuario autenticado, su nombre y el botón de cierre de sesión. Reacciona a la
 * sesión expuesta como signal por el AuthService. Sustituye al `renderNavbar()`
 * del antiguo `auth.js`.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);

  /** Sesión activa (signal). */
  readonly sesion = this.auth.sesion;

  private readonly linksSupervisor: NavLink[] = [
    { ruta: '/supervisor/dashboard', etiqueta: 'Dashboard', icono: 'bi-speedometer2' },
    { ruta: '/supervisor/historial', etiqueta: 'Registros', icono: 'bi-list-ul' },
    { ruta: '/supervisor/alertas', etiqueta: 'Alertas', icono: 'bi-exclamation-triangle' },
    { ruta: '/supervisor/gasto', etiqueta: 'Gasto', icono: 'bi-cash-coin' },
    { ruta: '/supervisor/mantenimiento', etiqueta: 'Mantención', icono: 'bi-tools' },
    { ruta: '/supervisor/nueva-carga', etiqueta: 'Nueva Carga', icono: 'bi-plus-circle' },
    { ruta: '/supervisor/buses', etiqueta: 'Buses', icono: 'bi-bus-front' },
    { ruta: '/supervisor/conductores', etiqueta: 'Conductores', icono: 'bi-people' },
  ];

  private readonly linksAdministrativo: NavLink[] = [
    { ruta: '/administrativo/dashboard', etiqueta: 'Inicio', icono: 'bi-speedometer2' },
    { ruta: '/administrativo/nueva-carga', etiqueta: 'Nueva Carga', icono: 'bi-plus-circle' },
    { ruta: '/administrativo/conductores', etiqueta: 'Conductores', icono: 'bi-people' },
    { ruta: '/administrativo/buses', etiqueta: 'Buses', icono: 'bi-bus-front' },
  ];

  /** Enlaces a mostrar según el rol de la sesión activa. */
  get links(): NavLink[] {
    return this.sesion()?.rol === 'supervisor' ? this.linksSupervisor : this.linksAdministrativo;
  }

  /** Ruta del logo según el rol. */
  get rutaInicio(): string {
    const rol = this.sesion()?.rol;
    return rol ? this.auth.rutaInicio(rol) : '/login';
  }

  /** Cierra sesión y vuelve al login. */
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
