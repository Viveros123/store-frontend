import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';

import { CambioPlanPreview, Plan } from '../../core/models/saas.model';
import { SaasService } from './saas.service';

export interface CambioPlanDialogData {
  empresaId?: number;
  empresaNombre: string;
  planActualId?: number;
}

@Component({
  selector: 'app-cambio-plan-dialog',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Cambiar o renovar plan</h2>
    <mat-dialog-content>
      <p class="muted">{{ data.empresaNombre }}</p>
      @if (cargando()) { <mat-progress-bar mode="indeterminate" /> }
      <form class="dialog-form" [formGroup]="form" (ngSubmit)="validar()">
        <mat-form-field appearance="outline">
          <mat-label>Nuevo plan</mat-label>
          <mat-select formControlName="plan_id">
            @for (plan of planes(); track plan.id) {
              <mat-option [value]="plan.id">{{ plan.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Periodo (meses)</mat-label>
          <input matInput type="number" min="1" max="120" formControlName="vigencia_meses" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Observación</mat-label>
          <textarea matInput rows="2" formControlName="observacion"></textarea>
        </mat-form-field>
      </form>

      @if (vista(); as v) {
        <section class="resumen-cambio" [class.incompatible]="!v.compatible">
          <strong>{{ v.tipo_cambio === 'RENOVACION' ? 'Renovación' : 'Cambio' }}:</strong>
          {{ v.plan_actual.nombre }} → {{ v.plan_nuevo.nombre }}
          <p>Nueva vigencia: {{ v.fecha_inicio_nueva | date:'dd/MM/yyyy' }} — {{ v.fecha_vencimiento_nueva | date:'dd/MM/yyyy' }}</p>
          @if (!v.compatible) {
            <p><strong>No es compatible con el consumo actual:</strong></p>
            <ul>@for (item of v.incompatibilidades; track item.codigo) { <li>{{ item.mensaje }}</li> }</ul>
          }
        </section>
      }
      @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="cargando()">Cancelar</button>
      <button mat-stroked-button (click)="validar()" [disabled]="cargando() || form.invalid">
        Revisar cambio
      </button>
      <button mat-flat-button class="btn-primary" (click)="confirmar()"
        [disabled]="cargando() || !vista()?.compatible">
        {{ cargando() ? 'Procesando…' : 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; min-width:min(620px,80vw); }
    .full { grid-column:1/-1; }
    .muted { color:#64748b; }
    .resumen-cambio { margin-top:1rem; padding:1rem; border-radius:10px; background:#ecfdf5; }
    .resumen-cambio.incompatible { background:#fff7ed; }
    .resumen-cambio p { margin:.4rem 0; }
    .error { color:#b91c1c; }
    .btn-primary { background:#166534; color:white; }
    @media(max-width:650px){ .dialog-form{grid-template-columns:1fr;min-width:0}.full{grid-column:1} }
  `],
})
export class CambioPlanDialog implements OnInit {
  private readonly service = inject(SaasService);
  private readonly ref = inject(MatDialogRef<CambioPlanDialog>);
  protected readonly data = inject<CambioPlanDialogData>(MAT_DIALOG_DATA);
  protected readonly planes = signal<Plan[]>([]);
  protected readonly vista = signal<CambioPlanPreview | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  private idempotencyKey = '';

  protected readonly form = new FormGroup({
    plan_id: new FormControl<number | null>(this.data.planActualId ?? null, Validators.required),
    vigencia_meses: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(120)] }),
    observacion: new FormControl(''),
  });

  ngOnInit(): void {
    this.cargando.set(true);
    this.service.planes(true).pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: (planes) => this.planes.set(planes),
      error: (err) => this.error.set(this.mensajeError(err, 'No se pudieron cargar los planes.')),
    });
  }

  validar(): void {
    if (this.form.invalid || this.cargando()) return;
    this.cargando.set(true);
    this.error.set('');
    this.vista.set(null);
    this.idempotencyKey = '';
    this.service.validarCambio(this.dto()).pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: (vista) => {
        this.vista.set(vista);
        this.idempotencyKey = this.nuevaClave();
      },
      error: (err) => this.error.set(this.mensajeError(err, 'No se pudo validar el cambio.')),
    });
  }

  confirmar(): void {
    if (!this.vista()?.compatible || this.cargando()) return;
    if (!this.idempotencyKey) this.idempotencyKey = this.nuevaClave();
    this.cargando.set(true);
    this.error.set('');
    this.service.cambiarPlan(this.dto(), this.idempotencyKey)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (resultado) => this.ref.close(resultado),
        error: (err) => this.error.set(this.mensajeError(err, 'No se pudo aplicar el cambio. Puede reintentar.')),
      });
  }

  private dto() {
    return {
      ...(this.data.empresaId == null ? {} : { empresa_id: this.data.empresaId }),
      plan_id: this.form.controls.plan_id.value!,
      vigencia_meses: this.form.controls.vigencia_meses.value,
      observacion: this.form.controls.observacion.value?.trim() || null,
    };
  }

  private nuevaClave(): string {
    return globalThis.crypto?.randomUUID?.() ?? `cambio-${Date.now()}-${Math.random()}`;
  }

  private mensajeError(err: any, defecto: string): string {
    return typeof err?.error?.detail === 'string' ? err.error.detail : defecto;
  }
}
