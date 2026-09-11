import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TiendaService } from './tienda.service';
import {
  CatalogoProductoDetalle,
  CatalogoVariante,
} from '../../core/models/catalogo-cliente.model';
import { DisponibilidadSucursal } from '../../core/models/inventario.model';

@Component({
  selector: 'app-producto-detalle-cliente-page',
  imports: [
    RouterLink,
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './producto-detalle-cliente-page.html',
  styleUrl: './producto-detalle-cliente-page.scss',
})
export class ProductoDetalleClientePage {
  private readonly tienda = inject(TiendaService);
  private readonly route = inject(ActivatedRoute);

  protected readonly cargando = signal(true);
  protected readonly noEncontrado = signal(false);
  protected readonly producto = signal<CatalogoProductoDetalle | null>(null);

  protected readonly colorSel = signal<number | null>(null);
  protected readonly tallaSel = signal<number | null>(null);

  protected readonly colores = computed(() => {
    const vs = this.producto()?.variantes ?? [];
    const vistos = new Map<number, CatalogoVariante>();
    for (const v of vs) if (!vistos.has(v.color_id)) vistos.set(v.color_id, v);
    return [...vistos.values()];
  });

  protected readonly tallasParaColor = computed(() => {
    const vs = this.producto()?.variantes ?? [];
    const color = this.colorSel();
    return vs.filter((v) => (color == null ? true : v.color_id === color));
  });

  protected readonly varianteSeleccionada = computed(() => {
    const vs = this.producto()?.variantes ?? [];
    return (
      vs.find(
        (v) => v.color_id === this.colorSel() && v.talla_id === this.tallaSel(),
      ) ?? null
    );
  });

  protected readonly imagenMostrada = computed(
    () => this.varianteSeleccionada()?.imagen_efectivo ?? this.producto()?.imagen_url ?? null,
  );

  protected readonly disponibilidad = signal<DisponibilidadSucursal[]>([]);
  protected readonly cargandoDisponibilidad = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tienda.detalle(id).subscribe({
      next: (d) => {
        this.producto.set(d);
        this.cargando.set(false);
        if (d.variantes.length > 0) {
          this.colorSel.set(d.variantes[0].color_id);
          this.tallaSel.set(d.variantes[0].talla_id);
        }
      },
      error: () => {
        this.cargando.set(false);
        this.noEncontrado.set(true);
      },
    });

    // CU12: consultar disponibilidad por sucursal de la variante elegida
    effect(() => {
      const variante = this.varianteSeleccionada();
      if (!variante) {
        this.disponibilidad.set([]);
        return;
      }
      this.cargandoDisponibilidad.set(true);
      this.tienda.disponibilidad(variante.id).subscribe({
        next: (res) => {
          this.disponibilidad.set(res);
          this.cargandoDisponibilidad.set(false);
        },
        error: () => {
          this.disponibilidad.set([]);
          this.cargandoDisponibilidad.set(false);
        },
      });
    });
  }

  elegirColor(colorId: number): void {
    this.colorSel.set(colorId);
    const disponibles = this.tallasParaColor();
    if (!disponibles.some((v) => v.talla_id === this.tallaSel())) {
      this.tallaSel.set(disponibles[0]?.talla_id ?? null);
    }
  }

  elegirTalla(tallaId: number): void {
    this.tallaSel.set(tallaId);
  }
}
