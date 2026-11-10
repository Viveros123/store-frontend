import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { DescuentoMayorista, VarianteOpcionMayoreo } from '../../core/models/mayoreo.model';
import { MayoreoService } from './mayoreo.service';

@Component({
  selector: 'app-mayoreo-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar venta al por mayor' : 'Nueva venta al por mayor' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="col" (ngSubmit)="guardar()">
        <mat-form-field appearance="outline">
          <mat-label>Producto y variante</mat-label>
          <mat-select formControlName="variante_id" [disabled]="!!data">
            @for (g of gruposVariantes(); track g.producto) {
              <mat-optgroup [label]="g.producto">
                @for (v of g.variantes; track v.id) {
                  <mat-option [value]="v.id">{{ v.talla }} · {{ v.color }}</mat-option>
                }
              </mat-optgroup>
            }
          </mat-select>
        </mat-form-field>
        <p class="ayuda">
          Se aplica solo en todas las sucursales de tu empresa, cuando el cliente lleva esa
          cantidad o más de esa variante puntual.
        </p>
        <div class="fila">
          <mat-form-field appearance="outline">
            <mat-label>Cantidad mínima</mat-label>
            <input matInput type="number" min="2" step="1" formControlName="cantidad_minima" />
            <span matTextSuffix>unid.</span>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Descuento</mat-label>
            <input matInput type="number" min="0.01" max="90" step="0.01" formControlName="porcentaje_descuento" />
            <span matTextSuffix>%</span>
          </mat-form-field>
        </div>
        @if (data) {
          <mat-slide-toggle formControlName="activo">Activa</mat-slide-toggle>
        }
        @if (error()) {
          <p class="err">{{ error() }}</p>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancelar</button>
      <button mat-flat-button (click)="guardar()" [disabled]="guardando()">
        {{ data ? 'Guardar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .col { display: flex; flex-direction: column; gap: .4rem; padding-top: .5rem; min-width: min(420px, 80vw); }
    .fila { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    mat-form-field { width: 100%; }
    .err { color: #b3261e; font-size: .85rem; margin: 0; }
    .ayuda { margin: 0; color: #64748b; font-size: .82rem; max-width: 420px; }
    @media (max-width: 480px) { .fila { grid-template-columns: 1fr; } }
  `,
})
export class MayoreoDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MayoreoService);
  protected readonly ref = inject(MatDialogRef<MayoreoDialog, DescuentoMayorista>);
  protected readonly data = inject<DescuentoMayorista | null>(MAT_DIALOG_DATA);

  private readonly variantes = signal<VarianteOpcionMayoreo[]>([]);
  protected readonly gruposVariantes = computed(() => {
    const porProducto = new Map<string, VarianteOpcionMayoreo[]>();
    for (const v of this.variantes()) {
      porProducto.set(v.producto, [...(porProducto.get(v.producto) ?? []), v]);
    }
    return [...porProducto.entries()].map(([producto, variantes]) => ({ producto, variantes }));
  });
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    variante_id: [this.data?.variante_id ?? (null as number | null), Validators.required],
    cantidad_minima: [
      this.data?.cantidad_minima ?? (null as number | null),
      [Validators.required, Validators.min(2)],
    ],
    porcentaje_descuento: [
      this.data ? +this.data.porcentaje_descuento : (null as number | null),
      [Validators.required, Validators.min(0.01), Validators.max(90)],
    ],
    activo: [this.data?.activo ?? true],
  });

  ngOnInit(): void {
    this.service.variantesOpciones().subscribe((v) => this.variantes.set(v));
  }

  async guardar(): Promise<void> {
    if (this.form.invalid || this.guardando()) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.error.set(null);
    try {
      const res = this.data
        ? await firstValueFrom(
            this.service.actualizar(this.data.id, {
              cantidad_minima: v.cantidad_minima!,
              porcentaje_descuento: v.porcentaje_descuento!,
              activo: v.activo,
            }),
          )
        : await firstValueFrom(
            this.service.crear({
              variante_id: v.variante_id!,
              cantidad_minima: v.cantidad_minima!,
              porcentaje_descuento: v.porcentaje_descuento!,
            }),
          );
      this.ref.close(res);
    } catch (e: unknown) {
      const detail = (e as { error?: { detail?: unknown } }).error?.detail;
      this.error.set(typeof detail === 'string' ? detail : 'No se pudo guardar.');
    } finally {
      this.guardando.set(false);
    }
  }
}
