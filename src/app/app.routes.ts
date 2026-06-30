import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { rolGuard } from './core/guards/rol.guard';
import { Layout } from './shared/components/layout/layout';

/**
 * Tabla de rutas de la aplicación. Las páginas de autenticación se muestran sin
 * layout; el resto cuelga del componente `Layout` (navbar + contenido) y queda
 * protegido por `authGuard` y, donde corresponde, por `rolGuard`.
 */
export const routes: Routes = [
  // --- Autenticación (públicas) ---
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then((m) => m.Login) },
  { path: 'registro', loadComponent: () => import('./features/auth/register/register').then((m) => m.Register) },
  { path: 'recuperar', loadComponent: () => import('./features/auth/recover/recover').then((m) => m.Recover) },

  // --- Área privada (requiere sesión) ---
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'perfil', loadComponent: () => import('./features/profile/profile').then((m) => m.Profile) },

      // Administrativo: ingreso y mantención de datos (conductores, buses, cargas).
      {
        path: 'administrativo',
        canActivate: [rolGuard('administrativo')],
        children: [
          { path: 'dashboard', loadComponent: () => import('./features/administrativo/dashboard/dashboard').then((m) => m.AdministrativoDashboard) },
          { path: 'nueva-carga', loadComponent: () => import('./features/carga/nueva-carga/nueva-carga').then((m) => m.NuevaCarga) },
          { path: 'conductores', loadComponent: () => import('./features/supervisor/conductores/conductores').then((m) => m.Conductores) },
          { path: 'buses', loadComponent: () => import('./features/supervisor/buses/buses').then((m) => m.Buses) },
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
        ],
      },

      // Supervisor: supervisión de la operación (análisis, alertas, gasto, mantención).
      {
        path: 'supervisor',
        canActivate: [rolGuard('supervisor')],
        children: [
          { path: 'dashboard', loadComponent: () => import('./features/supervisor/dashboard/dashboard').then((m) => m.SupervisorDashboard) },
          { path: 'historial', loadComponent: () => import('./features/supervisor/historial-general/historial-general').then((m) => m.HistorialGeneral) },
          { path: 'alertas', loadComponent: () => import('./features/supervisor/alertas/alertas').then((m) => m.Alertas) },
          { path: 'gasto', loadComponent: () => import('./features/supervisor/reporte-gasto/reporte-gasto').then((m) => m.ReporteGasto) },
          { path: 'mantenimiento', loadComponent: () => import('./features/supervisor/mantenimiento/mantenimiento').then((m) => m.Mantenimiento) },
          { path: 'nueva-carga', loadComponent: () => import('./features/carga/nueva-carga/nueva-carga').then((m) => m.NuevaCarga) },
          { path: 'buses', loadComponent: () => import('./features/supervisor/buses/buses').then((m) => m.Buses) },
          { path: 'conductores', loadComponent: () => import('./features/supervisor/conductores/conductores').then((m) => m.Conductores) },
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
        ],
      },
    ],
  },

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
