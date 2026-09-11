import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TiendaService } from './tienda.service';
import { ProductoCard } from './producto-card';
import { Categoria } from '../../core/models/catalogo.model';
import {
  CatalogoProducto,
  OrdenCatalogo,
} from '../../core/models/catalogo-cliente.model';

@Component({
  selector: 'app-catalogo-page',
  imports: [
    ReactiveFormsModule,
    ProductoCard,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressBarModule,
  ],
  templateUrl: './catalogo-page.html',
  styleUrl: './catalogo-page.scss',
})
export class CatalogoPage implements OnInit {
  private readonly tienda = inject(TiendaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly SIZE = 12;

  protected readonly qCtrl = new FormControl('', { nonNullable: true });
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaId = signal<number | null>(null);
  protected readonly orden = signal<OrdenCatalogo>('novedad');

  protected readonly cargando = signal(true);
  protected readonly productos = signal<CatalogoProducto[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(0);

  protected readonly sinResultados = computed(
    () => !this.cargando() && this.productos().length === 0,
  );

  ngOnInit(): void {
    this.tienda.categorias().subscribe((c) => this.categorias.set(c));

    this.qCtrl.valueChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.page.set(0);
        this.cargar();
      });

    this.cargar();
  }

  elegirCategoria(id: number | null): void {
    this.categoriaId.set(id === this.categoriaId() ? null : id);
    this.page.set(0);
    this.cargar();
  }

  cambiarOrden(v: OrdenCatalogo): void {
    this.orden.set(v);
    this.page.set(0);
    this.cargar();
  }

  onPage(e: PageEvent): void {
    this.page.set(e.pageIndex);
    this.cargar();
  }

  limpiarFiltros(): void {
    this.qCtrl.setValue('');
    this.categoriaId.set(null);
    this.orden.set('novedad');
    this.page.set(0);
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.tienda
      .listar({
        q: this.qCtrl.value.trim() || undefined,
        categoria_id: this.categoriaId(),
        orden: this.orden(),
        page: this.page() + 1,
        size: this.SIZE,
      })
      .subscribe({
        next: (r) => {
          this.productos.set(r.items);
          this.total.set(r.total);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
  }
}
