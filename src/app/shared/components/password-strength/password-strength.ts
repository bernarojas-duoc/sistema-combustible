import { Component, Input, computed, signal } from '@angular/core';
import { Validadores } from '../../validators/validadores';

/** Definición visual de cada nivel de fuerza. */
const NIVELES = [
  { pct: 0, clase: 'bg-secondary', label: '' },
  { pct: 20, clase: 'bg-danger', label: 'Muy débil' },
  { pct: 40, clase: 'bg-warning', label: 'Débil' },
  { pct: 60, clase: 'bg-info', label: 'Moderada' },
  { pct: 80, clase: 'bg-primary', label: 'Fuerte' },
  { pct: 100, clase: 'bg-success', label: 'Muy fuerte' },
];

/**
 * Indicador visual de fuerza de contraseña. Recibe el valor de la contraseña
 * por `@Input` y muestra una barra de progreso con su nivel. Ejemplo de paso
 * de datos de un componente padre a uno hijo.
 */
@Component({
  selector: 'app-password-strength',
  standalone: true,
  template: `
    <div class="progress strength-bar mt-2">
      <div class="progress-bar" [class]="nivel().clase" [style.width.%]="nivel().pct"></div>
    </div>
    @if (nivel().label) {
      <small class="text-muted">Seguridad: {{ nivel().label }}</small>
    }
  `,
})
export class PasswordStrength {
  private _valor = signal('');

  /** Valor actual de la contraseña a evaluar. */
  @Input({ required: true })
  set valor(v: string) {
    this._valor.set(v ?? '');
  }

  /** Nivel visual (color, porcentaje, etiqueta) según la fuerza calculada. */
  nivel = computed(() => NIVELES[Math.min(Validadores.fuerza(this._valor()), 5)]);
}
