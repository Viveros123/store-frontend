import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Plan } from '../../core/models/saas.model';
import { PlanFormDialog } from './plan-form-dialog';
import { SaasService } from './saas.service';

@Component({
  selector: 'app-planes-page',
  imports: [CurrencyPipe, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <header class="page-head"><div><h1>Planes y límites</h1><p>Configuración central de precios, capacidades y funcionalidades.</p></div></header>
    @if (cargando()) { <mat-progress-bar mode="indeterminate" /> }
    <section class="cards">
      @for (plan of planes(); track plan.id) {
        <mat-card class="card"><mat-card-header><mat-card-title class="card-head"><span>{{ plan.nombre }}</span><span class="chip" [class.chip-off]="!plan.activo">{{ plan.activo ? 'Activo' : 'Inactivo' }}</span></mat-card-title><mat-card-subtitle>{{ plan.codigo }}</mat-card-subtitle></mat-card-header>
          <mat-card-content><p>{{ plan.descripcion }}</p><p class="price">{{ plan.precio_mensual | currency:'BOB':'symbol-narrow':'1.2-2' }} / mes</p><h3>Límites</h3><ul class="config-list">@for (l of plan.limites; track l.codigo) { <li><span>{{ etiqueta(l.codigo) }}</span><strong>{{ l.valor_maximo }}</strong></li> }</ul><h3>Funcionalidades</h3><ul class="config-list">@for (f of plan.funcionalidades; track f.codigo) { <li><span>{{ etiqueta(f.codigo) }}</span><mat-icon>{{ f.habilitada ? 'check_circle' : 'cancel' }}</mat-icon></li> }</ul></mat-card-content>
          <mat-card-actions align="end"><button mat-button (click)="editar(plan)"><mat-icon>edit</mat-icon> Configurar</button></mat-card-actions>
        </mat-card>
      }
    </section>
  `,
  styleUrl: './saas-pages.scss',
})
export class PlanesPage implements OnInit {
  private readonly service = inject(SaasService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  protected readonly planes = signal<Plan[]>([]);
  protected readonly cargando = signal(false);
  private readonly etiquetas: Record<string, string> = {
    MAX_SUCURSALES: 'Sucursales activas', MAX_USUARIOS: 'Usuarios activos', MAX_REPORTES_IA_MES: 'Reportes con IA / mes',
    PWA_OFFLINE: 'Operación PWA offline', REPORTES_CONVENCIONALES: 'Reportes convencionales', REPORTES_IA: 'Reportes con IA', REPORTES_MULTISUCURSAL: 'Reportes multisucursal',
  };
  ngOnInit(): void { this.cargar(); }
  protected etiqueta(codigo: string): string { return this.etiquetas[codigo] ?? codigo; }
  private cargar(): void { this.cargando.set(true); this.service.planes().subscribe({ next: (p) => { this.planes.set(p); this.cargando.set(false); }, error: () => { this.cargando.set(false); this.snack.open('No se pudieron cargar los planes.', 'Cerrar', { duration: 4000 }); } }); }
  editar(plan: Plan): void { this.dialog.open(PlanFormDialog, { data: plan }).afterClosed().subscribe((p) => { if (p) { this.snack.open('Plan actualizado.', 'OK', { duration: 2500 }); this.cargar(); } }); }
}
