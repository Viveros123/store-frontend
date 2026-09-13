import { Component, computed, inject, signal } from '@angular/core';
import { Location, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SucursalOpcion } from '../../core/models/sucursal.model';
import { Pago } from '../../core/models/venta.model';
import { CarritoService } from '../carrito/carrito.service';
import { SucursalesService } from '../sucursales/sucursales.service';
import { VentasService } from './ventas.service';

type Paso = 'sucursal' | 'pago';

@Component({
  selector: 'app-checkout-page',
  imports: [
    DecimalPipe,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
  ],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
})
export class CheckoutPage {
  private readonly carritoSvc = inject(CarritoService);
  private readonly sucursalesSvc = inject(SucursalesService);
  private readonly ventasSvc = inject(VentasService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  protected readonly cargando = signal(true);
  protected readonly procesando = signal(false);
  protected readonly paso = signal<Paso>('sucursal');
  protected readonly sucursales = signal<SucursalOpcion[]>([]);
  protected readonly sucursalId = signal<number | null>(null);
  protected readonly pago = signal<Pago | null>(null);
  protected readonly ventaId = signal<number | null>(null);

  protected readonly carrito = this.carritoSvc.carrito;
  protected readonly items = computed(() => this.carrito()?.items ?? []);

  constructor() {
    this.carritoSvc.cargar().subscribe();
    this.sucursalesSvc.opciones().subscribe({
      next: (res) => {
        this.sucursales.set(res);
        this.sucursalId.set(res[0]?.id ?? null);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  volver(): void {
    this.location.back();
  }

  continuarAlPago(): void {
    const sucursalId = this.sucursalId();
    if (!sucursalId || this.procesando()) return;
    this.procesando.set(true);
    this.ventasSvc.checkout(sucursalId).subscribe({
      next: (venta) => {
        this.ventaId.set(venta.id);
        this.carritoSvc.cargar().subscribe(); // el carrito ya quedó vacío
        this.iniciarPago(venta.id);
      },
      error: (e: unknown) => {
        this.procesando.set(false);
        this.mostrarError(e, 'No se pudo iniciar la compra.');
      },
    });
  }

  private iniciarPago(ventaId: number): void {
    this.ventasSvc.iniciarPago(ventaId).subscribe({
      next: (pago) => {
        this.pago.set(pago);
        this.paso.set('pago');
        this.procesando.set(false);
      },
      error: (e: unknown) => {
        this.procesando.set(false);
        this.mostrarError(e, 'No se pudo generar el link de pago.');
      },
    });
  }

  irAPagar(): void {
    const url = this.pago()?.checkout_url;
    if (url) window.location.href = url;
  }

  cancelarPedido(): void {
    const ventaId = this.ventaId();
    if (!ventaId || !confirm('¿Cancelar este pedido? El stock se libera.')) return;
    this.ventasSvc.cancelar(ventaId).subscribe({
      next: () => {
        this.snack.open('Pedido cancelado.', 'OK', { duration: 2500 });
        void this.router.navigate(['/catalogo']);
      },
      error: (e: unknown) => this.mostrarError(e, 'No se pudo cancelar el pedido.'),
    });
  }

  private mostrarError(e: unknown, fallback: string): void {
    this.snack.open(
      (e as { error?: { detail?: string } }).error?.detail ?? fallback,
      'Cerrar',
      { duration: 4000 },
    );
  }
}
