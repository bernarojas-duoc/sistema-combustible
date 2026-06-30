import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { BusService } from '../../../core/services/bus.service';
import { CargaService } from '../../../core/services/carga.service';
import { ConductorService } from '../../../core/services/conductor.service';
import { Bus } from '../../../core/models/bus.model';
import { Conductor } from '../../../core/models/conductor.model';
import { Carga } from '../../../core/models/carga.model';

/** Bencineras disponibles para el abastecimiento. */
const BENCINERAS = [
  'Copec — Calama',
  'Shell — Chuquicamata',
  'Petrobras — Spence',
  'Aramco — Radomiro Tomic',
  'Otra',
];

/**
 * Formulario de registro de una nueva carga de combustible. Lo utilizan tanto
 * el supervisor como el administrativo, por lo que el conductor que realizó la
 * carga se selecciona de una lista. Calcula en tiempo real los km recorridos, el
 * rendimiento km/L, el estado estimado y el costo total, y autocompleta el
 * odómetro anterior con la última carga del bus.
 */
@Component({
  selector: 'app-nueva-carga',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './nueva-carga.html',
})
export class NuevaCarga implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private busService = inject(BusService);
  private cargaService = inject(CargaService);
  private conductorService = inject(ConductorService);
  private router = inject(Router);

  readonly bencineras = BENCINERAS;
  buses: Bus[] = [];
  conductores: Conductor[] = [];
  hoy = new Date().toISOString().slice(0, 10);
  hint = signal('');
  exito = signal(false);

  /** Ruta a la que se vuelve/redirige según el rol que registra la carga. */
  readonly volverRuta = this.auth.rutaInicio(this.auth.sesion()!.rol);

  form = this.fb.group({
    conductorId: ['', [Validators.required]],
    busId: ['', [Validators.required]],
    fecha: [this.hoy, [Validators.required]],
    litros: [null as number | null, [Validators.required, Validators.min(1), Validators.max(500)]],
    precioLitro: [null as number | null, [Validators.required, Validators.min(1)]],
    odometro: [null as number | null, [Validators.required, Validators.min(0)]],
    odometroAnterior: [null as number | null, [Validators.required, Validators.min(0)]],
    bencinera: ['', [Validators.required]],
    observaciones: [''],
  });

  ngOnInit(): void {
    this.buses = this.busService.getActivos();
    this.conductores = this.conductorService.getActivos();
  }

  /** `true` si el odómetro actual no supera al de la carga anterior. */
  get odometroNoMayor(): boolean {
    const o = this.form.controls.odometro.value;
    const a = this.form.controls.odometroAnterior.value;
    return o != null && a != null && o <= a;
  }

  /** Km recorridos según el odómetro ingresado (o null si no es válido). */
  get km(): number | null {
    const o = this.form.controls.odometro.value;
    const a = this.form.controls.odometroAnterior.value;
    if (o == null || a == null || o <= a) return null;
    return o - a;
  }

  /** Rendimiento km/L estimado de la carga. */
  get kml(): number | null {
    const litros = this.form.controls.litros.value;
    if (this.km == null || !litros) return null;
    return Number((this.km / litros).toFixed(2));
  }

  /** Costo total estimado (litros × precio por litro). */
  get costo(): number | null {
    const litros = this.form.controls.litros.value;
    const precio = this.form.controls.precioLitro.value;
    if (!litros || !precio) return null;
    return Math.round(litros * precio);
  }

  /** Etiqueta del estado estimado según el rendimiento del bus. */
  get estadoEstimado(): { texto: string; clase: string } | null {
    const busId = this.form.controls.busId.value;
    if (this.kml == null || !busId) return null;
    const bus = this.busService.getById(Number(busId));
    if (!bus) return null;
    const ratio = this.kml / bus.kmLitroEsperado;
    if (ratio < 0.7 || ratio > 1.4) return { texto: 'Alerta', clase: 'bg-danger' };
    if (ratio < 0.85) return { texto: 'Bajo', clase: 'bg-warning text-dark' };
    return { texto: 'Normal', clase: 'bg-success' };
  }

  /** Al cambiar de bus, precarga el odómetro de la última carga registrada. */
  onBusChange(): void {
    const busId = Number(this.form.controls.busId.value);
    if (!busId) {
      this.hint.set('');
      return;
    }
    const previas = this.cargaService.getByBus(busId).filter((c) => c.estado !== 'rechazado');
    if (!previas.length) {
      this.hint.set('Sin cargas previas registradas para este bus.');
      return;
    }
    const ultima = previas.reduce((a, b) => (b.odometro > a.odometro ? b : a));
    this.form.controls.odometroAnterior.setValue(ultima.odometro);
    this.hint.set(`Autocompletado desde la última carga (${ultima.odometro.toLocaleString('es-CL')} km).`);
  }

  /** Valida y guarda la carga; deriva el estado inicial según el consumo. */
  enviar(): void {
    // Validación cruzada: el odómetro actual debe ser mayor al de la carga anterior.
    if (this.odometroNoMayor) {
      this.form.controls.odometro.setErrors({ menor: true });
    }
    // La fecha no puede ser futura.
    if ((this.form.controls.fecha.value ?? '') > this.hoy) {
      this.form.controls.fecha.setErrors({ futura: true });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const datos = {
      busId: Number(v.busId),
      litros: Number(v.litros),
      odometro: Number(v.odometro),
      odometroAnterior: Number(v.odometroAnterior),
    };

    const carga: Carga = {
      id: 0,
      conductorId: Number(v.conductorId),
      precioLitro: Number(v.precioLitro),
      bencinera: v.bencinera!,
      fecha: v.fecha!,
      observaciones: v.observaciones?.trim() || '',
      estado: this.cargaService.esAlerta(datos) ? 'alerta' : 'pendiente',
      ...datos,
    };

    this.cargaService.save(carga);
    this.exito.set(true);
    setTimeout(() => this.router.navigate([this.volverRuta]), 1600);
  }
}
