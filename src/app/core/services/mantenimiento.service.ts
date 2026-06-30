import { Injectable, inject } from '@angular/core';
import { BusService } from './bus.service';
import { CargaService } from './carga.service';
import {
  AlertaMantenimiento,
  EstadoMantenimiento,
  TIPOS_MANTENIMIENTO,
} from '../models/mantenimiento.model';

/** Km de antelación con que una alerta pasa a estado "pronto". */
const UMBRAL_PRONTO_KM = 2000;

/**
 * Calcula las alertas de mantenimiento preventivo de la flota a partir del
 * odómetro actual de cada bus y de su plan de mantenimiento por kilometraje
 * (cambio de aceite, filtros, frenos y neumáticos). Es una funcionalidad nueva
 * respecto a la versión vanilla.
 */
@Injectable({ providedIn: 'root' })
export class MantenimientoService {
  private busService = inject(BusService);
  private cargaService = inject(CargaService);

  /**
   * Genera la lista completa de alertas de mantenimiento de los buses activos.
   * @param soloPendientes si es `true`, omite las que están en estado `ok`.
   */
  getAlertas(soloPendientes = false): AlertaMantenimiento[] {
    const alertas: AlertaMantenimiento[] = [];

    for (const bus of this.busService.getActivos()) {
      const odometroActual = this.cargaService.odometroActual(bus.id);
      for (const plan of bus.planMantenimiento) {
        const odometroProximo = plan.kmUltimo + plan.intervaloKm;
        const kmRecorridos = odometroActual - plan.kmUltimo;
        const kmRestantes = odometroProximo - odometroActual;
        const estado = this.calcularEstado(kmRestantes);

        if (soloPendientes && estado === 'ok') continue;

        alertas.push({
          busId: bus.id,
          patente: bus.patente,
          modelo: bus.modelo,
          tipo: plan.tipo,
          etiqueta: TIPOS_MANTENIMIENTO[plan.tipo].etiqueta,
          odometroActual,
          odometroProximo,
          kmRecorridos,
          kmRestantes,
          estado,
        });
      }
    }

    // Ordena por urgencia: primero lo vencido, luego lo que vence antes.
    return alertas.sort((a, b) => a.kmRestantes - b.kmRestantes);
  }

  /** Determina el estado de una alerta según los km restantes. */
  private calcularEstado(kmRestantes: number): EstadoMantenimiento {
    if (kmRestantes <= 0) return 'vencido';
    if (kmRestantes <= UMBRAL_PRONTO_KM) return 'pronto';
    return 'ok';
  }
}
