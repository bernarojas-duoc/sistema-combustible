import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

/**
 * Pruebas unitarias del servicio de autenticación: inicio de sesión con
 * credenciales correctas e incorrectas y cierre de sesión.
 */
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    TestBed.inject(StorageService);
    service = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('debe iniciar sesión con credenciales válidas y exponer la sesión', () => {
    const usuario = service.login('supervisor@nortrans.cl', 'Admin@1234');
    expect(usuario).not.toBeNull();
    expect(service.autenticado()).toBeTrue();
    expect(service.sesion()?.rol).toBe('supervisor');
  });

  it('debe rechazar credenciales inválidas', () => {
    const usuario = service.login('supervisor@nortrans.cl', 'claveIncorrecta');
    expect(usuario).toBeNull();
    expect(service.autenticado()).toBeFalse();
  });

  it('debe cerrar la sesión correctamente', () => {
    service.login('administrativo@nortrans.cl', 'Admin@5678');
    expect(service.autenticado()).toBeTrue();
    service.logout();
    expect(service.autenticado()).toBeFalse();
    expect(service.sesion()).toBeNull();
  });

  it('debe devolver la ruta de inicio según el rol', () => {
    expect(service.rutaInicio('supervisor')).toBe('/supervisor/dashboard');
    expect(service.rutaInicio('administrativo')).toBe('/administrativo/dashboard');
  });
});
