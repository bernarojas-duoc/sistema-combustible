import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Componente raíz de la aplicación. Solo aloja el `router-outlet` principal;
 * la barra de navegación y el contenedor de contenido viven en el componente
 * de layout que envuelve a las rutas protegidas.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
