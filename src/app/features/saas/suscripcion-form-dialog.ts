import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Empresa, Plan, Suscripcion } from '../../core/models/saas.model';
import { SaasService } from './saas.service';

export interface SuscripcionDialogData { empresa: Empresa; planes: Plan[]; actual: Suscripcion | null; }

@Component({
  selector: 'app-suscripcion-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Suscripción de {{ data.empresa.nombre }}</h2>
    <mat-dialog-content><form class="dialog-form" [formGroup]="form">
      <mat-form-field appearance="outline"><mat-label>Plan</mat-label><mat-select formControlName="plan_id">@for (p of data.planes; track p.id) { <mat-option [value]="p.id">{{ p.nombre }}</mat-option> }</mat-select></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Estado</mat-label><mat-select formControlName="estado">@for (e of estados; track e) { <mat-option [value]="e">{{ e }}</mat-option> }</mat-select></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Fecha de inicio</mat-label><input matInput type="date" formControlName="fecha_inicio" /></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Vigencia (meses)</mat-label><input matInput type="number" min="1" formControlName="vigencia_meses" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>Observación</mat-label><textarea matInput formControlName="observacion"></textarea></mat-form-field>
      @if (error) { <p class="error full">{{ error }}</p> }
    </form></mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancelar</button><button mat-flat-button class="btn-primary" [disabled]="form.invalid || guardando" (click)="guardar()">Aplicar</button></mat-dialog-actions>
  `,
  styleUrl: './saas-pages.scss',
})
export class SuscripcionFormDialog {
  readonly data = inject<SuscripcionDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<SuscripcionFormDialog>);
  private readonly service = inject(SaasService);
  private readonly fb = inject(FormBuilder);
  readonly estados: Suscripcion['estado'][] = ['ACTIVA', 'SUSPENDIDA', 'VENCIDA', 'CANCELADA'];
  readonly form = this.fb.group({
    plan_id: [this.data.actual?.plan_id ?? this.data.planes[0]?.id ?? null, Validators.required],
    estado: [this.data.actual?.estado ?? 'ACTIVA' as Suscripcion['estado'], Validators.required],
    fecha_inicio: [this.data.actual?.fecha_inicio ?? new Date().toISOString().slice(0, 10), Validators.required],
    vigencia_meses: [1, [Validators.required, Validators.min(1)]],
    observacion: [''],
  });
  guardando = false;
  error = '';
  guardar(): void { if (this.form.invalid) return; this.guardando = true; const v = this.form.getRawValue(); this.service.gestionarSuscripcion({ empresa_id: this.data.empresa.id, plan_id: v.plan_id!, estado: v.estado!, fecha_inicio: v.fecha_inicio!, vigencia_meses: v.vigencia_meses!, observacion: v.observacion || null }).subscribe({ next: (s) => this.ref.close(s), error: (err) => { this.guardando = false; this.error = err?.error?.detail ?? 'No se pudo gestionar la suscripción.'; } }); }
}
