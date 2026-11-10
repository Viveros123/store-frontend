import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DescuentoMayorista } from '../../core/models/mayoreo.model';
import { MayoreoService } from './mayoreo.service';
import { MayoreoDialog } from './mayoreo-dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

/** CU53 — Gestionar ventas al por mayor (Administrador). */
@Component({
  selector: 'app-mayoreo-page',
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './mayoreo-page.html',
  styleUrl: './mayoreo-page.scss',
})
export class MayoreoPage implements OnInit {
  private readonly service = inject(MayoreoService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  protected readonly columnas = ['variante', 'cantidad', 'descuento', 'estado', 'acciones'];
  protected readonly reglas = signal<DescuentoMayorista[]>([]);
  protected readonly cargando = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.listar().subscribe({
      next: (lista) => {
        this.reglas.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.snack.open('No se pudo cargar la información.', 'Cerrar', { duration: 4000 });
      },
    });
  }

  nueva(): void {
    this.abrir(null);
  }

  editar(r: DescuentoMayorista): void {
    this.abrir(r);
  }

  cambiarEstado(r: DescuentoMayorista): void {
    this.service.actualizar(r.id, { activo: !r.activo }).subscribe({
      next: () => this.cargar(),
      error: () => this.snack.open('No se pudo actualizar.', 'Cerrar', { duration: 4000 }),
    });
  }

  private abrir(data: DescuentoMayorista | null): void {
    const ref = this.dialog.open(MayoreoDialog, { data, autoFocus: 'first-tabbable' });
    ref.afterClosed().subscribe((res) => {
      if (res) {
        this.snack.open('Guardado.', 'OK', { duration: 2000 });
        this.cargar();
      }
    });
  }
}
