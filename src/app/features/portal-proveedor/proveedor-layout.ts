import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-proveedor-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar class="bar">
      <span class="brand">
        <mat-icon>storefront</mat-icon> FashionStore
        <span class="tag">Portal de proveedores</span>
      </span>
      <span class="spacer"></span>
      <a mat-button routerLink="/proveedor/productos" routerLinkActive="act">
        Mis productos
      </a>
      <button mat-button [matMenuTriggerFor]="menu" class="user">
        <mat-icon>account_circle</mat-icon>
        <span class="hide-xs">{{ usuario()?.nombre }}</span>
        <mat-icon>arrow_drop_down</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <div class="menu-head">
          <strong>{{ usuario()?.nombre }} {{ usuario()?.apellido }}</strong>
          <small>{{ usuario()?.email }}</small>
        </div>
        <button mat-menu-item routerLink="/mi-cuenta">
          <mat-icon>person</mat-icon> Mi cuenta
        </button>
        <button mat-menu-item (click)="salir()">
          <mat-icon>logout</mat-icon> Cerrar sesión
        </button>
      </mat-menu>
    </mat-toolbar>

    <main class="content">
      <router-outlet />
    </main>
  `,
  styles: `
    :host { display:block; min-height:100dvh; background: var(--fs-green-50); }
    .bar { background: var(--fs-green-700); color:#fff; gap:.25rem; position:sticky; top:0; z-index:10; }
    .brand { display:inline-flex; align-items:center; gap:.4rem; font-weight:600; }
    .tag { font-size:.7rem; font-weight:500; padding:.1rem .45rem; border-radius:999px; background:rgba(255,255,255,.18); }
    .spacer { flex:1 1 auto; }
    .user { color:#fff; }
    .act { background: rgba(255,255,255,.16); border-radius:8px; }
    .menu-head { display:flex; flex-direction:column; gap:.1rem; padding:.75rem 1rem; border-bottom:1px solid #eef2f7; small{color:#64748b;} }
    .content { max-width: 1000px; margin: 0 auto; padding: 1.75rem 1.25rem 3rem; }
    @media (max-width:599px){ .hide-xs{ display:none; } }
  `,
})
export class ProveedorLayout {
  private readonly auth = inject(AuthService);
  protected readonly usuario = this.auth.user;

  salir(): void {
    this.auth.logout();
  }
}
