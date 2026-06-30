import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Validadores } from '../../../shared/validators/validadores';
import { PasswordStrength } from '../../../shared/components/password-strength/password-strength';
import { Usuario } from '../../../core/models/usuario.model';

/**
 * Página de registro de nuevos usuarios administrativos. Usa un formulario
 * reactivo con validaciones de contraseña, RUT, teléfono y coincidencia de
 * contraseñas.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PasswordStrength],
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private auth = inject(AuthService);
  private router = inject(Router);

  verPassword = signal(false);
  error = signal('');
  exito = signal(false);

  form = this.fb.group(
    {
      nombre: ['', [Validators.required]],
      rut: ['', [Validators.required, Validadores.rut()]],
      telefono: ['', [Validators.required, Validadores.telefono()]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validadores.password()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: Validadores.coinciden('password', 'confirmPassword') },
  );

  /** Nivel de fuerza (0-5) de la contraseña actual, para el indicador visual. */
  fuerza = computed(() => Validadores.fuerza(this.form.controls.password.value ?? ''));

  /** Lista de errores de la regla de contraseña, para mostrarlos al usuario. */
  get erroresPassword(): string[] {
    return (this.form.controls.password.errors?.['password'] as string[]) ?? [];
  }

  togglePassword(): void {
    this.verPassword.update((v) => !v);
  }

  /** Valida y registra al usuario. */
  enviar(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, rut, telefono, email, password } = this.form.getRawValue();

    if (this.usuarioService.getByEmail(email!)) {
      this.error.set('Ya existe una cuenta registrada con ese correo.');
      return;
    }

    const nuevo: Usuario = {
      id: 0,
      nombre: nombre!,
      rut: rut!,
      telefono: telefono!,
      email: email!,
      password: password!,
      rol: 'administrativo',
      activo: true,
    };
    this.usuarioService.save(nuevo);
    this.exito.set(true);
    setTimeout(() => this.router.navigate(['/login']), 1800);
  }
}
