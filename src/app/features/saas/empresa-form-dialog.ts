import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Empresa, Plan } from '../../core/models/saas.model';
import { RegistrarEmpresaDto, SaasService } from './saas.service';

export interface EmpresaDialogData {
  empresa: Empresa | null;
  planes: Plan[];
}

@Component({
  selector: 'app-empresa-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ data.empresa ? 'Editar empresa' : 'Registrar empresa' }}</h2>
    <mat-dialog-content>
      <form class="dialog-form" [formGroup]="form">
        <h3 class="dialog-section">Empresa</h3>
        <mat-form-field appearance="outline"><mat-label>Nombre</mat-label><input matInput formControlName="nombre" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Identificador</mat-label><input matInput formControlName="identificador" placeholder="moda-sur" /></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Razón social</mat-label><input matInput formControlName="razon_social" /></mat-form-field>
        @if (!data.empresa) {
          <h3 class="dialog-section">Administrador inicial</h3>
          <mat-form-field appearance="outline"><mat-label>Nombre</mat-label><input matInput formControlName="admin_nombre" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Apellido</mat-label><input matInput formControlName="admin_apellido" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" formControlName="admin_email" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Contraseña temporal</mat-label><input matInput type="password" formControlName="admin_password" /></mat-form-field>
          <h3 class="dialog-section">Suscripción inicial</h3>
          <mat-form-field appearance="outline"><mat-label>Plan</mat-label><mat-select formControlName="plan_id">@for (p of data.planes; track p.id) { <mat-option [value]="p.id">{{ p.nombre }}</mat-option> }</mat-select></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Vigencia (meses)</mat-label><input matInput type="number" min="1" formControlName="vigencia_meses" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Fecha de inicio</mat-label><input matInput type="date" formControlName="fecha_inicio" /></mat-form-field>
        }
        @if (error) { <p class="error full">{{ error }}</p> }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancelar</button><button mat-flat-button class="btn-primary" [disabled]="form.invalid || guardando" (click)="guardar()">Guardar</button></mat-dialog-actions>
  `,
  styleUrl: './saas-pages.scss',
})
export class EmpresaFormDialog {
  readonly data = inject<EmpresaDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<EmpresaFormDialog>);
  private readonly service = inject(SaasService);
  private readonly fb = inject(FormBuilder);
  guardando = false;
  error = '';
  readonly form = this.fb.group({
    nombre: [this.data.empresa?.nombre ?? '', [Validators.required, Validators.minLength(2)]],
    identificador: [{ value: this.data.empresa?.identificador ?? '', disabled: !!this.data.empresa }, [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    razon_social: [this.data.empresa?.razon_social ?? ''],
    admin_nombre: ['', this.data.empresa ? [] : [Validators.required, Validators.minLength(2)]],
    admin_apellido: ['', this.data.empresa ? [] : [Validators.required, Validators.minLength(2)]],
    admin_email: ['', this.data.empresa ? [] : [Validators.required, Validators.email]],
    admin_password: ['', this.data.empresa ? [] : [Validators.required, Validators.minLength(8)]],
    plan_id: [this.data.planes[0]?.id ?? null, this.data.empresa ? [] : [Validators.required]],
    fecha_inicio: [new Date().toISOString().slice(0, 10), Validators.required],
    vigencia_meses: [1, [Validators.required, Validators.min(1)]],
  });

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando = true;
    this.error = '';
    const v = this.form.getRawValue();
    const request = this.data.empresa
      ? this.service.actualizarEmpresa(this.data.empresa.id, { nombre: v.nombre!, razon_social: v.razon_social || null })
      : this.service.registrarEmpresa({
          identificador: v.identificador!, nombre: v.nombre!, razon_social: v.razon_social || null,
          administrador: { nombre: v.admin_nombre!, apellido: v.admin_apellido!, email: v.admin_email!, password: v.admin_password! },
          plan_id: v.plan_id!, fecha_inicio: v.fecha_inicio!, vigencia_meses: v.vigencia_meses!,
        } satisfies RegistrarEmpresaDto);
    request.subscribe({ next: (empresa) => this.ref.close(empresa), error: (err) => { this.guardando = false; this.error = err?.error?.detail ?? 'No se pudo guardar la empresa.'; } });
  }
}
