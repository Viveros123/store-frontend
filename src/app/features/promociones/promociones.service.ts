import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Promocion, PromocionDto } from '../../core/models/promocion.model';

/** CU33 — Gestionar Promociones (Administrador). */
@Injectable({ providedIn: 'root' })
export class PromocionesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/promociones`;

  listar(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(this.base);
  }

  crear(dto: PromocionDto): Observable<Promocion> {
    return this.http.post<Promocion>(this.base, dto);
  }

  actualizar(id: number, dto: Partial<PromocionDto>): Observable<Promocion> {
    return this.http.patch<Promocion>(`${this.base}/${id}`, dto);
  }
}
