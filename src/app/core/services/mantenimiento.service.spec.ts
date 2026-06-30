import { TestBed } from '@angular/core/testing';
import { MantenimientoService } from './mantenimiento.service';
import { StorageService } from './storage.service';

/**
 * Pruebas unitarias del servicio de mantenimiento: generación de alertas por
 * kilometraje y filtrado de las que están al día.
 */
describe('MantenimientoService', () => {
  let service: MantenimientoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    TestBed.inject(StorageService);
    service = TestBed.inject(MantenimientoService);
  });

  afterEach(() => localStorage.clear());

  it('debe generar una alerta por cada tipo de mantenimiento de cada bus activo', () => {
    const alertas = service.getAlertas();
    // 4 buses activos × 4 tipos de mantenimiento = 16 alertas.
    expect(alertas.length).toBe(16);
  });

  it('debe ordenar las alertas por km restantes (más urgentes primero)', () => {
    const alertas = service.getAlertas();
    for (let i = 1; i < alertas.length; i++) {
      expect(alertas[i - 1].kmRestantes).toBeLessThanOrEqual(alertas[i].kmRestantes);
    }
  });

  it('debe poder filtrar solo las mantenciones pendientes (excluye las al día)', () => {
    const pendientes = service.getAlertas(true);
    expect(pendientes.every((a) => a.estado !== 'ok')).toBeTrue();
  });
});
