import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CargaService } from '../../../core/services/carga.service';
import { BusService } from '../../../core/services/bus.service';
import { ConductorService } from '../../../core/services/conductor.service';
import { Carga } from '../../../core/models/carga.model';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { EstadoBadge } from '../../../shared/components/estado-badge/estado-badge';

/**
 * Centro de alertas de consumo anómalo. Lista las alertas activas para que el
 * supervisor las apruebe o rechace, y muestra el historial de alertas resueltas
 * (aprobadas o rechazadas) con la posibilidad de reabrir las rechazadas.
 */
@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [DecimalPipe, FormsModule, FechaPipe, EstadoBadge],
  templateUrl: './alertas.html',
})
export class Alertas implements OnInit {
  private cargaService = inject(CargaService);
  private busService = inject(BusService);
  private conductorService = inject(ConductorService);

  activas: Carga[] = [];
  resueltas: Carga[] = [];
  busesInvolucrados = 0;
  conductoresInvolucrados = 0;

  // Modal de rechazo.
  enRechazo = signal<Carga | null>(null);
  motivo = '';
  errorMotivo = signal('');

  ngOnInit(): void {
    this.refrescar();
  }

  private refrescar(): void {
    const todas = this.cargaService.getAllOrdenadas();
    this.activas = todas.filter((c) => c.estado === 'alerta');
    this.resueltas = todas.filter(
      (c) => (c.estado === 'aprobado' || c.estado === 'rechazado') && this.cargaService.esAlerta(c),
    );
    this.busesInvolucrados = new Set(this.activas.map((c) => c.busId)).size;
    this.conductoresInvolucrados = new Set(this.activas.map((c) => c.conductorId)).size;
  }

  conductor(id: number): string {
    return this.conductorService.nombre(id);
  }
  patente(busId: number): string {
    return this.busService.getById(busId)?.patente ?? '-';
  }
  kmEsperado(busId: number): number | string {
    return this.busService.getById(busId)?.kmLitroEsperado ?? '-';
  }
  consumo(c: Carga): number | null {
    return this.cargaService.calcularConsumo(c);
  }
  km(c: Carga): number {
    return c.odometro - c.odometroAnterior;
  }

  /** Desviación porcentual del consumo respecto al esperado del bus. */
  desviacion(c: Carga): number | null {
    const bus = this.busService.getById(c.busId);
    const kml = this.consumo(c);
    if (!bus || kml == null) return null;
    return Number((((kml - bus.kmLitroEsperado) / bus.kmLitroEsperado) * 100).toFixed(1));
  }

  aprobar(c: Carga): void {
    const carga = this.cargaService.getById(c.id)!;
    carga.estado = 'aprobado';
    delete carga.motivoRechazo;
    this.cargaService.save(carga);
    this.refrescar();
  }

  abrirRechazo(c: Carga): void {
    this.enRechazo.set(c);
    this.motivo = '';
    this.errorMotivo.set('');
  }

  confirmarRechazo(): void {
    if (!this.motivo.trim()) {
      this.errorMotivo.set('Debes indicar un motivo.');
      return;
    }
    const c = this.enRechazo()!;
    const carga = this.cargaService.getById(c.id)!;
    carga.estado = 'rechazado';
    carga.motivoRechazo = this.motivo.trim();
    this.cargaService.save(carga);
    this.enRechazo.set(null);
    this.refrescar();
  }

  reabrir(c: Carga): void {
    if (!confirm('¿Reabrir esta carga rechazada? Volverá a quedar como alerta activa.')) return;
    const carga = this.cargaService.getById(c.id)!;
    carga.estado = this.cargaService.esAlerta(carga) ? 'alerta' : 'pendiente';
    delete carga.motivoRechazo;
    this.cargaService.save(carga);
    this.refrescar();
  }
}
