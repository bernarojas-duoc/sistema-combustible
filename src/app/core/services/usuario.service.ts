import { Injectable, inject } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { Usuario } from '../models/usuario.model';

/**
 * Gestiona el CRUD de usuarios del sistema (supervisores y administrativos)
 * sobre el almacenamiento local. Los conductores se gestionan en
 * {@link ConductorService}, ya que no son usuarios con sesión.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private storage = inject(StorageService);

  /** Lista todos los usuarios. */
  getAll(): Usuario[] {
    return this.storage.getAll<Usuario>(STORAGE_KEYS.usuarios);
  }

  /** Busca un usuario por id. */
  getById(id: number): Usuario | undefined {
    return this.getAll().find((u) => u.id === Number(id));
  }

  /** Busca un usuario por correo electrónico. */
  getByEmail(email: string): Usuario | undefined {
    return this.getAll().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  /** Devuelve el nombre del usuario o 'Desconocido' si no existe. */
  nombre(id: number): string {
    return this.getById(id)?.nombre ?? 'Desconocido';
  }

  /**
   * Crea o actualiza un usuario. Si no trae id, se asigna uno nuevo.
   * @returns el usuario persistido (con id asignado).
   */
  save(usuario: Usuario): Usuario {
    const lista = this.getAll();
    const idx = lista.findIndex((u) => u.id === usuario.id);
    if (idx >= 0) {
      lista[idx] = usuario;
    } else {
      usuario.id = this.storage.nextId(lista);
      lista.push(usuario);
    }
    this.storage.saveAll(STORAGE_KEYS.usuarios, lista);
    return usuario;
  }

  /** Elimina un usuario por id. */
  delete(id: number): void {
    this.storage.saveAll(
      STORAGE_KEYS.usuarios,
      this.getAll().filter((u) => u.id !== Number(id)),
    );
  }
}
