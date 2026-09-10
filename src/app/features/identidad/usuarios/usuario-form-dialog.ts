import { Component, inject, signal } from '@angular/core';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Rol, Usuario } from '../../../core/models/usuario.model';
import { UsuariosService } from './usuarios.service';

export interface UsuarioFormData {
  usuario: Usuario | null;
  roles: Rol[];
}

@Component({
  selector: 'app-usuario-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatProgressBarModule,
  ],
  templateUrl: './usuario-form-dialog.html',
  styleUrl: './usuario-form-dialog.scss',
})
export class UsuarioFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuariosService);
  private readonly ref = inject(MatDialogRef<UsuarioFormDialog, Usuario>);
  protected readonly data = inject<UsuarioFormData>(MAT_DIALOG_DATA);

  protected readonly esEdicion = this.data.usuario !== null;
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nombre: [this.data.usuario?.nombre ?? '', [Validators.required, Validators.minLength(2)]],
    apellido: [this.data.usuario?.apellido ?? '', [Validators.required, Validators.minLength(2)]],
    email: [this.data.usuario?.email ?? '', [Validators.required, Validators.email]],
    telefono: [this.data.usuario?.telefono ?? ''],
    rol_id: [this.data.usuario?.rol_id ?? (null as number | null), [Validators.required]],
    password: ['', this.esEdicion ? [] : [Validators.required, Validators.minLength(8)]],
    activo: [this.data.usuario?.activo ?? true],
  });

  async guardar(): Promise<void> {
    if (this.form.invalid || this.guardando()) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();

    try {
      let resultado: Usuario;
      if (this.esEdicion && this.data.usuario) {
        const dto: Record<string, unknown> = {
          nombre: v.nombre,
          apellido: v.apellido,
          email: v.email,
          telefono: v.telefono || null,
          rol_id: v.rol_id,
          activo: v.activo,
        };
        if (v.password) dto['password'] = v.password;
        resultado = await firstValueFrom(
          this.service.actualizar(this.data.usuario.id, dto),
        );
      } else {
        resultado = await firstValueFrom(
          this.service.crear({
            nombre: v.nombre,
            apellido: v.apellido,
            email: v.email,
            telefono: v.telefono || null,
            rol_id: v.rol_id as number,
            password: v.password,
          }),
        );
      }
      this.ref.close(resultado);
    } catch (e: unknown) {
      const err = e as { error?: { detail?: string } };
      this.error.set(err.error?.detail ?? 'No se pudo guardar. Revisá los datos.');
    } finally {
      this.guardando.set(false);
    }
  }

  cerrar(): void {
    this.ref.close();
  }
}
