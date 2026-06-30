import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConductorService } from '../../../core/services/conductor.service';
import { CargaService } from '../../../core/services/carga.service';
import { Validadores } from '../../../shared/validators/validadores';
import { Conductor } from '../../../core/models/conductor.model';

/** Clases de licencia profesional disponibles. */
const LICENCIAS = ['A3', 'A4', 'A5'];
/** Tipos de turno disponibles. */
const TURNOS = ['Diurno', 'Nocturno', 'Rotativo'];

/**
 * Mantenedor (CRUD) de conductores. Permite crear, editar, eliminar y ver el
 * detalle de cada conductor junto con sus estadísticas de cargas. Los
 * conductores son datos de la flota (no usuarios con sesión).
 */
@Component({
  selector: 'app-conductores',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './conductores.html',
})
export class Conductores implements OnInit {
  private fb = inject(FormBuilder);
  private conductorService = inject(ConductorService);
  private cargaService = inject(CargaService);

  readonly licencias = LICENCIAS;
  readonly turnos = TURNOS;

  conductores: Conductor[] = [];
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  detalle = signal<Conductor | null>(null);
  error = signal('');

  form = this.fb.group({
    nombre: ['', [Validators.required]],
    rut: ['', [Validators.required, Validadores.rut()]],
    telefono: ['', [Validators.required, Validadores.telefono()]],
    licencia: ['', [Validators.required]],
    tipoTurno: ['', [Validators.required]],
    activo: [true],
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.conductores = this.conductorService.getAll();
  }

  get esEdicion(): boolean {
    return this.editandoId() !== null;
  }

  totalCargas(id: number): number {
    return this.cargaService.getByConductor(id).length;
  }

  totalLitros(id: number): number {
    return this.cargaService.getByConductor(id).reduce((s, c) => s + c.litros, 0);
  }

  totalAlertas(id: number): number {
    return this.cargaService.getByConductor(id).filter((c) => c.estado === 'alerta').length;
  }

  abrirNuevo(): void {
    this.editandoId.set(null);
    this.error.set('');
    this.form.reset({ nombre: '', rut: '', telefono: '', licencia: '', tipoTurno: '', activo: true });
    this.modalAbierto.set(true);
  }

  abrirEdicion(c: Conductor): void {
    this.editandoId.set(c.id);
    this.error.set('');
    this.form.reset({ nombre: c.nombre, rut: c.rut, telefono: c.telefono, licencia: c.licencia, tipoTurno: c.tipoTurno, activo: c.activo });
    this.modalAbierto.set(true);
  }

  cerrar(): void {
    this.modalAbierto.set(false);
  }

  verDetalle(c: Conductor): void {
    this.detalle.set(c);
  }

  guardar(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const id = this.editandoId();

    const duplicado = this.conductorService.getByRut(v.rut!);
    if (duplicado && duplicado.id !== id) {
      this.error.set('Ya existe un conductor con ese RUT.');
      return;
    }

    if (id) {
      const c = this.conductorService.getById(id)!;
      this.conductorService.save({ ...c, nombre: v.nombre!, rut: v.rut!, telefono: v.telefono!, licencia: v.licencia!, tipoTurno: v.tipoTurno!, activo: !!v.activo });
    } else {
      this.conductorService.save({
        id: 0, nombre: v.nombre!, rut: v.rut!, telefono: v.telefono!, licencia: v.licencia!, tipoTurno: v.tipoTurno!, activo: !!v.activo,
      });
    }
    this.cerrar();
    this.cargar();
  }

  eliminar(c: Conductor): void {
    if (this.totalCargas(c.id) > 0) {
      alert('No se puede eliminar: el conductor tiene cargas registradas.');
      return;
    }
    if (!confirm(`¿Eliminar al conductor ${c.nombre}?`)) return;
    this.conductorService.delete(c.id);
    this.cargar();
  }
}
