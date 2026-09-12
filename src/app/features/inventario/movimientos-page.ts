import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { toSignal } from '@angular/core/rxjs-interop';
import { SucursalOpcion } from '../../core/models/sucursal.model';
import { MovimientoInventario } from '../../core/models/inventario.model';
import { InventarioService } from './inventario.service';
import { SucursalesService } from '../sucursales/sucursales.service';
import { RegistrarMovimientoDialog } from './registrar-movimiento-dialog';

@Component({
  selector: 'app-movimientos-page',
  imports: [
    DecimalPipe,
    DatePipe,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
  ],
  templateUrl: './movimientos-page.html',
  styleUrl: './movimientos-page.scss',
})
export class MovimientosPage implements OnInit {
  private readonly service = inject(InventarioService);
  private readonly sucursalesSvc = inject(SucursalesService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  protected readonly columnas = [
    'fecha',
    'producto',
    'variante',
    'sucursal',
    'tipo',
    'cantidad',
    'costo',
    'usuario',
    'nota',
  ];

  protected readonly sucursales = toSignal(this.sucursalesSvc.opciones(), {
    initialValue: [] as SucursalOpcion[],
  });

  protected readonly cargando = signal(false);
  protected readonly items = signal<MovimientoInventario[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(0);
  protected readonly size = signal(10);
  protected readonly sucursalId = signal<number | null>(null);

  protected readonly sinResultados = computed(
    () => !this.cargando() && this.items().length === 0,
  );

  ngOnInit(): void {
    this.cargar();
  }

  cambiarSucursal(valor: number | null): void {
    this.sucursalId.set(valor);
    this.page.set(0);
    this.cargar();
  }

  private readonly etiquetasTipo: Record<string, string> = {
    INGRESO: 'Ingreso',
    AJUSTE: 'Ajuste',
    SALIDA_VENTA: 'Venta',
    LIBERACION_RESERVA: 'Liberación de reserva',
  };

  etiquetaTipo(tipo: string): string {
    return this.etiquetasTipo[tipo] ?? tipo;
  }

  onPage(ev: PageEvent): void {
    this.page.set(ev.pageIndex);
    this.size.set(ev.pageSize);
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.service
      .listarMovimientos({
        sucursal_id: this.sucursalId(),
        page: this.page() + 1,
        size: this.size(),
      })
      .subscribe({
        next: (res) => {
          this.items.set(res.items);
          this.total.set(res.total);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.snack.open('No se pudieron cargar los movimientos.', 'Cerrar', {
            duration: 4000,
          });
        },
      });
  }

  registrar(): void {
    const ref = this.dialog.open(RegistrarMovimientoDialog, {
      data: {},
      autoFocus: 'first-tabbable',
    });
    ref.afterClosed().subscribe((res) => {
      if (res) {
        this.snack.open('Ingreso registrado. Se actualizó el stock.', 'OK', {
          duration: 3000,
        });
        this.cargar();
      }
    });
  }
}
