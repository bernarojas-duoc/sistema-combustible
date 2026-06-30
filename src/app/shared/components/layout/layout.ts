import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';

/**
 * Layout de las secciones privadas: muestra la barra de navegación superior y
 * el contenido de la ruta hija a través del `router-outlet`. Se usa como
 * componente padre de las rutas protegidas por autenticación.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
  `,
})
export class Layout {}
