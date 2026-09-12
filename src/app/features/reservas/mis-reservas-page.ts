import { Component, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Reserva } from '../../core/models/reserva.model';
import { ReservasService } from './reservas.service';

const ETIQUETA_ESTADO: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  NOTIFICADA: 'Notificada',
  PREPARADA: 'Preparada',
  ATENDIDA: 'Atendida',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Vencida',
};

@Component({
  selector: 'app-mis-reservas-page',
  imports: [
    RouterLink,
    DatePipe,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './mis-reservas-page.html',
  styleUrl: './mis-reservas-page.scss',
})
export class MisReservasPage {
  private readonly service = inject(ReservasService);
  private readonly location = inject(Location);

  protected readonly cargando = signal(true);
  protected readonly reservas = signal<Reserva[]>([]);
  protected readonly sinResultados = computed(
    () => !this.cargando() && this.reservas().length === 0,
  );

  constructor() {
    this.service.mias().subscribe({
      next: (r) => {
        this.reservas.set(r);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  volver(): void {
    this.location.back();
  }

  etiquetaEstado(estado: string): string {
    return ETIQUETA_ESTADO[estado] ?? estado;
  }
}
