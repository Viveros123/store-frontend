import { Component, computed, inject, signal } from '@angular/core';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { DisponibilidadSucursal } from '../../core/models/inventario.model';
import { Reserva } from '../../core/models/reserva.model';
import { ReservasService } from './reservas.service';

export interface ReservarDialogData {
  varianteId: number;
  productoNombre: string;
  talla: string | null;
  color: string | null;
  sucursales: DisponibilidadSucursal[];
}

function fechaISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

@Component({
  selector: 'app-reservar-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Reservar para probar</h2>
    <mat-dialog-content>
      <p class="prenda">
        <strong>{{ data.productoNombre }}</strong>
        @if (data.talla || data.color) {
          <span class="detalle">{{ data.talla }} · {{ data.color }}</span>
        }
      </p>

      <form [formGroup]="form" class="grid">
        <mat-form-field appearance="outline">
          <mat-label>Sucursal</mat-label>
          <mat-select formControlName="sucursal_id" (selectionChange)="onCambio()">
            @for (s of data.sucursales; track s.sucursal_id) {
              <mat-option [value]="s.sucursal_id">
                {{ s.sucursal }} — {{ s.ciudad }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Cantidad</mat-label>
          <input
            matInput
            type="number"
            min="1"
            [max]="maxCantidad()"
            formControlName="cantidad"
          />
          <mat-hint>Máximo {{ maxCantidad() }} disponible(s) en esa sucursal.</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fecha</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            [min]="hoy"
            formControlName="fecha"
            (dateChange)="onCambio()"
            readonly
          />
          <mat-datepicker-toggle matIconSuffix [for]="picker" />
          <mat-datepicker #picker />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Duración</mat-label>
          <mat-select formControlName="duracion_minutos" (selectionChange)="onCambio()">
            <mat-option [value]="30">30 minutos</mat-option>
            <mat-option [value]="60">1 hora</mat-option>
          </mat-select>
        </mat-form-field>
      </form>

      <div class="slots">
        <span class="etiqueta">Horario</span>
        @if (cargandoSlots()) {
          <p class="muted">Consultando turnos libres…</p>
        } @else if (slots().length > 0) {
          <div class="opciones-slot">
            @for (s of slots(); track s) {
              <button
                type="button"
                class="pill"
                [class.sel]="horaSel() === s"
                (click)="horaSel.set(s)"
              >
                {{ s.slice(0, 5) }}
              </button>
            }
          </div>
        } @else {
          <p class="muted sin-turnos">
            <mat-icon>event_busy</mat-icon>
            No hay turnos libres ese día. Probá otra fecha o sucursal.
          </p>
        }
      </div>

      @if (error()) {
        <p class="err">{{ error() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Cancelar</button>
      <button
        mat-flat-button
        class="btn-primary"
        (click)="confirmar()"
        [disabled]="!horaSel() || form.invalid || guardando()"
      >
        @if (guardando()) {
          <mat-spinner diameter="18" />
        } @else {
          Confirmar reserva
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .prenda { margin: 0 0 .75rem; }
    .detalle { color: #64748b; margin-left: .4rem; font-size: .9rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: .4rem 1rem; min-width: min(480px, 86vw); }
    mat-form-field { width: 100%; }
    .slots { margin-top: .5rem; }
    .etiqueta { display: block; font-size: .8rem; font-weight: 600; color: #334155; margin-bottom: .5rem; }
    .opciones-slot { display: flex; gap: .5rem; flex-wrap: wrap; max-height: 160px; overflow-y: auto; }
    .pill {
      min-width: 64px; height: 38px; padding: 0 .8rem; border-radius: 8px;
      border: 1px solid #e2e8f0; background: #fff; color: #334155; font-size: .88rem; cursor: pointer;
    }
    .pill:hover { border-color: var(--fs-green-500); }
    .pill.sel { border-color: var(--fs-green-700); background: var(--fs-green-700); color: #fff; }
    .muted { color: #94a3b8; font-size: .88rem; margin: 0; }
    .sin-turnos { display: flex; align-items: center; gap: .4rem; }
    .err { color:#b3261e; font-size:.85rem; margin: .75rem 0 0; }
    .btn-primary { background: var(--fs-green-700); color: #fff; }
    @media (max-width: 480px) { .grid { grid-template-columns: 1fr; } }
  `,
})
export class ReservarDialog {
  private readonly fb = inject(FormBuilder);
  private readonly reservasSvc = inject(ReservasService);
  protected readonly ref = inject(MatDialogRef<ReservarDialog, Reserva>);
  protected readonly data = inject<ReservarDialogData>(MAT_DIALOG_DATA);

  protected readonly hoy = new Date();
  protected readonly horaSel = signal<string | null>(null);
  protected readonly slots = signal<string[]>([]);
  protected readonly cargandoSlots = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly maxCantidad = computed(() => {
    const s = this.data.sucursales.find(
      (x) => x.sucursal_id === this.form?.controls.sucursal_id.value,
    );
    return s?.cantidad_disponible ?? 1;
  });

  protected readonly form = this.fb.nonNullable.group({
    sucursal_id: [
      this.data.sucursales[0]?.sucursal_id ?? (null as number | null),
      [Validators.required],
    ],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    fecha: [this.hoy, [Validators.required]],
    duracion_minutos: [30, [Validators.required]],
  });

  constructor() {
    this.onCambio();
  }

  onCambio(): void {
    this.horaSel.set(null);
    const v = this.form.getRawValue();
    if (!v.sucursal_id || !v.fecha) return;
    this.cargandoSlots.set(true);
    this.reservasSvc
      .disponibilidad(v.sucursal_id, fechaISO(v.fecha), v.duracion_minutos)
      .subscribe({
        next: (res) => {
          this.slots.set(res.slots);
          this.cargandoSlots.set(false);
        },
        error: () => {
          this.slots.set([]);
          this.cargandoSlots.set(false);
        },
      });
  }

  async confirmar(): Promise<void> {
    const hora = this.horaSel();
    if (!hora || this.form.invalid || this.guardando()) return;
    this.guardando.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    try {
      const res = await firstValueFrom(
        this.reservasSvc.crear({
          sucursal_id: v.sucursal_id!,
          fecha: fechaISO(v.fecha),
          hora_inicio: hora.slice(0, 5),
          duracion_minutos: v.duracion_minutos,
          items: [{ variante_id: this.data.varianteId, cantidad: v.cantidad }],
        }),
      );
      this.ref.close(res);
    } catch (e: unknown) {
      this.error.set(
        (e as { error?: { detail?: string } }).error?.detail ??
          'No se pudo crear la reserva.',
      );
    } finally {
      this.guardando.set(false);
    }
  }
}
