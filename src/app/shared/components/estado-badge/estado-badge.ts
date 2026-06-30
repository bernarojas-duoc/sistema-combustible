import { Component, Input } from '@angular/core';
import { EstadoCarga } from '../../../core/models/carga.model';

/**
 * Muestra un badge con el color y la etiqueta correspondiente al estado de una
 * carga. Si la carga está rechazada y se le pasa un motivo, muestra además un
 * icono con tooltip. Recibe los datos del componente padre mediante `@Input`,
 * ilustrando el paso de datos entre componentes.
 */
@Component({
  selector: 'app-estado-badge',
  standalone: true,
  template: `
    <span class="badge" [class]="clase">{{ etiqueta }}</span>
    @if (estado === 'rechazado' && motivo) {
      <i
        class="bi bi-info-circle text-muted ms-1"
        role="button"
        [title]="motivo"
        aria-label="Motivo del rechazo"
      ></i>
    }
  `,
})
export class EstadoBadge {
  /** Estado de la carga a representar. */
  @Input({ required: true }) estado!: EstadoCarga;
  /** Motivo del rechazo (opcional, solo relevante si estado === 'rechazado'). */
  @Input() motivo?: string;

  /** Clase Bootstrap del badge según el estado. */
  get clase(): string {
    const map: Record<EstadoCarga, string> = {
      aprobado: 'bg-success',
      pendiente: 'bg-secondary',
      alerta: 'bg-danger',
      rechazado: 'bg-dark',
    };
    return map[this.estado] ?? 'bg-secondary';
  }

  /** Etiqueta legible del estado. */
  get etiqueta(): string {
    const map: Record<EstadoCarga, string> = {
      aprobado: 'Aprobado',
      pendiente: 'Pendiente',
      alerta: 'Alerta',
      rechazado: 'Rechazado',
    };
    return map[this.estado] ?? this.estado;
  }
}
