import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoBadge } from './estado-badge';

/**
 * Pruebas unitarias del componente reutilizable de badge de estado: clase CSS,
 * etiqueta e icono de motivo de rechazo.
 */
describe('EstadoBadge', () => {
  let fixture: ComponentFixture<EstadoBadge>;
  let component: EstadoBadge;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EstadoBadge] }).compileComponents();
    fixture = TestBed.createComponent(EstadoBadge);
    component = fixture.componentInstance;
  });

  it('debe crearse', () => {
    component.estado = 'aprobado';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debe asignar la clase y etiqueta correctas según el estado', () => {
    component.estado = 'alerta';
    fixture.detectChanges();
    expect(component.clase).toBe('bg-danger');
    expect(component.etiqueta).toBe('Alerta');

    const badge: HTMLElement = fixture.nativeElement.querySelector('.badge');
    expect(badge.textContent?.trim()).toBe('Alerta');
  });

  it('debe mostrar el icono de motivo solo cuando está rechazado y hay motivo', () => {
    component.estado = 'rechazado';
    component.motivo = 'Odómetro inconsistente';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('i.bi-info-circle')).toBeTruthy();
  });
});
