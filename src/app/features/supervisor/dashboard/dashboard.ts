import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CargaService, ResumenMensual } from '../../../core/services/carga.service';
import { BusService } from '../../../core/services/bus.service';
import { ConductorService } from '../../../core/services/conductor.service';
import { MantenimientoService } from '../../../core/services/mantenimiento.service';
import { Carga } from '../../../core/models/carga.model';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { EstadoBadge } from '../../../shared/components/estado-badge/estado-badge';
import { BarChart } from '../../../shared/components/bar-chart/bar-chart';

/** Consumo agregado de un bus en el mes. */
interface ConsumoBus {
  patente: string;
  litros: number;
  pct: number;
}

/** Métrica seleccionable para el gráfico mensual. */
export type MetricaMensual = 'gasto' | 'costoPorKm' | 'litros';

/**
 * Panel principal del supervisor: indicadores operacionales de la flota, gasto
 * del mes, últimas cargas, consumo por bus y resumen de alertas y mantenciones.
 */
@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink, FechaPipe, EstadoBadge, BarChart],
  templateUrl: './dashboard.html',
})
export class SupervisorDashboard implements OnInit {
  private cargaService = inject(CargaService);
  private busService = inject(BusService);
  private conductorService = inject(ConductorService);
  private mantenimientoService = inject(MantenimientoService);

  cargasMes = 0;
  litrosMes = 0;
  gastoMes = 0;
  alertasActivas = 0;
  pendientes = 0;
  mantencionesPendientes = 0;

  recientes: Carga[] = [];
  consumoBuses: ConsumoBus[] = [];
  alertas: Carga[] = [];

  /** Resumen mensual (orden cronológico) que alimenta el gráfico. */
  resumenMensual: ResumenMensual[] = [];
  /** Métrica activa del gráfico (gasto total, costo por km o litros). */
  metrica: MetricaMensual = 'gasto';

  // Datos del gráfico como campos con referencia estable: solo cambian al
  // cambiar de métrica, evitando recrear el gráfico en cada ciclo de cambios.
  chartLabels: string[] = [];
  chartValores: number[] = [];
  chartPrefijo = '$';
  chartTitulo = 'Gasto total (CLP)';

  ngOnInit(): void {
    const todas = this.cargaService.getAllOrdenadas();
    const mes = new Date().toISOString().slice(0, 7);
    const delMes = todas.filter((c) => c.fecha.startsWith(mes));

    this.cargasMes = delMes.length;
    this.litrosMes = delMes.reduce((s, c) => s + c.litros, 0);
    this.gastoMes = delMes.reduce((s, c) => s + this.cargaService.calcularCosto(c), 0);
    this.alertasActivas = todas.filter((c) => c.estado === 'alerta').length;
    this.pendientes = todas.filter((c) => c.estado === 'pendiente').length;
    this.mantencionesPendientes = this.mantenimientoService.getAlertas(true).length;

    this.recientes = todas.slice(0, 6);
    this.alertas = todas.filter((c) => c.estado === 'alerta');

    this.consumoBuses = this.busService.getActivos().map((bus) => {
      const litros = delMes.filter((c) => c.busId === bus.id).reduce((s, c) => s + c.litros, 0);
      return {
        patente: bus.patente,
        litros,
        pct: Math.min(100, Math.round((litros / (bus.capacidadTanque * 4)) * 100)),
      };
    });

    this.resumenMensual = this.cargaService.resumenPorMes();
    this.chartLabels = this.resumenMensual.map((m) => m.etiqueta);
    this.aplicarMetrica();
  }

  /** Cambia la métrica del gráfico y recalcula sus datos. */
  setMetrica(m: MetricaMensual): void {
    this.metrica = m;
    this.aplicarMetrica();
  }

  /** Recalcula los datos del gráfico (referencias nuevas solo aquí). */
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

  patente(busId: number): string {
    return this.busService.getById(busId)?.patente ?? '-';
  }

  kmEsperado(busId: number): number | string {
    return this.busService.getById(busId)?.kmLitroEsperado ?? '-';
  }

  conductor(id: number): string {
    return this.conductorService.nombre(id).split(' ')[0];
  }

  consumo(c: Carga): number | null {
    return this.cargaService.calcularConsumo(c);
  }
}
