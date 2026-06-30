import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';
import { Conductor } from '../models/conductor.model';
import { Bus } from '../models/bus.model';
import { Carga } from '../models/carga.model';

/** Claves usadas para persistir cada colección en localStorage. */
export const STORAGE_KEYS = {
  usuarios: 'scf_usuarios',
  conductores: 'scf_conductores',
  buses: 'scf_buses',
  cargas: 'scf_cargas',
  sesion: 'scf_session',
  version: 'scf_seed_version',
} as const;

/**
 * Versión de los datos sembrados. Al incrementarla, los navegadores que ya
 * tenían datos antiguos se vuelven a sembrar (p. ej. para incorporar el
 * historial de varios meses del reporte de gasto).
 */
const SEED_VERSION = '7';

/**
 * Servicio de persistencia genérico sobre `localStorage`. Centraliza el acceso
 * de lectura/escritura y siembra (seed) los datos mock iniciales la primera vez
 * que se ejecuta la aplicación. Sustituye al antiguo `data.js`.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor() {
    this.seed();
  }

  /** Devuelve todos los elementos de una colección. */
  getAll<T>(key: string): T[] {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  }

  /** Reemplaza por completo una colección. */
  saveAll<T>(key: string, arr: T[]): void {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  /** Calcula el próximo id autoincremental de una colección. */
  nextId<T extends { id: number }>(arr: T[]): number {
    return arr.length > 0 ? Math.max(...arr.map((x) => x.id)) + 1 : 1;
  }

  /** Reinicia todos los datos al estado inicial (útil para pruebas/demo). */
  reset(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    this.seed();
  }

  /**
   * Siembra los datos mock si aún no existen en localStorage. Si la versión de
   * seed almacenada no coincide con la actual, regenera los datos para
   * incorporar las novedades (manteniendo intacta la sesión activa).
   */
  private seed(): void {
    const versionActual = localStorage.getItem(STORAGE_KEYS.version);
    if (versionActual !== SEED_VERSION) {
      localStorage.removeItem(STORAGE_KEYS.usuarios);
      localStorage.removeItem(STORAGE_KEYS.conductores);
      localStorage.removeItem(STORAGE_KEYS.buses);
      localStorage.removeItem(STORAGE_KEYS.cargas);
      localStorage.setItem(STORAGE_KEYS.version, SEED_VERSION);
    }

    if (!localStorage.getItem(STORAGE_KEYS.usuarios)) {
      this.saveAll<Usuario>(STORAGE_KEYS.usuarios, this.usuariosIniciales());
    }
    if (!localStorage.getItem(STORAGE_KEYS.conductores)) {
      this.saveAll<Conductor>(STORAGE_KEYS.conductores, this.conductoresIniciales());
    }
    if (!localStorage.getItem(STORAGE_KEYS.buses)) {
      this.saveAll<Bus>(STORAGE_KEYS.buses, this.busesIniciales());
    }
    if (!localStorage.getItem(STORAGE_KEYS.cargas)) {
      this.saveAll<Carga>(STORAGE_KEYS.cargas, this.cargasIniciales());
    }
  }

  private usuariosIniciales(): Usuario[] {
    return [
      { id: 1, nombre: 'Carlos Supervisor', email: 'supervisor@nortrans.cl', password: 'Admin@1234', rol: 'supervisor', rut: '12.345.678-9', telefono: '+56 9 1234 5678', activo: true },
      { id: 2, nombre: 'Ana Administrativa', email: 'administrativo@nortrans.cl', password: 'Admin@5678', rol: 'administrativo', rut: '13.456.789-0', telefono: '+56 9 2233 4455', activo: true },
    ];
  }

  private conductoresIniciales(): Conductor[] {
    return [
      { id: 1, nombre: 'Pedro Ramírez', rut: '15.678.901-2', telefono: '+56 9 8765 4321', licencia: 'A4', tipoTurno: 'Diurno', activo: true },
      { id: 2, nombre: 'Luis Herrera', rut: '17.234.567-8', telefono: '+56 9 5555 6666', licencia: 'A5', tipoTurno: 'Nocturno', activo: true },
    ];
  }

  private busesIniciales(): Bus[] {
    return [
      {
        id: 1, patente: 'BJKP-12', numeroChasis: '9BWZZZ377VT004251', modelo: 'Mercedes-Benz O500', capacidadTanque: 350, kmLitroEsperado: 3.5, activo: true,
        planMantenimiento: [
          { tipo: 'aceite', intervaloKm: 20000, kmUltimo: 130000 },
          { tipo: 'filtros', intervaloKm: 30000, kmUltimo: 120000 },
          { tipo: 'frenos', intervaloKm: 40000, kmUltimo: 110000 },
          { tipo: 'neumaticos', intervaloKm: 60000, kmUltimo: 90000 },
        ],
      },
      {
        id: 2, patente: 'FKRM-34', numeroChasis: 'YV3R8E40XGA158742', modelo: 'Volvo B12M', capacidadTanque: 300, kmLitroEsperado: 3.2, activo: true,
        planMantenimiento: [
          { tipo: 'aceite', intervaloKm: 20000, kmUltimo: 78000 },
          { tipo: 'filtros', intervaloKm: 30000, kmUltimo: 70000 },
          { tipo: 'frenos', intervaloKm: 40000, kmUltimo: 60000 },
          { tipo: 'neumaticos', intervaloKm: 60000, kmUltimo: 40000 },
        ],
      },
      {
        id: 3, patente: 'GHPW-56', numeroChasis: 'XLER4X20005398761', modelo: 'Scania K360', capacidadTanque: 320, kmLitroEsperado: 3.8, activo: true,
        planMantenimiento: [
          { tipo: 'aceite', intervaloKm: 20000, kmUltimo: 180000 },
          { tipo: 'filtros', intervaloKm: 30000, kmUltimo: 175000 },
          { tipo: 'frenos', intervaloKm: 40000, kmUltimo: 165000 },
          { tipo: 'neumaticos', intervaloKm: 60000, kmUltimo: 145000 },
        ],
      },
      {
        id: 4, patente: 'LNVX-78', numeroChasis: '9BWZZZ377VT009834', modelo: 'Mercedes-Benz O500', capacidadTanque: 350, kmLitroEsperado: 3.5, activo: true,
        planMantenimiento: [
          { tipo: 'aceite', intervaloKm: 20000, kmUltimo: 55000 },
          { tipo: 'filtros', intervaloKm: 30000, kmUltimo: 50000 },
          { tipo: 'frenos', intervaloKm: 40000, kmUltimo: 40000 },
          { tipo: 'neumaticos', intervaloKm: 60000, kmUltimo: 20000 },
        ],
      },
    ];
  }

  private cargasIniciales(): Carga[] {
    const hoy = new Date();
    // Fecha a N días del día actual (para el mes en curso).
    const f = (dias: number): string => {
      const d = new Date(hoy);
      d.setDate(d.getDate() + dias);
      return this.fechaISO(d);
    };
    // Fecha a N meses atrás, en el día indicado (para el historial).
    const fm = (mesesAtras: number, dia: number): string =>
      this.fechaISO(new Date(hoy.getFullYear(), hoy.getMonth() - mesesAtras, dia));

    // Cargas del mes en curso.
    const mesActual: Carga[] = [
      { id: 1, busId: 1, conductorId: 1, litros: 220, precioLitro: 980, odometro: 145300, odometroAnterior: 144550, bencinera: 'Copec — Calama', fecha: f(-2), observaciones: '', estado: 'aprobado' },
      { id: 2, busId: 2, conductorId: 2, litros: 180, precioLitro: 995, odometro: 98700, odometroAnterior: 98100, bencinera: 'Shell — Chuquicamata', fecha: f(-1), observaciones: 'Tanque casi vacío', estado: 'aprobado' },
      { id: 3, busId: 3, conductorId: 1, litros: 310, precioLitro: 1010, odometro: 201500, odometroAnterior: 200400, bencinera: 'Copec — Calama', fecha: f(0), observaciones: '', estado: 'pendiente' },
      { id: 4, busId: 1, conductorId: 1, litros: 90, precioLitro: 970, odometro: 144550, odometroAnterior: 143900, bencinera: 'Petrobras — Spence', fecha: f(-5), observaciones: '', estado: 'aprobado' },
      { id: 5, busId: 4, conductorId: 2, litros: 260, precioLitro: 990, odometro: 76200, odometroAnterior: 75350, bencinera: 'Copec — Calama', fecha: f(-3), observaciones: '', estado: 'alerta' },
    ];

    // Historial de los 11 meses anteriores (todas aprobadas) para el reporte de
    // gasto. Se generan en bucle con un patrón que varía el gasto mes a mes.
    // Los odómetros se mantienen por debajo de los del mes actual de cada bus
    // (con consumo cercano al esperado) para no alterar las alertas ni el
    // cálculo de mantenimiento.
    const bencineras = ['Copec — Calama', 'Shell — Chuquicamata', 'Petrobras — Spence', 'Aramco — Radomiro Tomic'];
    // Odómetro base por bus, claramente inferior al del mes actual.
    const odoBase: Record<number, number> = { 1: 138000, 2: 94000, 3: 192000, 4: 71000 };
    // Litros por bus en cada uno de los 11 meses (patrón con variación realista).
    const patron: Record<number, number[]> = {
      1: [180, 240, 150, 210, 200, 230, 160, 250, 190, 220, 170],
      2: [200, 170, 230, 190, 210, 150, 240, 180, 220, 160, 200],
      3: [300, 260, 320, 240, 280, 310, 250, 290, 270, 230, 300],
      4: [230, 250, 200, 240, 210, 260, 220, 190, 250, 200, 240],
    };

    const historial: Carga[] = [];
    let id = 6;
    for (let m = 1; m <= 11; m++) {
      // Dos buses distintos por mes para variar el gasto mensual.
      const busesDelMes = [((m + 1) % 4) + 1, ((m + 2) % 4) + 1];
      busesDelMes.forEach((busId, idx) => {
        const litros = patron[busId][m - 1];
        const km = Math.round(litros * 3.4); // consumo ~3.4 km/L (dentro de rango)
        const odometro = odoBase[busId] - m * 1200 - idx * 300;
        const conductorId = busId % 2 === 0 ? 2 : 1;
        historial.push({
          id: id++,
          busId,
          conductorId,
          litros,
          precioLitro: 940 + ((m * 13 + busId * 5) % 100),
          odometro,
          odometroAnterior: odometro - km,
          bencinera: bencineras[(m + idx) % bencineras.length],
          fecha: fm(m, 6 + ((m * 3) % 20)),
          estado: 'aprobado',
        });
      });
    }

    return [...mesActual, ...historial];
  }

  /** Formatea una fecha a `YYYY-MM-DD` usando la zona horaria local. */
  private fechaISO(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
