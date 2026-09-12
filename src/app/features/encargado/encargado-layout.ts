import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavItem, PanelShell } from '../shared/panel-shell';

@Component({
  selector: 'app-encargado-layout',
  imports: [RouterOutlet, PanelShell],
  template: `
    <app-panel-shell etiqueta="Panel de sucursal" [nav]="nav">
      <router-outlet />
    </app-panel-shell>
  `,
})
export class EncargadoLayout {
  protected readonly nav: NavItem[] = [
    { label: 'Reservas', icon: 'event_available', link: '/encargado/reservas' },
  ];
}
