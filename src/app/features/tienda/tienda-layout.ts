import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../core/auth/auth.service';
import { ROL } from '../../core/models/usuario.model';

@Component({
  selector: 'app-tienda-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './tienda-layout.html',
  styleUrl: './tienda-layout.scss',
})
export class TiendaLayout {
  private readonly auth = inject(AuthService);

  protected readonly usuario = this.auth.user;
  protected readonly esAdmin = () => this.auth.hasRole(ROL.ADMIN);
  protected readonly esProveedor = () => this.auth.hasRole(ROL.PROVEEDOR);
  protected readonly esEncargado = () => this.auth.hasRole(ROL.ENCARGADO);
  protected readonly esCliente = () => this.auth.hasRole(ROL.CLIENTE);

  salir(): void {
    this.auth.logout();
  }
}
