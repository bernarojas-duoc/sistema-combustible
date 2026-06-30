import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MantenimientoService } from '../../../core/services/mantenimiento.service';
import { BusService } from '../../../core/services/bus.service';
import { AlertaMantenimiento, TIPOS_MANTENIMIENTO, TipoMantenimiento } from '../../../core/models/mantenimiento.model';

/**
 * Panel de mantenimiento preventivo de la flota. Lista las mantenciones por
 * kilometraje (cambio de aceite, filtros, frenos y neumáticos), su estado
 * (al día, por vencer o vencida) y permite registrar una mantención realizada,
 * lo que reinicia el contador de kilómetros del tipo correspondiente.
 */
@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './mantenimiento.html',
})
export class Mantenimiento implements OnInit {
  private mantenimientoService = inject(MantenimientoService);
  private busService = inject(BusService);

  alertas: AlertaMantenimiento[] = [];
  vencidos = 0;
  porVencer = 0;
  alDia = 0;

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.alertas = this.mantenimientoService.getAlertas();
    this.vencidos = this.alertas.filter((a) => a.estado === 'vencido').length;
    this.porVencer = this.alertas.filter((a) => a.estado === 'pronto').length;
    this.alDia = this.alertas.filter((a) => a.estado === 'ok').length;
  }

  icono(tipo: TipoMantenimiento): string {
    return TIPOS_MANTENIMIENTO[tipo].icono;
  }

  /** Clase del badge según el estado de la alerta. */
  claseEstado(estado: string): string {
    return estado === 'vencido' ? 'bg-danger' : estado === 'pronto' ? 'bg-warning text-dark' : 'bg-success';
  }

  etiquetaEstado(estado: string): string {
    return estado === 'vencido' ? 'Vencido' : estado === 'pronto' ? 'Por vencer' : 'Al día';
  }

  /** Porcentaje del intervalo recorrido (para la barra de progreso). */
  progreso(a: AlertaMantenimiento): number {
    const intervalo = a.kmRecorridos + a.kmRestantes; // = intervalo del plan
    return Math.min(100, Math.max(0, Math.round((a.kmRecorridos / (intervalo || 1)) * 100)));
  }

  /**
   * Registra una mantención realizada: fija el odómetro de la última
   * intervención de ese tipo al odómetro actual del bus.
   */
  registrar(a: AlertaMantenimiento): void {
    if (!confirm(`¿Registrar "${a.etiqueta}" del bus ${a.patente} a los ${a.odometroActual.toLocaleString('es-CL')} km?`)) return;
    const bus = this.busService.getById(a.busId);
    if (!bus) return;
    const plan = bus.planMantenimiento.find((p) => p.tipo === a.tipo);
    if (plan) plan.kmUltimo = a.odometroActual;
    this.busService.save(bus);
    this.cargar();
  }
}
