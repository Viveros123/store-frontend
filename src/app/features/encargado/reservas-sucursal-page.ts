import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ReservaSucursal } from '../../core/models/reserva.model';
import { ReservasService } from '../reservas/reservas.service';

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
  selector: 'app-reservas-sucursal-page',
  imports: [
    DatePipe,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './reservas-sucursal-page.html',
  styleUrl: './reservas-sucursal-page.scss',
})
export class ReservasSucursalPage implements OnInit {
  private readonly service = inject(ReservasService);
  private readonly snack = inject(MatSnackBar);

  protected readonly columnas = [
    'fecha',
    'cliente',
    'items',
    'estado',
    'acciones',
  ];

  protected readonly cargando = signal(false);
  protected readonly procesando = signal<number | null>(null);
  protected readonly reservas = signal<ReservaSucursal[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(0);
  protected readonly size = signal(10);
  protected readonly estado = signal<string | null>(null);

  protected readonly sinResultados = computed(
    () => !this.cargando() && this.reservas().length === 0,
  );

  ngOnInit(): void {
    this.cargar();
  }

  cambiarEstado(valor: string | null): void {
    this.estado.set(valor);
    this.page.set(0);
    this.cargar();
  }

  onPage(ev: PageEvent): void {
    this.page.set(ev.pageIndex);
    this.size.set(ev.pageSize);
    this.cargar();
  }

  etiquetaEstado(estado: string): string {
    return ETIQUETA_ESTADO[estado] ?? estado;
  }

  private cargar(): void {
    this.cargando.set(true);
    this.service
      .listarSucursal({
        estado: this.estado(),
        page: this.page() + 1,
        size: this.size(),
      })
      .subscribe({
        next: (res) => {
          this.reservas.set(res.items);
          this.total.set(res.total);
          this.cargando.set(false);
        },
        error: (e: unknown) => {
          this.cargando.set(false);
          this.snack.open(
            (e as { error?: { detail?: string } }).error?.detail ??
              'No se pudieron cargar las reservas.',
            'Cerrar',
            { duration: 4000 },
          );
        },
      });
  }

  notificar(r: ReservaSucursal): void {
    this.procesando.set(r.id);
    this.service.notificar(r.id).subscribe({
      next: (actualizada) => {
        this.reservas.update((lista) =>
          lista.map((x) => (x.id === actualizada.id ? actualizada : x)),
        );
        this.procesando.set(null);
        this.snack.open('Reserva notificada.', 'OK', { duration: 2500 });
      },
      error: (e: unknown) => {
        this.procesando.set(null);
        this.snack.open(
          (e as { error?: { detail?: string } }).error?.detail ??
            'No se pudo notificar la reserva.',
          'Cerrar',
          { duration: 4000 },
        );
      },
    });
  }

  recepcionar(r: ReservaSucursal): void {
    this.procesando.set(r.id);
    this.service.recepcionar(r.id).subscribe({
      next: (actualizada) => {
        this.reservas.update((lista) =>
          lista.map((x) => (x.id === actualizada.id ? actualizada : x)),
        );
        this.procesando.set(null);
        this.snack.open('Reserva recepcionada.', 'OK', { duration: 2500 });
      },
      error: (e: unknown) => {
        this.procesando.set(null);
        this.snack.open(
          (e as { error?: { detail?: string } }).error?.detail ??
            'No se pudo recepcionar la reserva.',
          'Cerrar',
          { duration: 4000 },
        );
      },
    });
  }
}
