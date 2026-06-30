import { Pipe, PipeTransform } from '@angular/core';

/**
 * Convierte una fecha en formato `YYYY-MM-DD` a `dd/mm/yyyy` sin aplicar
 * conversión de zona horaria (evita el desfase de un día que produce el
 * DatePipe nativo al interpretar la cadena como UTC).
 *
 * @example {{ carga.fecha | fecha }} // 29/06/2026
 */
@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) return '-';
    const [y, m, d] = valor.split('-');
    if (!y || !m || !d) return valor;
    return `${d}/${m}/${y}`;
  }
}
