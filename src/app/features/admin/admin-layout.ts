import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavItem, PanelShell } from '../shared/panel-shell';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, PanelShell],
  template: `
    <app-panel-shell etiqueta="Administración" [nav]="nav">
      <router-outlet />
    </app-panel-shell>
  `,
})
export class AdminLayout {
  protected readonly nav: NavItem[] = [
    { label: 'Usuarios', icon: 'group', link: '/admin/usuarios' },
    { label: 'Sucursales', icon: 'store', link: '/admin/sucursales' },
    { label: 'Proveedores', icon: 'local_shipping', link: '/admin/proveedores' },
    { label: 'Productos', icon: 'checkroom', link: '/admin/productos' },
    { label: 'Datos del catálogo', icon: 'sell', link: '/admin/catalogo-base' },
    {
      label: 'Temporadas y colecciones',
      icon: 'calendar_month',
      link: '/admin/temporadas',
    },
  ];
}
