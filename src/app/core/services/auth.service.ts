import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { UsuarioService } from './usuario.service';
import { Rol, Sesion, Usuario } from '../models/usuario.model';

/**
 * Gestiona la autenticación y la sesión del usuario. Expone la sesión activa
 * como signal reactivo para que la navbar y los guards reaccionen a los
 * cambios. Sustituye al antiguo `auth.js`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private storage = inject(StorageService);
  private usuarioService = inject(UsuarioService);

  /** Sesión activa (reactiva). `null` si no hay nadie autenticado. */
  readonly sesion = signal<Sesion | null>(this.leerSesion());

  /** `true` si hay una sesión activa. */
  readonly autenticado = computed(() => this.sesion() !== null);

  /**
   * Valida credenciales contra los usuarios activos. Si son correctas, guarda
   * la sesión y la expone como signal.
   * @returns el usuario autenticado o `null` si las credenciales son inválidas.
   */
  login(email: string, password: string): Usuario | null {
    const usuario = this.usuarioService
      .getAll()
      .find((u) => u.email === email && u.password === password && u.activo);
    if (!usuario) return null;

    const sesion: Sesion = { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol };
    localStorage.setItem(STORAGE_KEYS.sesion, JSON.stringify(sesion));
    this.sesion.set(sesion);
    return usuario;
  }

  /** Cierra la sesión actual. */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.sesion);
    this.sesion.set(null);
  }

  /** Actualiza los datos de la sesión en curso (ej. tras editar el perfil). */
  actualizarSesion(parcial: Partial<Sesion>): void {
    const actual = this.sesion();
    if (!actual) return;
    const nueva = { ...actual, ...parcial };
    localStorage.setItem(STORAGE_KEYS.sesion, JSON.stringify(nueva));
    this.sesion.set(nueva);
  }

  /** Ruta del dashboard correspondiente al rol indicado. */
  rutaInicio(rol: Rol): string {
    return rol === 'supervisor' ? '/supervisor/dashboard' : '/administrativo/dashboard';
  }

  private leerSesion(): Sesion | null {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.sesion) || 'null') as Sesion | null;
  }
}
