import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EstadoPagoInfo, Pago, Venta } from '../../core/models/venta.model';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/ventas`;

  checkout(sucursalId: number): Observable<Venta> {
    return this.http.post<Venta>(`${this.base}/checkout`, {
      sucursal_id: sucursalId,
    });
  }

  misCompras(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.base}/mias`);
  }

  cancelar(ventaId: number): Observable<Venta> {
    return this.http.post<Venta>(`${this.base}/${ventaId}/cancelar`, {});
  }

  iniciarPago(ventaId: number): Observable<Pago> {
    return this.http.post<Pago>(`${this.base}/${ventaId}/pagos`, {});
  }

  estadoPago(ventaId: number): Observable<EstadoPagoInfo> {
    return this.http.get<EstadoPagoInfo>(`${this.base}/${ventaId}/pagos/estado`);
  }
}
