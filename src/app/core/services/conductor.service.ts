import { Injectable, inject } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { Conductor } from '../models/conductor.model';

/**
 * Gestiona el CRUD de conductores sobre el almacenamiento local. Los conductores
 * son datos de la flota (no usuarios con sesión): los mantienen el supervisor y
 * el administrativo, y se asocian a cada carga de combustible.
 */
@Injectable({ providedIn: 'root' })
export class ConductorService {
  private storage = inject(StorageService);

  /** Lista todos los conductores. */
  getAll(): Conductor[] {
    return this.storage.getAll<Conductor>(STORAGE_KEYS.conductores);
  }

  /** Lista solo los conductores activos. */
  getActivos(): Conductor[] {
    return this.getAll().filter((c) => c.activo);
  }

  /** Busca un conductor por id. */
  getById(id: number): Conductor | undefined {
    return this.getAll().find((c) => c.id === Number(id));
  }

  /** Busca un conductor por RUT. */
  getByRut(rut: string): Conductor | undefined {
    return this.getAll().find((c) => c.rut === rut);
  }

  /** Devuelve el nombre del conductor o 'Desconocido' si no existe. */
  nombre(id: number): string {
    return this.getById(id)?.nombre ?? 'Desconocido';
  }

  /**
   * Crea o actualiza un conductor. Si no trae id, se asigna uno nuevo.
   * @returns el conductor persistido (con id asignado).
   */
  save(conductor: Conductor): Conductor {
    const lista = this.getAll();
    const idx = lista.findIndex((c) => c.id === conductor.id);
    if (idx >= 0) {
      lista[idx] = conductor;
    } else {
      conductor.id = this.storage.nextId(lista);
      lista.push(conductor);
    }
    this.storage.saveAll(STORAGE_KEYS.conductores, lista);
    return conductor;
  }

  /** Elimina un conductor por id. */
  delete(id: number): void {
    this.storage.saveAll(
      STORAGE_KEYS.conductores,
      this.getAll().filter((c) => c.id !== Number(id)),
    );
  }
}
