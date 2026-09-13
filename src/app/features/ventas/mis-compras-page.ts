import { Component, computed, inject, signal } from '@angular/core';
import { Location, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Venta } from '../../core/models/venta.model';
import { VentasService } from './ventas.service';

const ETIQUETA_ESTADO: Record<string, string> = {
  PENDIENTE_PAGO: 'Pendiente de pago',
  PAGADA: 'Pagada',
  COMPLETADA: 'Completada',
  ANULADA: 'Anulada',
};

@Component({
  selector: 'app-mis-compras-page',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './mis-compras-page.html',
  styleUrl: './mis-compras-page.scss',
})
export class MisComprasPage {
  private readonly service = inject(VentasService);
  private readonly location = inject(Location);
  private readonly snack = inject(MatSnackBar);

  protected readonly cargando = signal(true);
  protected readonly procesando = signal<number | null>(null);
  protected readonly ventas = signal<Venta[]>([]);
  protected readonly sinResultados = computed(
    () => !this.cargando() && this.ventas().length === 0,
  );

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.service.misCompras().subscribe({
      next: (v) => {
        this.ventas.set(v);
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

  reintentarPago(venta: Venta): void {
    this.procesando.set(venta.id);
    this.service.iniciarPago(venta.id).subscribe({
      next: (pago) => {
        if (pago.checkout_url) window.location.href = pago.checkout_url;
      },
      error: (e: unknown) => {
        this.procesando.set(null);
        this.snack.open(
          (e as { error?: { detail?: string } }).error?.detail ??
            'No se pudo generar un nuevo link de pago.',
          'Cerrar',
          { duration: 4000 },
        );
      },
    });
  }

  cancelar(venta: Venta): void {
    if (!confirm('¿Cancelar este pedido? El stock se libera.')) return;
    this.procesando.set(venta.id);
    this.service.cancelar(venta.id).subscribe({
      next: (actualizada) => {
        this.ventas.update((lista) =>
          lista.map((v) => (v.id === actualizada.id ? actualizada : v)),
        );
        this.procesando.set(null);
        this.snack.open('Pedido cancelado.', 'OK', { duration: 2500 });
      },
      error: (e: unknown) => {
        this.procesando.set(null);
        this.snack.open(
          (e as { error?: { detail?: string } }).error?.detail ??
            'No se pudo cancelar el pedido.',
          'Cerrar',
          { duration: 4000 },
        );
      },
    });
  }
}
