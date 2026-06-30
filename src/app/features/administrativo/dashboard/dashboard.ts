import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CargaService } from '../../../core/services/carga.service';
import { BusService } from '../../../core/services/bus.service';
import { ConductorService } from '../../../core/services/conductor.service';
import { Carga } from '../../../core/models/carga.model';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { EstadoBadge } from '../../../shared/components/estado-badge/estado-badge';

/**
 * Panel de inicio del administrativo: resumen de los datos que mantiene
 * (conductores, buses y cargas del mes), accesos directos a los mantenedores y
 * las últimas cargas registradas en el sistema.
 */
@Component({
  selector: 'app-administrativo-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink, FechaPipe, EstadoBadge],
  templateUrl: './dashboard.html',
})
export class AdministrativoDashboard implements OnInit {
  private auth = inject(AuthService);
  private cargaService = inject(CargaService);
  private busService = inject(BusService);
  private conductorService = inject(ConductorService);

  nombre = '';
  conductoresActivos = 0;
  busesActivos = 0;
  cargasMes = 0;
  litrosMes = 0;
  recientes: Carga[] = [];

  ngOnInit(): void {
    this.nombre = this.auth.sesion()!.nombre.split(' ')[0];
    this.conductoresActivos = this.conductorService.getActivos().length;
    this.busesActivos = this.busService.getActivos().length;

    const todas = this.cargaService.getAllOrdenadas();
    const mes = new Date().toISOString().slice(0, 7);
    const delMes = todas.filter((c) => c.fecha.startsWith(mes));
    this.cargasMes = delMes.length;
    this.litrosMes = delMes.reduce((s, c) => s + c.litros, 0);
    this.recientes = todas.slice(0, 6);
  }

  conductor(id: number): string {
    return this.conductorService.nombre(id);
  }

  patente(busId: number): string {
    return this.busService.getById(busId)?.patente ?? '-';
  }
}
