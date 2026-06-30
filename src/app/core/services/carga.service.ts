import { Injectable, inject } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { BusService } from './bus.service';
import { Carga } from '../models/carga.model';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Resumen agregado del combustible de un mes. Permite comparar meses de forma
 * justa: además del gasto total, expone métricas normalizadas (costo por km y
 * por bus) que no dependen del tamaño de la operación.
 */
export interface ResumenMensual {
  /** Clave del mes en formato YYYY-MM. */
  clave: string;
  /** Etiqueta legible (ej. 'Jun 2026'). */
  etiqueta: string;
  /** Gasto total del mes en pesos. */
  gasto: number;
  /** Litros cargados en el mes. */
  litros: number;
  /** Kilómetros recorridos en el mes (suma de km de cada carga). */
  km: number;
  /** Cantidad de buses distintos que cargaron en el mes. */
  buses: number;
  /** Costo por kilómetro recorrido (gasto / km). Métrica comparable. */
  costoPorKm: number;
  /** Gasto promedio por bus activo (gasto / buses). */
  costoPorBus: number;
}

/**
 * Gestiona el CRUD de cargas de combustible y los cálculos derivados de cada
 * carga (consumo km/L, costo, detección de consumo anómalo). Sustituye a las
 * funciones de cargas y a `calcularConsumo`/`esAlerta` del antiguo `data.js`.
 */
@Injectable({ providedIn: 'root' })
export class CargaService {
  private storage = inject(StorageService);
  private busService = inject(BusService);

  /** Lista todas las cargas. */
  getAll(): Carga[] {
    return this.storage.getAll<Carga>(STORAGE_KEYS.cargas);
  }

  /** Lista las cargas ordenadas por fecha descendente (más reciente primero). */
  getAllOrdenadas(): Carga[] {
    return this.getAll().sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  /** Cargas de un conductor concreto. */
  getByConductor(conductorId: number): Carga[] {
    return this.getAll().filter((c) => c.conductorId === Number(conductorId));
  }

  /** Cargas de un bus concreto. */
  getByBus(busId: number): Carga[] {
    return this.getAll().filter((c) => c.busId === Number(busId));
  }

  /** Busca una carga por id. */
  getById(id: number): Carga | undefined {
    return this.getAll().find((c) => c.id === Number(id));
  }

  /** Crea o actualiza una carga. Si no trae id, se asigna uno nuevo. */
  save(carga: Carga): Carga {
    const lista = this.getAll();
    const idx = lista.findIndex((c) => c.id === carga.id);
    if (idx >= 0) {
      lista[idx] = carga;
    } else {
      carga.id = this.storage.nextId(lista);
      lista.push(carga);
    }
    this.storage.saveAll(STORAGE_KEYS.cargas, lista);
    return carga;
  }

  /** Elimina una carga por id. */
  delete(id: number): void {
    this.storage.saveAll(
      STORAGE_KEYS.cargas,
      this.getAll().filter((c) => c.id !== Number(id)),
    );
  }

  // ---------------------------------------------------------------------------
  // Cálculos derivados
  // ---------------------------------------------------------------------------

  /**
   * Calcula el rendimiento km/L de una carga.
   * @returns km por litro con 2 decimales, o `null` si los datos no son válidos.
   */
  calcularConsumo(carga: Pick<Carga, 'odometro' | 'odometroAnterior' | 'litros'>): number | null {
    const km = carga.odometro - carga.odometroAnterior;
    if (km <= 0 || carga.litros <= 0) return null;
    return Number((km / carga.litros).toFixed(2));
  }

  /** Costo total de una carga (litros × precio por litro), en pesos. */
  calcularCosto(carga: Pick<Carga, 'litros' | 'precioLitro'>): number {
    return Math.round(carga.litros * (carga.precioLitro || 0));
  }

  /**
   * Determina si el consumo de una carga es anómalo respecto al rendimiento
   * esperado del bus (fuera del rango -30% / +40%).
   */
  esAlerta(carga: Pick<Carga, 'busId' | 'odometro' | 'odometroAnterior' | 'litros'>): boolean {
    const bus = this.busService.getById(carga.busId);
    if (!bus) return false;
    const consumo = this.calcularConsumo(carga);
    if (!consumo) return false;
    return consumo < bus.kmLitroEsperado * 0.7 || consumo > bus.kmLitroEsperado * 1.4;
  }

  /**
   * Odómetro actual estimado de un bus: el mayor odómetro entre sus cargas no
   * rechazadas. Si no tiene cargas, devuelve 0.
   */
  odometroActual(busId: number): number {
    const previas = this.getByBus(busId).filter((c) => c.estado !== 'rechazado');
    return previas.reduce((max, c) => Math.max(max, c.odometro), 0);
  }

  /**
   * Agrupa el combustible por mes (excluye cargas rechazadas) y calcula, además
   * del gasto total, métricas comparables entre meses (costo por km y por bus).
   * @returns los meses en orden cronológico ascendente.
   */
  resumenPorMes(): ResumenMensual[] {
    const mapa = new Map<string, { gasto: number; litros: number; km: number; buses: Set<number> }>();

    for (const c of this.getAll().filter((x) => x.estado !== 'rechazado')) {
      const clave = c.fecha.slice(0, 7); // YYYY-MM
      const acc = mapa.get(clave) ?? { gasto: 0, litros: 0, km: 0, buses: new Set<number>() };
      acc.gasto += this.calcularCosto(c);
      acc.litros += c.litros;
      acc.km += Math.max(0, c.odometro - c.odometroAnterior);
      acc.buses.add(c.busId);
      mapa.set(clave, acc);
    }

    return [...mapa.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([clave, v]) => {
        const [y, m] = clave.split('-');
        return {
          clave,
          etiqueta: `${MESES[Number(m) - 1]} ${y}`,
          gasto: v.gasto,
          litros: v.litros,
          km: v.km,
          buses: v.buses.size,
          costoPorKm: v.km > 0 ? Math.round(v.gasto / v.km) : 0,
          costoPorBus: v.buses.size > 0 ? Math.round(v.gasto / v.buses.size) : 0,
        };
      });
  }
}
