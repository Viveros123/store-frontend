import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PwaInstallService } from './pwa-install.service';

@Component({
  selector: 'app-pwa-install-banner',
  imports: [MatButtonModule, MatIconModule],
  template: `
    @if (pwa.disponible()) {
      <aside class="install-banner">
        <mat-icon>install_mobile</mat-icon>
        <span>Instalá FashionStore para acceder más rápido y consultar el catálogo offline.</span>
        <button mat-flat-button (click)="pwa.instalar()" [disabled]="pwa.instalando()">
          {{ pwa.instalando() ? 'Instalando…' : 'Instalar aplicación' }}
        </button>
      </aside>
    }
    @if (pwa.mensaje()) {
      <aside class="install-message" role="status">{{ pwa.mensaje() }}</aside>
    }
  `,
  styles: [`
    .install-banner,.install-message{position:fixed;z-index:1000;left:50%;bottom:1rem;transform:translateX(-50%);display:flex;align-items:center;gap:.75rem;max-width:min(720px,calc(100vw - 2rem));padding:.8rem 1rem;border-radius:12px;box-shadow:0 8px 28px #0003;background:#fff;color:#14532d}
    .install-banner button{background:#166534;color:#fff;white-space:nowrap}.install-message{background:#14532d;color:#fff}
    @media(max-width:600px){.install-banner{align-items:flex-start;flex-wrap:wrap}.install-banner span{flex:1}.install-banner button{width:100%}}
  `],
})
export class PwaInstallBanner {
  protected readonly pwa = inject(PwaInstallService);
}
