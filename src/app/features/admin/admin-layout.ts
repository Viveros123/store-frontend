import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  private readonly auth = inject(AuthService);
  private readonly bp = inject(BreakpointObserver);

  private readonly consultaMovil = [Breakpoints.XSmall, Breakpoints.Small];

  protected readonly usuario = this.auth.user;

  protected readonly esMovil = toSignal(
    this.bp.observe(this.consultaMovil).pipe(map((r) => r.matches)),
    { initialValue: this.bp.isMatched(this.consultaMovil) },
  );

  protected readonly abierto = signal(!this.bp.isMatched(this.consultaMovil));

  protected readonly nav: NavItem[] = [
    { label: 'Usuarios', icon: 'group', link: '/admin/usuarios' },
    { label: 'Sucursales', icon: 'store', link: '/admin/sucursales' },
    { label: 'Proveedores', icon: 'local_shipping', link: '/admin/proveedores' },
    { label: 'Datos del catálogo', icon: 'sell', link: '/admin/catalogo-base' },
  ];

  alternar(): void {
    this.abierto.set(!this.abierto());
  }

  cerrarSiMovil(): void {
    if (this.esMovil()) this.abierto.set(false);
  }

  salir(): void {
    this.auth.logout();
  }
}
