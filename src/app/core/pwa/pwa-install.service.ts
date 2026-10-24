import { Injectable, inject, signal } from '@angular/core';

import { OfflineStorageService } from '../offline/offline-storage.service';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private readonly storage = inject(OfflineStorageService);
  private promptEvent: InstallPromptEvent | null = null;
  readonly compatible = signal('serviceWorker' in navigator && 'indexedDB' in globalThis);
  readonly instalada = signal(
    matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
  );
  readonly disponible = signal(false);
  readonly instalando = signal(false);
  readonly mensaje = signal('');

  constructor() {
    void this.storage.inicializar().catch((err) => {
      console.error('No se pudo preparar el almacenamiento local.', err);
    });
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.promptEvent = event as InstallPromptEvent;
      this.disponible.set(!this.instalada());
    });
    window.addEventListener('appinstalled', () => {
      this.promptEvent = null;
      this.disponible.set(false);
      this.instalada.set(true);
      this.mensaje.set('FashionStore quedó instalada correctamente.');
    });
  }

  async instalar(): Promise<void> {
    if (this.instalada()) {
      this.mensaje.set('FashionStore ya está instalada en este dispositivo.');
      return;
    }
    if (!this.promptEvent || this.instalando()) {
      this.mensaje.set('La instalación no está disponible en este navegador por el momento.');
      return;
    }
    this.instalando.set(true);
    this.mensaje.set('');
    try {
      await this.storage.inicializar();
      await this.promptEvent.prompt();
      const choice = await this.promptEvent.userChoice;
      if (choice.outcome === 'dismissed') {
        this.mensaje.set('Instalación cancelada. Puede continuar usando la versión web.');
      }
      this.promptEvent = null;
      this.disponible.set(false);
    } catch (err) {
      console.error('Falló la instalación PWA.', err);
      this.mensaje.set('No se pudo completar la instalación. La aplicación web sigue disponible.');
    } finally {
      this.instalando.set(false);
    }
  }
}
