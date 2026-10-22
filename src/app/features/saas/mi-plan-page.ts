import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PlanConsumo } from '../../core/models/saas.model';
import { SaasService } from './saas.service';

@Component({
  selector: 'app-mi-plan-page',
  imports: [CurrencyPipe, DatePipe, MatIconModule, MatProgressBarModule],
  template: `
    @if (cargando()) { <mat-progress-bar mode="indeterminate" /> }
    @if (resumen(); as r) {
      <section class="hero-plan">
        <div><small>{{ r.empresa_nombre }}</small><h1>Plan {{ r.plan.nombre }}</h1><p>{{ r.suscripcion.fecha_inicio | date:'dd/MM/yyyy' }} — {{ r.suscripcion.fecha_vencimiento | date:'dd/MM/yyyy' }} · {{ r.dias_restantes }} días restantes</p></div>
        <div><span class="chip" [class.chip-off]="r.suscripcion.estado !== 'ACTIVA'">{{ r.suscripcion.estado }}</span><p class="price">{{ r.plan.precio_mensual | currency:'BOB':'symbol-narrow':'1.2-2' }} / mes</p></div>
      </section>
      <h2>Consumo del plan</h2>
      <section class="consumos">@for (c of r.consumos; track c.codigo) {
        <article class="consumo"><div class="consumo-head"><strong>{{ c.etiqueta }}</strong><span [class.warning]="c.nivel === 'ADVERTENCIA'" [class.blocked]="c.nivel === 'BLOQUEADO'">{{ c.utilizado ?? '—' }} de {{ c.limite }}</span></div>
          <mat-progress-bar mode="determinate" [value]="valorBarra(c.porcentaje)" />
          @if (c.nivel === 'ADVERTENCIA') { <small class="warning">El consumo alcanzó al menos el 80 %.</small> }
          @if (c.nivel === 'BLOQUEADO') { <small class="blocked">Límite alcanzado; no se pueden registrar más recursos de este tipo.</small> }
          @if (c.error) { <small class="blocked">{{ c.error }}</small> }
        </article>
      }</section>
      <h2>Funcionalidades</h2>
      <section class="feature-grid">@for (f of r.funcionalidades; track f.codigo) { <div class="feature" [class.off]="!f.habilitada"><mat-icon>{{ f.habilitada ? 'check_circle' : 'remove_circle_outline' }}</mat-icon><span>{{ etiqueta(f.codigo) }}</span></div> }</section>
    } @else if (!cargando()) { <p class="vacio">{{ error() }}</p> }
  `,
  styleUrl: './saas-pages.scss',
})
export class MiPlanPage implements OnInit {
  private readonly service = inject(SaasService);
  private readonly snack = inject(MatSnackBar);
  protected readonly resumen = signal<PlanConsumo | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal('No hay información de suscripción disponible.');
  private readonly etiquetas: Record<string, string> = { PWA_OFFLINE: 'PWA y operación offline', REPORTES_CONVENCIONALES: 'Reportes convencionales', REPORTES_IA: 'Reportes asistidos por IA', REPORTES_MULTISUCURSAL: 'Reportes comparativos entre sucursales' };
  ngOnInit(): void { this.cargando.set(true); this.service.miPlan().subscribe({ next: (r) => { this.resumen.set(r); this.cargando.set(false); }, error: (err) => { this.cargando.set(false); this.error.set(err?.error?.detail ?? 'No se pudo consultar el plan.'); this.snack.open(this.error(), 'Cerrar', { duration: 4000 }); } }); }
  protected valorBarra(valor: number | null): number { return Math.max(0, Math.min(valor ?? 0, 100)); }
  protected etiqueta(codigo: string): string { return this.etiquetas[codigo] ?? codigo; }
}
