import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Plan } from '../../core/models/saas.model';
import { SaasService } from './saas.service';

@Component({
  selector: 'app-plan-form-dialog',
  imports: [FormsModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Configurar plan {{ plan.nombre }}</h2>
    <mat-dialog-content>
      <form class="dialog-form" [formGroup]="form">
        <mat-form-field appearance="outline"><mat-label>Nombre</mat-label><input matInput formControlName="nombre" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Precio mensual (Bs)</mat-label><input matInput type="number" min="0" formControlName="precio_mensual" /></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Descripción</mat-label><textarea matInput formControlName="descripcion"></textarea></mat-form-field>
        <mat-checkbox class="full" formControlName="activo">Plan disponible para nuevas asignaciones</mat-checkbox>
        <h3 class="dialog-section">Límites</h3>
        @for (limite of limites; track limite.codigo) {
          <div class="config-row full"><code>{{ limite.codigo }}</code><mat-form-field appearance="outline"><mat-label>Máximo</mat-label><input matInput type="number" min="0" [(ngModel)]="limite.valor_maximo" [ngModelOptions]="{standalone:true}" /></mat-form-field></div>
        }
        <h3 class="dialog-section">Funcionalidades</h3>
        @for (funcionalidad of funcionalidades; track funcionalidad.codigo) {
          <mat-checkbox class="full" [(ngModel)]="funcionalidad.habilitada" [ngModelOptions]="{standalone:true}">{{ funcionalidad.codigo }}</mat-checkbox>
        }
        @if (error) { <p class="error full">{{ error }}</p> }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancelar</button><button mat-flat-button class="btn-primary" [disabled]="form.invalid || guardando" (click)="guardar()">Guardar configuración</button></mat-dialog-actions>
  `,
  styleUrl: './saas-pages.scss',
})
export class PlanFormDialog {
  readonly plan = inject<Plan>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<PlanFormDialog>);
  private readonly service = inject(SaasService);
  private readonly fb = inject(FormBuilder);
  readonly limites = this.plan.limites.map(({ codigo, valor_maximo }) => ({ codigo, valor_maximo }));
  readonly funcionalidades = this.plan.funcionalidades.map(({ codigo, habilitada }) => ({ codigo, habilitada }));
  readonly form = this.fb.group({
    nombre: [this.plan.nombre, [Validators.required, Validators.minLength(2)]],
    descripcion: [this.plan.descripcion ?? ''],
    precio_mensual: [this.plan.precio_mensual, [Validators.required, Validators.min(0)]],
    activo: [this.plan.activo],
  });
  guardando = false;
  error = '';

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando = true;
    const v = this.form.getRawValue();
    this.service.actualizarPlan(this.plan.id, {
      nombre: v.nombre!, descripcion: v.descripcion || null,
      precio_mensual: v.precio_mensual!, activo: !!v.activo,
      limites: this.limites, funcionalidades: this.funcionalidades,
    }).subscribe({ next: (p) => this.ref.close(p), error: (err) => { this.guardando = false; this.error = err?.error?.detail ?? 'No se pudo actualizar el plan.'; } });
  }
}
