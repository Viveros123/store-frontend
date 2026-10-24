import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaInstallBanner } from './core/pwa/pwa-install-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaInstallBanner],
  template: '<router-outlet /><app-pwa-install-banner />',
})
export class App {}
