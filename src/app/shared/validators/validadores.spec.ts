import { FormControl, FormGroup } from '@angular/forms';
import { Validadores } from './validadores';

/**
 * Pruebas unitarias de los validadores reactivos. Verifican las 4 reglas de
 * seguridad de contraseña, el formato de RUT/teléfono y la coincidencia de
 * contraseñas.
 */
describe('Validadores', () => {
  describe('password()', () => {
    const validar = Validadores.password();

    it('debe rechazar una contraseña demasiado corta y sin número ni símbolo', () => {
      const errores = validar(new FormControl('abc'))?.['password'] as string[];
      expect(errores).toContain('Mínimo 8 caracteres');
      expect(errores).toContain('Debe contener al menos un número');
      expect(errores).toContain('Debe contener al menos un carácter especial (!@#$%...)');
    });

    it('debe aceptar una contraseña que cumple las 4 reglas', () => {
      expect(validar(new FormControl('Segura@123'))).toBeNull();
    });

    it('debe rechazar una contraseña que supera los 20 caracteres', () => {
      const errores = validar(new FormControl('Estaesdemasiadolarga@123456'))?.['password'] as string[];
      expect(errores).toContain('Máximo 20 caracteres');
    });
  });

  describe('rut()', () => {
    it('debe aceptar un RUT con formato válido', () => {
      expect(Validadores.rut()(new FormControl('12.345.678-9'))).toBeNull();
    });

    it('debe rechazar un RUT con formato inválido', () => {
      expect(Validadores.rut()(new FormControl('12345678'))).toEqual({ rut: jasmine.any(String) });
    });
  });

  describe('telefono()', () => {
    it('debe aceptar un teléfono chileno válido', () => {
      expect(Validadores.telefono()(new FormControl('+56 9 1234 5678'))).toBeNull();
    });

    it('debe rechazar un teléfono inválido', () => {
      expect(Validadores.telefono()(new FormControl('123'))).not.toBeNull();
    });
  });

  describe('coinciden()', () => {
    const grupoValidator = Validadores.coinciden('a', 'b');

    it('debe devolver null cuando ambos campos coinciden', () => {
      const group = new FormGroup({ a: new FormControl('clave'), b: new FormControl('clave') });
      expect(grupoValidator(group)).toBeNull();
    });

    it('debe devolver error cuando los campos difieren', () => {
      const group = new FormGroup({ a: new FormControl('clave'), b: new FormControl('otra') });
      expect(grupoValidator(group)).toEqual({ coinciden: jasmine.any(String) });
    });
  });

  describe('fuerza()', () => {
    it('debe asignar mayor puntaje a una contraseña más robusta', () => {
      expect(Validadores.fuerza('abc')).toBeLessThan(Validadores.fuerza('SuperClave@2024'));
    });
  });
});
