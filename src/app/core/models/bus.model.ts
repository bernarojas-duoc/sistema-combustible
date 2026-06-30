import { PlanMantenimiento } from './mantenimiento.model';

/**
 * Representa un bus de la flota junto con su plan de mantenimiento preventivo.
 */
export interface Bus {
  /** Identificador único autoincremental. */
  id: number;
  /** Patente del vehículo (ej. BJKP-12). */
  patente: string;
  /** Número de chasis (VIN) del vehículo. */
  numeroChasis: string;
  /** Modelo / marca del bus. */
  modelo: string;
  /** Capacidad del estanque de combustible en litros. */
  capacidadTanque: number;
  /** Rendimiento esperado en km por litro, usado para detectar consumos anómalos. */
  kmLitroEsperado: number;
  /** Indica si el bus está operativo. */
  activo: boolean;
  /**
   * Plan de mantenimiento preventivo por kilometraje. Cada entrada define el
   * intervalo y el odómetro de la última intervención de un tipo.
   */
  planMantenimiento: PlanMantenimiento[];
}
