import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Colección de validadores reactivos reutilizables para los formularios de la
 * aplicación. Portan las reglas del antiguo `validaciones.js` al sistema de
 * formularios reactivos de Angular.
 */
export class Validadores {
  /**
   * Valida una contraseña con 4 reglas de seguridad:
   * mínimo 8 caracteres, máximo 20, al menos un número y al menos un carácter
   * especial. Devuelve `{ password: string[] }` con la lista de errores.
   */
  static password(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor: string = control.value || '';
      const errores: string[] = [];
      if (valor.length < 8) errores.push('Mínimo 8 caracteres');
      if (valor.length > 20) errores.push('Máximo 20 caracteres');
      if (!/[0-9]/.test(valor)) errores.push('Debe contener al menos un número');
      if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(valor)) {
        errores.push('Debe contener al menos un carácter especial (!@#$%...)');
      }
      return errores.length ? { password: errores } : null;
    };
  }

  /** Valida el formato de RUT chileno: 12.345.678-9. */
  static rut(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor: string = control.value || '';
      return /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(valor)
        ? null
        : { rut: 'RUT inválido (formato: 12.345.678-9)' };
    };
  }

  /** Valida el formato de teléfono chileno (ej: +56 9 1234 5678). */
  static telefono(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor: string = (control.value || '').replace(/\s/g, '');
      return /^(\+56)?[29]\d{8}$/.test(valor)
        ? null
        : { telefono: 'Teléfono inválido (ej: +56 9 1234 5678)' };
    };
  }

  /**
   * Valida que dos controles del formulario coincidan (ej. contraseña y su
   * confirmación). Se aplica a nivel de FormGroup.
   *
   * @param campo nombre del control original.
   * @param confirmacion nombre del control de confirmación.
   */
  static coinciden(campo: string, confirmacion: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const a = group.get(campo)?.value;
      const b = group.get(confirmacion)?.value;
      return a === b ? null : { coinciden: 'Las contraseñas no coinciden' };
    };
  }

  /**
   * Calcula la fuerza de una contraseña (0 a 5) para el indicador visual.
   * Suma puntos por longitud, números, símbolos y mayúsculas.
   */
  static fuerza(valor: string): number {
    let puntos = 0;
    if (valor.length >= 8) puntos++;
    if (valor.length >= 12) puntos++;
    if (/[0-9]/.test(valor)) puntos++;
    if (/[!@#$%^&*]/.test(valor)) puntos++;
    if (/[A-Z]/.test(valor)) puntos++;
    return puntos;
  }
}
