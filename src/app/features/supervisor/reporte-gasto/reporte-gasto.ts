import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CargaService, ResumenMensual } from '../../../core/services/carga.service';
import { BusService } from '../../../core/services/bus.service';
import { Carga } from '../../../core/models/carga.model';
import { BarChart } from '../../../shared/components/bar-chart/bar-chart';

/** Métrica seleccionable para el gráfico mensual. */
export type MetricaMensual = 'gasto' | 'costoPorKm' | 'litros';

/** Gasto agregado de un periodo (mes o bus). */
interface GastoFila {
  clave: string;
  etiqueta: string;
  litros: number;
  costo: number;
  cargas: number;
  pct: number;
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Reporte de gasto en combustible. Es la funcionalidad principal solicitada por
 * la empresa: muestra cuánto se gasta mensualmente en combustible, desglosado
 * por mes y por bus. Excluye las cargas rechazadas del cálculo.
 */
@Component({
  selector: 'app-reporte-gasto',
  standalone: true,
  imports: [CommonModule, BarChart],
  templateUrl: './reporte-gasto.html',
})
export class ReporteGasto implements OnInit {
  private cargaService = inject(CargaService);
  private busService = inject(BusService);

  porMes: GastoFila[] = [];
  porBus: GastoFila[] = [];
  gastoTotal = 0;
  gastoMesActual = 0;
  litrosTotal = 0;
  promedioMensual = 0;

  /** Resumen mensual (orden cronológico) para el gráfico de barras. */
  resumenMensual: ResumenMensual[] = [];
  /** Métrica activa del gráfico. */
  metrica: MetricaMensual = 'gasto';

  // Datos del gráfico con referencia estable (solo cambian al cambiar métrica).
  chartLabels: string[] = [];
  chartValores: number[] = [];
  chartPrefijo = '$';
  chartTitulo = 'Gasto total (CLP)';

  ngOnInit(): void {
    const validas = this.cargaService.getAll().filter((c) => c.estado !== 'rechazado');

    this.gastoTotal = validas.reduce((s, c) => s + this.cargaService.calcularCosto(c), 0);
    this.litrosTotal = validas.reduce((s, c) => s + c.litros, 0);

    this.porMes = this.agruparPorMes(validas);
    this.porBus = this.agruparPorBus(validas);
    this.promedioMensual = this.porMes.length ? Math.round(this.gastoTotal / this.porMes.length) : 0;

    const mesActual = new Date().toISOString().slice(0, 7);
    this.gastoMesActual = this.porMes.find((m) => m.clave === mesActual)?.costo ?? 0;

    this.resumenMensual = this.cargaService.resumenPorMes();
    this.chartLabels = this.resumenMensual.map((m) => m.etiqueta);
    this.aplicarMetrica();
  }

  /** Cambia la métrica del gráfico y recalcula sus datos. */
  setMetrica(m: MetricaMensual): void {
    this.metrica = m;
    this.aplicarMetrica();
  }

  private aplicarMetrica(): void {
    this.chartValores = this.resumenMensual.map((m) => m[this.metrica]);
    this.chartPrefijo = this.metrica === 'litros' ? '' : '$';
    this.chartTitulo =
      this.metrica === 'gasto'
        ? 'Gasto total (CLP)'
        : this.metrica === 'costoPorKm'
          ? 'Costo por km (CLP)'
          : 'Litros';
  }

  private agruparPorMes(cargas: Carga[]): GastoFila[] {
    const mapa = new Map<string, GastoFila>();
    for (const c of cargas) {
      const clave = c.fecha.slice(0, 7); // YYYY-MM
      const fila = mapa.get(clave) ?? { clave, etiqueta: this.etiquetaMes(clave), litros: 0, costo: 0, cargas: 0, pct: 0 };
      fila.litros += c.litros;
      fila.costo += this.cargaService.calcularCosto(c);
      fila.cargas++;
      mapa.set(clave, fila);
    }
    const filas = [...mapa.values()].sort((a, b) => b.clave.localeCompare(a.clave));
    const max = Math.max(...filas.map((f) => f.costo), 1);
    filas.forEach((f) => (f.pct = Math.round((f.costo / max) * 100)));
    return filas;
  }

  private agruparPorBus(cargas: Carga[]): GastoFila[] {
    const mapa = new Map<number, GastoFila>();
    for (const c of cargas) {
      const fila = mapa.get(c.busId) ?? {
        clave: String(c.busId),
        etiqueta: this.busService.getById(c.busId)?.patente ?? 'Bus ' + c.busId,
        litros: 0,
        costo: 0,
        cargas: 0,
        pct: 0,
      };
      fila.litros += c.litros;
      fila.costo += this.cargaService.calcularCosto(c);
      fila.cargas++;
      mapa.set(c.busId, fila);
    }
    const filas = [...mapa.values()].sort((a, b) => b.costo - a.costo);
    const max = Math.max(...filas.map((f) => f.costo), 1);
    filas.forEach((f) => (f.pct = Math.round((f.costo / max) * 100)));
    return filas;
  }

  /** Convierte 'YYYY-MM' en una etiqueta legible (ej. 'Jun 2026'). */
  private etiquetaMes(clave: string): string {
    const [y, m] = clave.split('-');
    return `${MESES[Number(m) - 1]} ${y}`;
  }
}
