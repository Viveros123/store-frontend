import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { CopiaOffline, DatosOffline } from '../models/offline.model';
import { OfflineStorageService } from './offline-storage.service';

@Injectable({ providedIn: 'root' })
export class OfflineDataService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(OfflineStorageService);
  private enCurso: Promise<CopiaOffline> | null = null;

  preparar(sucursalId: number): Promise<CopiaOffline> {
    if (this.enCurso) return this.enCurso;
    this.enCurso = this.descargarYGuardar(sucursalId).finally(() => {
      this.enCurso = null;
    });
    return this.enCurso;
  }

  obtener(empresaId: number, sucursalId: number): Promise<CopiaOffline | null> {
    return this.storage.obtener(empresaId, sucursalId);
  }

  listarEmpresa(empresaId: number): Promise<CopiaOffline[]> {
    return this.storage.listarEmpresa(empresaId);
  }

  async servidorDisponible(): Promise<boolean> {
    if (!navigator.onLine) return false;
    try {
      await firstValueFrom(
        this.http
          .get<{ status: string }>(`${environment.apiUrl}/health`)
          .pipe(timeout(3000)),
      );
      return true;
    } catch {
      return false;
    }
  }

  private async descargarYGuardar(sucursalId: number): Promise<CopiaOffline> {
    if (!navigator.onLine) throw new Error('No hay conexión. Se conserva la última copia válida.');
    const params = new HttpParams().set('sucursal_id', sucursalId);
    const datos = await firstValueFrom(
      this.http.get<DatosOffline>(`${environment.apiUrl}/offline/preparar-datos`, { params }),
    );
    return this.storage.guardar(datos);
  }
}
