import { TestBed } from '@angular/core/testing';
import { CargaService } from './carga.service';
import { StorageService } from './storage.service';

/**
 * Pruebas unitarias del servicio de cargas: cálculo de consumo, costo y
 * detección de consumo anómalo.
 */
describe('CargaService', () => {
  let service: CargaService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    // Forzar la siembra de datos mock antes de probar.
    TestBed.inject(StorageService);
    service = TestBed.inject(CargaService);
  });

  afterEach(() => localStorage.clear());

  it('debe crearse', () => {
    expect(service).toBeTruthy();
  });

  describe('calcularConsumo()', () => {
    it('debe calcular correctamente los km por litro', () => {
      const consumo = service.calcularConsumo({ odometro: 1000, odometroAnterior: 600, litros: 100 });
      expect(consumo).toBe(4); // 400 km / 100 L
    });

    it('debe devolver null si los km no son positivos', () => {
      expect(service.calcularConsumo({ odometro: 500, odometroAnterior: 500, litros: 100 })).toBeNull();
    });
  });

  describe('calcularCosto()', () => {
    it('debe multiplicar litros por precio por litro', () => {
      expect(service.calcularCosto({ litros: 200, precioLitro: 980 })).toBe(196000);
    });
  });

  describe('esAlerta()', () => {
    it('debe marcar alerta cuando el consumo es muy inferior al esperado del bus', () => {
      // Bus 1 espera 3.5 km/L; 100 km / 100 L = 1 km/L → anómalo.
      const alerta = service.esAlerta({ busId: 1, odometro: 1100, odometroAnterior: 1000, litros: 100 });
      expect(alerta).toBeTrue();
    });

    it('no debe marcar alerta para un consumo dentro del rango esperado', () => {
      // Bus 1: 350 km / 100 L = 3.5 km/L → normal.
      const alerta = service.esAlerta({ busId: 1, odometro: 1350, odometroAnterior: 1000, litros: 100 });
      expect(alerta).toBeFalse();
    });
  });

  describe('resumenPorMes()', () => {
    it('debe devolver los meses en orden cronológico y con costo por km > 0', () => {
      const resumen = service.resumenPorMes();
      expect(resumen.length).toBeGreaterThan(1);
      for (let i = 1; i < resumen.length; i++) {
        expect(resumen[i - 1].clave <= resumen[i].clave).toBeTrue();
      }
      // Cada mes con km recorridos debe tener un costo por km coherente.
      resumen.forEach((m) => {
        if (m.km > 0) expect(m.costoPorKm).toBe(Math.round(m.gasto / m.km));
      });
    });
  });
});
