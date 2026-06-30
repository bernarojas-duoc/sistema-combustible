/**
 * Roles disponibles en el sistema. Cada rol determina los privilegios y las
 * vistas a las que el usuario tiene acceso.
 * - `supervisor`: supervisa la operación (análisis, alertas, gasto, mantención).
 * - `administrativo`: ingresa y mantiene los datos (conductores, buses, cargas).
 *
 * El conductor **no** es un rol del sistema: es un dato de la flota
 * (ver {@link Conductor}) y no inicia sesión.
 */
export type Rol = 'supervisor' | 'administrativo';

/**
 * Representa a un usuario del sistema (supervisor o administrativo) que inicia
 * sesión. Los conductores se modelan aparte (ver {@link Conductor}).
 */
export interface Usuario {
  /** Identificador único autoincremental. */
  id: number;
  /** Nombre completo del usuario. */
  nombre: string;
  /** Correo electrónico, usado como credencial de inicio de sesión. */
  email: string;
  /** Contraseña (en una app real iría cifrada; aquí es mock en localStorage). */
  password: string;
  /** Rol que define los privilegios del usuario. */
  rol: Rol;
  /** RUT chileno con formato 12.345.678-9. */
  rut: string;
  /** Teléfono de contacto. */
  telefono: string;
  /** Indica si la cuenta está habilitada para iniciar sesión. */
  activo: boolean;
}

/**
 * Datos de la sesión activa que se persisten en localStorage tras el login.
 */
export interface Sesion {
  id: number;
  nombre: string;
  rol: Rol;
}
