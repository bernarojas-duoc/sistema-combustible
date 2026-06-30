import { Injectable, inject } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { Bus } from '../models/bus.model';

/**
 * Gestiona el CRUD de buses de la flota. Sustituye a las funciones
 * `getBuses`, `saveBus`, etc. del antiguo `data.js`.
 */
@Injectable({ providedIn: 'root' })
export class BusService {
  private storage = inject(StorageService);

  /** Lista todos los buses. */
  getAll(): Bus[] {
    return this.storage.getAll<Bus>(STORAGE_KEYS.buses);
  }

  /** Lista solo los buses activos. */
  getActivos(): Bus[] {
    return this.getAll().filter((b) => b.activo);
  }

  /** Busca un bus por id. */
  getById(id: number): Bus | undefined {
    return this.getAll().find((b) => b.id === Number(id));
  }

  /** Devuelve "PATENTE — Modelo" o 'Desconocido' si no existe. */
  nombre(id: number): string {
    const b = this.getById(id);
    return b ? `${b.patente} — ${b.modelo}` : 'Desconocido';
  }

  /** Crea o actualiza un bus. Si no trae id, se asigna uno nuevo. */
  save(bus: Bus): Bus {
    const lista = this.getAll();
    const idx = lista.findIndex((b) => b.id === bus.id);
    if (idx >= 0) {
      lista[idx] = bus;
    } else {
      bus.id = this.storage.nextId(lista);
      lista.push(bus);
    }
    this.storage.saveAll(STORAGE_KEYS.buses, lista);
    return bus;
  }

  /** Elimina un bus por id. */
  delete(id: number): void {
    this.storage.saveAll(
      STORAGE_KEYS.buses,
      this.getAll().filter((b) => b.id !== Number(id)),
    );
  }
}
