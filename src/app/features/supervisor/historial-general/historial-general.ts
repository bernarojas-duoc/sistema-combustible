import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CargaService } from '../../../core/services/carga.service';
import { BusService } from '../../../core/services/bus.service';
import { ConductorService } from '../../../core/services/conductor.service';
import { Carga, EstadoCarga } from '../../../core/models/carga.model';
import { Bus } from '../../../core/models/bus.model';
import { Conductor } from '../../../core/models/conductor.model';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { EstadoBadge } from '../../../shared/components/estado-badge/estado-badge';

/**
 * Historial general de toda la flota para el supervisor. Permite filtrar por
 * fecha, conductor, bus y estado, y revisar cada carga (aprobar, rechazar con
 * motivo o reabrir una rechazada) mediante un modal.
 */
@Component({
  selector: 'app-historial-general',
  standalone: true,
  imports: [FormsModule, DecimalPipe, FechaPipe, EstadoBadge],
  templateUrl: './historial-general.html',
})
export class HistorialGeneral implements OnInit {
  private cargaService = inject(CargaService);
  private busService = inject(BusService);
  private conductorService = inject(ConductorService);

  conductores: Conductor[] = [];
  buses: Bus[] = [];

  filtroDesde = '';
  filtroHasta = '';
  filtroConductor: number | '' = '';
  filtroBus: number | '' = '';
  filtroEstado: '' | EstadoCarga = '';

  resultado: Carga[] = [];

  // Estado del modal de revisión.
  seleccionada = signal<Carga | null>(null);
  mostrarMotivo = signal(false);
  motivo = '';
  errorMotivo = signal('');

  ngOnInit(): void {
    this.conductores = this.conductorService.getAll();
    this.buses = this.busService.getAll();
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.resultado = this.cargaService.getAllOrdenadas().filter((c) => {
      if (this.filtroDesde && c.fecha < this.filtroDesde) return false;
      if (this.filtroHasta && c.fecha > this.filtroHasta) return false;
      if (this.filtroConductor && c.conductorId !== Number(this.filtroConductor)) return false;
      if (this.filtroBus && c.busId !== Number(this.filtroBus)) return false;
      if (this.filtroEstado && c.estado !== this.filtroEstado) return false;
      return true;
    });
  }

  limpiarFiltros(): void {
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.filtroConductor = '';
    this.filtroBus = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  get totalLitros(): number {
    return this.resultado.reduce((s, c) => s + c.litros, 0);
  }

  // --- Helpers de presentación ---
  conductor(id: number): string {
    return this.conductorService.nombre(id);
  }
  patente(busId: number): string {
    return this.busService.getById(busId)?.patente ?? '-';
  }
  consumo(c: Carga): number | null {
    return this.cargaService.calcularConsumo(c);
  }

  // --- Modal de revisión ---
  abrirModal(c: Carga): void {
    this.seleccionada.set({ ...c });
    this.mostrarMotivo.set(false);
    this.motivo = '';
    this.errorMotivo.set('');
  }

  cerrarModal(): void {
    this.seleccionada.set(null);
  }

  aprobar(): void {
    const c = this.seleccionada();
    if (!c) return;
    c.estado = 'aprobado';
    delete c.motivoRechazo;
    this.cargaService.save(c);
    this.cerrarModal();
    this.aplicarFiltros();
  }

  clickRechazar(): void {
    if (!this.mostrarMotivo()) {
      this.mostrarMotivo.set(true);
      return;
    }
    if (!this.motivo.trim()) {
      this.errorMotivo.set('Debes indicar un motivo para rechazar.');
      return;
    }
    const c = this.seleccionada();
    if (!c) return;
    c.estado = 'rechazado';
    c.motivoRechazo = this.motivo.trim();
    this.cargaService.save(c);
    this.cerrarModal();
    this.aplicarFiltros();
  }

  reabrir(): void {
    const c = this.seleccionada();
    if (!c) return;
    if (!confirm('¿Reabrir esta carga rechazada?')) return;
    c.estado = this.cargaService.esAlerta(c) ? 'alerta' : 'pendiente';
    delete c.motivoRechazo;
    this.cargaService.save(c);
    this.cerrarModal();
    this.aplicarFiltros();
  }
}
