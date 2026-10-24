import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';

import { Empresa, Plan, Suscripcion } from '../../core/models/saas.model';
import { SaasService } from './saas.service';
import { SuscripcionFormDialog } from './suscripcion-form-dialog';
import { CambioPlanDialog } from './cambio-plan-dialog';

@Component({
  selector: 'app-suscripciones-page',
  imports: [DatePipe, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule],
  template: `
    <header class="page-head"><div><h1>Suscripciones</h1><p>Asignación administrativa, vigencia y estado por empresa.</p></div></header>
    <div class="tabla-wrap mat-elevation-z1">@if (cargando()) { <mat-progress-bar mode="indeterminate" /> }<div class="tabla-scroll"><table mat-table [dataSource]="empresas()">
      <ng-container matColumnDef="empresa"><th mat-header-cell *matHeaderCellDef>Empresa</th><td mat-cell *matCellDef="let e"><strong>{{ e.nombre }}</strong><br><small class="muted">{{ e.identificador }}</small></td></ng-container>
      <ng-container matColumnDef="plan"><th mat-header-cell *matHeaderCellDef>Plan</th><td mat-cell *matCellDef="let e">{{ actual(e.id)?.plan_nombre || 'Sin plan' }}</td></ng-container>
      <ng-container matColumnDef="vigencia"><th mat-header-cell *matHeaderCellDef>Vencimiento</th><td mat-cell *matCellDef="let e">{{ actual(e.id)?.fecha_vencimiento ? (actual(e.id)?.fecha_vencimiento | date:'dd/MM/yyyy') : '—' }}</td></ng-container>
      <ng-container matColumnDef="estado"><th mat-header-cell *matHeaderCellDef>Estado</th><td mat-cell *matCellDef="let e"><span class="chip" [class.chip-off]="actual(e.id)?.estado !== 'ACTIVA'">{{ actual(e.id)?.estado || 'SIN SUSCRIPCIÓN' }}</span></td></ng-container>
      <ng-container matColumnDef="acciones"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let e" class="col-acciones"><button mat-button (click)="gestionar(e)"><mat-icon>edit_calendar</mat-icon> Gestionar</button><button mat-button [disabled]="!actual(e.id)" (click)="cambiarPlan(e)"><mat-icon>published_with_changes</mat-icon> Cambiar/renovar</button></td></ng-container>
      <tr mat-header-row *matHeaderRowDef="columnas"></tr><tr mat-row *matRowDef="let row; columns: columnas"></tr>
    </table></div></div>
  `,
  styleUrl: './saas-pages.scss',
})
export class SuscripcionesPage implements OnInit {
  private readonly service = inject(SaasService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  protected readonly columnas = ['empresa', 'plan', 'vigencia', 'estado', 'acciones'];
  protected readonly empresas = signal<Empresa[]>([]);
  protected readonly planes = signal<Plan[]>([]);
  protected readonly suscripciones = signal<Suscripcion[]>([]);
  protected readonly cargando = signal(false);
  ngOnInit(): void { this.cargar(); }
  protected actual(empresaId: number): Suscripcion | null { return this.suscripciones().find((s) => s.empresa_id === empresaId) ?? null; }
  private cargar(): void {
    this.cargando.set(true);
    forkJoin({
      empresas: this.service.empresas({ size: 100 }),
      planes: this.service.planes(true),
      suscripciones: this.service.suscripciones(),
    }).subscribe({
      next: ({ empresas, planes, suscripciones }) => {
        this.empresas.set(empresas.items);
        this.planes.set(planes);
        this.suscripciones.set(suscripciones);
        this.cargando.set(false);
      },
      error: () => this.fallo(),
    });
  }
  private fallo(): void { this.cargando.set(false); this.snack.open('No se pudo cargar la gestión de suscripciones.', 'Cerrar', { duration: 4000 }); }
  gestionar(empresa: Empresa): void { this.dialog.open(SuscripcionFormDialog, { data: { empresa, planes: this.planes(), actual: this.actual(empresa.id) } }).afterClosed().subscribe((r) => { if (r) { this.snack.open('Suscripción actualizada.', 'OK', { duration: 2500 }); this.cargar(); } }); }
  cambiarPlan(empresa: Empresa): void { const actual = this.actual(empresa.id); if (!actual) return; this.dialog.open(CambioPlanDialog, { data: { empresaId: empresa.id, empresaNombre: empresa.nombre, planActualId: actual.plan_id } }).afterClosed().subscribe((r) => { if (r) { this.snack.open('Cambio de plan aplicado.', 'OK', { duration: 2500 }); this.cargar(); } }); }
}
