import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Página de inicio de sesión. Valida las credenciales con un formulario
 * reactivo y, si son correctas, redirige al dashboard correspondiente al rol.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  /** Formulario reactivo de credenciales. */
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  /** Controla la visibilidad del campo contraseña. */
  verPassword = signal(false);
  /** Mensaje de error de credenciales. */
  error = signal('');

  ngOnInit(): void {
    // Si ya hay sesión, no tiene sentido mostrar el login.
    const s = this.auth.sesion();
    if (s) this.router.navigate([this.auth.rutaInicio(s.rol)]);
  }

  /** Alterna mostrar/ocultar la contraseña. */
  togglePassword(): void {
    this.verPassword.update((v) => !v);
  }

  /** Valida el formulario e intenta iniciar sesión. */
  enviar(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    const usuario = this.auth.login(email!, password!);
    if (!usuario) {
      this.error.set('Credenciales incorrectas o cuenta deshabilitada.');
      return;
    }
    this.router.navigate([this.auth.rutaInicio(usuario.rol)]);
  }
}
