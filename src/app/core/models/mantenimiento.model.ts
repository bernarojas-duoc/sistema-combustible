/**
 * Tipos de mantenimiento preventivo que se controlan por kilometraje.
 */
export type TipoMantenimiento = 'aceite' | 'filtros' | 'frenos' | 'neumaticos';

/**
 * Configuración del plan de mantenimiento de un bus para un tipo concreto.
 * Define cada cuántos kilómetros debe realizarse y el odómetro de la última
 * intervención registrada.
 */
export interface PlanMantenimiento {
  /** Tipo de mantenimiento controlado. */
  tipo: TipoMantenimiento;
  /** Intervalo en kilómetros entre intervenciones (ej. 20000 para el aceite). */
  intervaloKm: number;
  /** Odómetro (km) en el que se realizó la última intervención de este tipo. */
  kmUltimo: number;
}

/** Estado de una alerta de mantenimiento según los km restantes. */
export type EstadoMantenimiento = 'ok' | 'pronto' | 'vencido';

/**
 * Resultado calculado de una alerta de mantenimiento para un bus y tipo dados.
 * No se persiste: se deriva del odómetro actual del bus y de su plan.
 */
export interface AlertaMantenimiento {
  busId: number;
  patente: string;
  modelo: string;
  tipo: TipoMantenimiento;
  /** Etiqueta legible del tipo (ej. "Cambio de aceite"). */
  etiqueta: string;
  /** Odómetro actual estimado del bus. */
  odometroActual: number;
  /** Odómetro en que toca el próximo mantenimiento. */
  odometroProximo: number;
  /** Km recorridos desde la última intervención. */
  kmRecorridos: number;
  /** Km que faltan para el próximo mantenimiento (negativo si está vencido). */
  kmRestantes: number;
  /** Estado calculado según los km restantes. */
  estado: EstadoMantenimiento;
}

/**
 * Etiquetas legibles e iconos por tipo de mantenimiento, para mostrar en la UI.
 */
export const TIPOS_MANTENIMIENTO: Record<TipoMantenimiento, { etiqueta: string; icono: string }> = {
  aceite: { etiqueta: 'Cambio de aceite', icono: 'bi-droplet' },
  filtros: { etiqueta: 'Cambio de filtros', icono: 'bi-funnel' },
  frenos: { etiqueta: 'Revisión de frenos', icono: 'bi-disc' },
  neumaticos: { etiqueta: 'Neumáticos', icono: 'bi-record-circle' },
};
