/**
 * Representa a un conductor de la flota. A diferencia de un {@link Usuario}, el
 * conductor **no inicia sesión** en el sistema: es solo un dato que mantienen el
 * supervisor y el administrativo, y al que se asocian las cargas de combustible.
 */
export interface Conductor {
  /** Identificador único autoincremental. */
  id: number;
  /** Nombre completo del conductor. */
  nombre: string;
  /** RUT chileno con formato 12.345.678-9. */
  rut: string;
  /** Teléfono de contacto. */
  telefono: string;
  /** Clase de licencia de conducir profesional (ej. A3, A4, A5). */
  licencia: string;
  /** Tipo de turno del conductor (Diurno, Nocturno o Rotativo). */
  tipoTurno: string;
  /** Indica si el conductor está activo en la flota. */
  activo: boolean;
}
