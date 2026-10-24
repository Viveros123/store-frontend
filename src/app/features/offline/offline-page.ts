import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, fromEvent, timer } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { CopiaOffline } from '../../core/models/offline.model';
import { SucursalOpcion } from '../../core/models/sucursal.model';
import { filtrarCatalogoOffline } from '../../core/offline/offline-catalog.util';
import { OfflineDataService } from '../../core/offline/offline-data.service';
import { SucursalesService } from '../sucursales/sucursales.service';

@Component({
  selector: 'app-offline-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  templateUrl: './offline-page.html',
  styleUrl: './offline-page.scss',
})
export class OfflinePage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly offline = inject(OfflineDataService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly sucursales = signal<SucursalOpcion[]>([]);
  protected readonly sucursalId = signal<number | null>(null);
  protected readonly copia = signal<CopiaOffline | null>(null);
  protected readonly cargando = signal(true);
  protected readonly sincronizando = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal('');
  protected readonly online = signal(false);
  protected readonly qCtrl = new FormControl('', { nonNullable: true });
  protected readonly tallaCtrl = new FormControl('', { nonNullable: true });
  protected readonly colorCtrl = new FormControl('', { nonNullable: true });
  private readonly q = signal('');
  private readonly talla = signal('');
  private readonly color = signal('');

  protected readonly variantes = computed(() =>
    filtrarCatalogoOffline(this.copia(), this.q(), this.talla(), this.color()),
  );
  protected readonly tallas = computed(() =>
    [...new Set(this.copia()?.productos.flatMap((p) => p.variantes.map((v) => v.talla)) ?? [])].sort(),
  );
  protected readonly colores = computed(() =>
    [...new Set(this.copia()?.productos.flatMap((p) => p.variantes.map((v) => v.color)) ?? [])].sort(),
  );

  ngOnInit(): void {
    const usuario = this.auth.user();
    this.sucursalId.set(usuario?.sucursal_id ?? null);
    fromEvent(window, 'online').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      void this.comprobarServidor();
    });
    fromEvent(window, 'offline').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.online.set(false));
    timer(0, 10000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      void this.comprobarServidor();
    });
    this.qCtrl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe((v) => this.q.set(v));
    this.tallaCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v) => this.talla.set(v));
    this.colorCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v) => this.color.set(v));
    this.cargarLocal();
  }

  protected cambiarSucursal(id: number): void {
    this.sucursalId.set(id);
    this.error.set('');
    this.cargarLocal(id);
  }

  protected sincronizar(): void {
    const sucursalId = this.sucursalId();
    if (sucursalId == null || this.sincronizando()) return;
    if (!navigator.onLine) {
      this.error.set('No hay conexión. Se conserva la última copia válida.');
      return;
    }
    this.sincronizando.set(true);
    this.error.set('');
    this.exito.set('');
    this.offline.preparar(sucursalId).then((copia) => {
      this.online.set(true);
      this.copia.set(copia);
      this.exito.set(`Datos preparados: ${copia.total_productos} productos y ${copia.total_variantes} variantes.`);
    }).catch((err) => {
      this.online.set(false);
      this.error.set(this.mensajeError(err));
    }).finally(() => this.sincronizando.set(false));
  }

  private cargarSucursales(): void {
    this.sucursalesService.opciones().subscribe({
      next: (items) => {
        this.online.set(true);
        this.sucursales.set(items);
        if (this.sucursalId() == null && items.length === 1) {
          this.cambiarSucursal(items[0].id);
        }
      },
      error: () => {
        this.online.set(false);
        if (!this.copia()) this.error.set('No se pudieron consultar las sucursales. Puede reintentar cuando tenga conexión.');
      },
    });
  }

  private async comprobarServidor(): Promise<void> {
    const estabaDisponible = this.online();
    const disponible = await this.offline.servidorDisponible();
    this.online.set(disponible);
    if (disponible && !estabaDisponible) this.cargarSucursales();
  }

  private async cargarLocal(sucursalId?: number): Promise<void> {
    const empresaId = this.auth.user()?.empresa_id;
    if (empresaId == null) {
      this.cargando.set(false);
      this.error.set('El usuario no está asociado a una empresa.');
      return;
    }
    this.cargando.set(true);
    try {
      if (sucursalId != null) {
        this.copia.set(await this.offline.obtener(empresaId, sucursalId));
      } else {
        const copias = await this.offline.listarEmpresa(empresaId);
        const seleccionada = copias[0] ?? null;
        this.copia.set(seleccionada);
        if (seleccionada) this.sucursalId.set(seleccionada.sucursal_id);
      }
    } catch (err) {
      this.error.set(this.mensajeError(err));
    } finally {
      this.cargando.set(false);
    }
  }

  private mensajeError(err: any): string {
    if (typeof err?.error?.detail === 'string') return err.error.detail;
    if (typeof err?.message === 'string') return err.message;
    return 'No se pudo preparar el catálogo. La copia anterior no fue modificada.';
  }
}
