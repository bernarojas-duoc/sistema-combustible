/**
 * Estado del ciclo de vida de una carga de combustible.
 * - `pendiente`: registrada, esperando revisión del supervisor.
 * - `aprobado`: validada por el supervisor.
 * - `alerta`: consumo anómalo detectado automáticamente.
 * - `rechazado`: marcada como inválida por el supervisor (con motivo).
 */
export type EstadoCarga = 'pendiente' | 'aprobado' | 'alerta' | 'rechazado';

/**
 * Representa una carga (abastecimiento) de combustible de un bus.
 */
export interface Carga {
  /** Identificador único autoincremental. */
  id: number;
  /** Bus al que corresponde la carga. */
  busId: number;
  /** Conductor que realizó la carga (dato de la flota, no un usuario). */
  conductorId: number;
  /** Litros cargados. */
  litros: number;
  /** Precio por litro en pesos (CLP) al momento de la carga. */
  precioLitro: number;
  /** Odómetro del bus al momento de cargar. */
  odometro: number;
  /** Odómetro de la carga anterior, para calcular los km recorridos. */
  odometroAnterior: number;
  /** Bencinera donde se realizó el abastecimiento (ej. Copec — Calama). */
  bencinera: string;
  /** Fecha de la carga en formato YYYY-MM-DD. */
  fecha: string;
  /** Observaciones opcionales de la carga. */
  observaciones?: string;
  /** Estado de la carga. */
  estado: EstadoCarga;
  /** Motivo del rechazo (solo cuando estado === 'rechazado'). */
  motivoRechazo?: string;
}
