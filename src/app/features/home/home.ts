import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TiendaService } from '../tienda/tienda.service';
import { ProductoCard } from '../tienda/producto-card';
import { CatalogoProducto } from '../../core/models/catalogo-cliente.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatIconModule, ProductoCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly tienda = inject(TiendaService);

  protected readonly destacados = signal<CatalogoProducto[]>([]);
  protected readonly cargando = signal(true);

  constructor() {
    this.tienda.destacados(8).subscribe({
      next: (items) => {
        this.destacados.set(items);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
