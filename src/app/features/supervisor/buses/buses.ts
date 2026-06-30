import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusService } from '../../../core/services/bus.service';
import { CargaService } from '../../../core/services/carga.service';
import { Bus } from '../../../core/models/bus.model';
import { PlanMantenimiento, TipoMantenimiento } from '../../../core/models/mantenimiento.model';

/** Intervalos por defecto (km) al crear un bus nuevo. */
const INTERVALOS_DEFECTO: Record<TipoMantenimiento, number> = {
  aceite: 20000,
  filtros: 30000,
  frenos: 40000,
  neumaticos: 60000,
};

/**
 * Mantenedor (CRUD) de los buses de la flota. Permite crear, editar y eliminar
 * buses, incluyendo la configuración de los intervalos de su plan de
 * mantenimiento preventivo.
 */
@Component({
  selector: 'app-buses',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './buses.html',
})
export class Buses implements OnInit {
  private fb = inject(FormBuilder);
  private busService = inject(BusService);
  private cargaService = inject(CargaService);

  buses: Bus[] = [];
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  error = signal('');

  form = this.fb.group({
    patente: ['', [Validators.required]],
    numeroChasis: ['', [Validators.required, Validators.minLength(6)]],
    modelo: ['', [Validators.required]],
    capacidadTanque: [null as number | null, [Validators.required, Validators.min(50), Validators.max(1000)]],
    kmLitroEsperado: [null as number | null, [Validators.required, Validators.min(0.5), Validators.max(20)]],
    activo: [true],
    intervaloAceite: [INTERVALOS_DEFECTO.aceite, [Validators.required, Validators.min(1000)]],
    intervaloFiltros: [INTERVALOS_DEFECTO.filtros, [Validators.required, Validators.min(1000)]],
    intervaloFrenos: [INTERVALOS_DEFECTO.frenos, [Validators.required, Validators.min(1000)]],
    intervaloNeumaticos: [INTERVALOS_DEFECTO.neumaticos, [Validators.required, Validators.min(1000)]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.buses = this.busService.getAll();
  }

  totalCargas(busId: number): number {
    return this.cargaService.getByBus(busId).length;
  }

  abrirNuevo(): void {
    this.editandoId.set(null);
    this.error.set('');
    this.form.reset({
      patente: '', numeroChasis: '', modelo: '', capacidadTanque: null, kmLitroEsperado: null, activo: true,
      intervaloAceite: INTERVALOS_DEFECTO.aceite, intervaloFiltros: INTERVALOS_DEFECTO.filtros,
      intervaloFrenos: INTERVALOS_DEFECTO.frenos, intervaloNeumaticos: INTERVALOS_DEFECTO.neumaticos,
    });
    this.modalAbierto.set(true);
  }

  abrirEdicion(bus: Bus): void {
    this.editandoId.set(bus.id);
    this.error.set('');
    const plan = (t: TipoMantenimiento) => bus.planMantenimiento.find((p) => p.tipo === t)?.intervaloKm ?? INTERVALOS_DEFECTO[t];
    this.form.reset({
      patente: bus.patente,
      numeroChasis: bus.numeroChasis,
      modelo: bus.modelo,
      capacidadTanque: bus.capacidadTanque,
      kmLitroEsperado: bus.kmLitroEsperado,
      activo: bus.activo,
      intervaloAceite: plan('aceite'),
      intervaloFiltros: plan('filtros'),
      intervaloFrenos: plan('frenos'),
      intervaloNeumaticos: plan('neumaticos'),
    });
    this.modalAbierto.set(true);
  }

  cerrar(): void {
    this.modalAbierto.set(false);
  }

  guardar(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const patente = v.patente!.trim().toUpperCase();
    const numeroChasis = v.numeroChasis!.trim().toUpperCase();
    const id = this.editandoId();

    // Validar patente duplicada.
    if (this.buses.find((b) => b.patente.toUpperCase() === patente && b.id !== id)) {
      this.error.set('Ya existe un bus con esa patente.');
      return;
    }

    // Validar número de chasis duplicado.
    if (this.buses.find((b) => b.numeroChasis.toUpperCase() === numeroChasis && b.id !== id)) {
      this.error.set('Ya existe un bus con ese número de chasis.');
      return;
    }

    const existente = id ? this.busService.getById(id) : undefined;
    const planAnterior = (t: TipoMantenimiento) => existente?.planMantenimiento.find((p) => p.tipo === t)?.kmUltimo ?? 0;

    const plan: PlanMantenimiento[] = [
      { tipo: 'aceite', intervaloKm: v.intervaloAceite!, kmUltimo: planAnterior('aceite') },
      { tipo: 'filtros', intervaloKm: v.intervaloFiltros!, kmUltimo: planAnterior('filtros') },
      { tipo: 'frenos', intervaloKm: v.intervaloFrenos!, kmUltimo: planAnterior('frenos') },
      { tipo: 'neumaticos', intervaloKm: v.intervaloNeumaticos!, kmUltimo: planAnterior('neumaticos') },
    ];

    const bus: Bus = {
      id: id ?? 0,
      patente,
      numeroChasis,
      modelo: v.modelo!.trim(),
      capacidadTanque: Number(v.capacidadTanque),
      kmLitroEsperado: Number(v.kmLitroEsperado),
      activo: !!v.activo,
      planMantenimiento: plan,
    };
    this.busService.save(bus);
    this.cerrar();
    this.cargar();
  }

  eliminar(bus: Bus): void {
    if (this.totalCargas(bus.id) > 0) {
      alert('No se puede eliminar: el bus tiene cargas registradas.');
      return;
    }
    if (!confirm(`¿Eliminar el bus ${bus.patente}?`)) return;
    this.busService.delete(bus.id);
    this.cargar();
  }
}
