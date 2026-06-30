import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Validadores } from '../../../shared/validators/validadores';
import { PasswordStrength } from '../../../shared/components/password-strength/password-strength';

/** Código de verificación simulado (en una app real se enviaría por correo). */
const CODIGO_SIMULADO = '1234';

/**
 * Recuperación de contraseña en tres pasos: validar correo, ingresar código de
 * verificación y definir la nueva contraseña.
 */
@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PasswordStrength],
  templateUrl: './recover.html',
})
export class Recover {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  /** Paso actual del asistente (1, 2 o 3). */
  paso = signal(1);
  error = signal('');
  exito = signal(false);
  verPassword = signal(false);
  private emailRecuperar = '';

  formEmail = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  formCodigo = this.fb.group({ codigo: ['', [Validators.required]] });
  formPassword = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validadores.password()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: Validadores.coinciden('newPassword', 'confirmPassword') },
  );

  fuerzaValor = computed(() => this.formPassword.controls.newPassword.value ?? '');

  get erroresPassword(): string[] {
    return (this.formPassword.controls.newPassword.errors?.['password'] as string[]) ?? [];
  }

  togglePassword(): void {
    this.verPassword.update((v) => !v);
  }

  /** Paso 1: verifica que el correo exista. */
  validarEmail(): void {
    this.error.set('');
    if (this.formEmail.invalid) {
      this.formEmail.markAllAsTouched();
      return;
    }
    const email = this.formEmail.controls.email.value!;
    if (!this.usuarioService.getByEmail(email)) {
      this.error.set('No existe una cuenta con ese correo electrónico.');
      return;
    }
    this.emailRecuperar = email;
    this.paso.set(2);
  }

  /** Paso 2: valida el código de verificación simulado. */
  validarCodigo(): void {
    this.error.set('');
    if (this.formCodigo.controls.codigo.value !== CODIGO_SIMULADO) {
      this.error.set(`Código incorrecto. Para esta demo el código es ${CODIGO_SIMULADO}.`);
      return;
    }
    this.paso.set(3);
  }

  /** Paso 3: guarda la nueva contraseña del usuario. */
  cambiarPassword(): void {
    this.error.set('');
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }
    const usuario = this.usuarioService.getByEmail(this.emailRecuperar);
    if (!usuario) {
      this.error.set('Ocurrió un problema al recuperar la cuenta.');
      return;
    }
    usuario.password = this.formPassword.controls.newPassword.value!;
    this.usuarioService.save(usuario);
    this.exito.set(true);
    setTimeout(() => this.router.navigate(['/login']), 1800);
  }
}
