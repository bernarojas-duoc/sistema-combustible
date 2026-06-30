import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Validadores } from '../../shared/validators/validadores';
import { PasswordStrength } from '../../shared/components/password-strength/password-strength';
import { Usuario } from '../../core/models/usuario.model';

/**
 * Página de perfil del usuario autenticado. Permite editar sus datos personales
 * y cambiar la contraseña mediante dos formularios reactivos independientes.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, PasswordStrength],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private usuarioService = inject(UsuarioService);

  usuario!: Usuario;
  verPassword = signal(false);
  msgPerfil = signal('');
  msgPassword = signal('');
  errorPassword = signal('');

  formPerfil = this.fb.group({
    nombre: ['', [Validators.required]],
    rut: ['', [Validators.required, Validadores.rut()]],
    telefono: ['', [Validators.required, Validadores.telefono()]],
    email: ['', [Validators.required, Validators.email]],
  });

  formPassword = this.fb.group(
    {
      pwdActual: ['', [Validators.required]],
      pwdNueva: ['', [Validators.required, Validadores.password()]],
      pwdConfirm: ['', [Validators.required]],
    },
    { validators: Validadores.coinciden('pwdNueva', 'pwdConfirm') },
  );

  ngOnInit(): void {
    const sesion = this.auth.sesion()!;
    this.usuario = this.usuarioService.getById(sesion.id)!;
    this.cargarDatos();
  }

  /** Recarga el formulario de perfil con los datos actuales del usuario. */
  cargarDatos(): void {
    this.formPerfil.reset({
      nombre: this.usuario.nombre,
      rut: this.usuario.rut,
      telefono: this.usuario.telefono,
      email: this.usuario.email,
    });
    this.msgPerfil.set('');
  }

  get rol(): string {
    return this.usuario?.rol === 'supervisor' ? 'Supervisor' : 'Administrativo';
  }

  get erroresPassword(): string[] {
    return (this.formPassword.controls.pwdNueva.errors?.['password'] as string[]) ?? [];
  }

  togglePassword(): void {
    this.verPassword.update((v) => !v);
  }

  /** Guarda los datos personales editados. */
  guardarPerfil(): void {
    this.msgPerfil.set('');
    if (this.formPerfil.invalid) {
      this.formPerfil.markAllAsTouched();
      return;
    }
    const { nombre, rut, telefono, email } = this.formPerfil.getRawValue();

    const duplicado = this.usuarioService.getByEmail(email!);
    if (duplicado && duplicado.id !== this.usuario.id) {
      this.msgPerfil.set('ERROR: ese correo ya está en uso por otra cuenta.');
      return;
    }

    this.usuario = { ...this.usuario, nombre: nombre!, rut: rut!, telefono: telefono!, email: email! };
    this.usuarioService.save(this.usuario);
    this.auth.actualizarSesion({ nombre: this.usuario.nombre });
    this.msgPerfil.set('Datos actualizados correctamente.');
  }

  /** Cambia la contraseña validando la actual. */
  cambiarPassword(): void {
    this.errorPassword.set('');
    this.msgPassword.set('');
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }
    if (this.formPassword.controls.pwdActual.value !== this.usuario.password) {
      this.errorPassword.set('La contraseña actual es incorrecta.');
      return;
    }
    this.usuario = { ...this.usuario, password: this.formPassword.controls.pwdNueva.value! };
    this.usuarioService.save(this.usuario);
    this.formPassword.reset();
    this.msgPassword.set('Contraseña actualizada correctamente.');
  }
}
