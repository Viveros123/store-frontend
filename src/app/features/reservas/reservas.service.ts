import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Reserva,
  SlotsDisponibilidad,
} from '../../core/models/reserva.model';

export interface ReservaItemDto {
  variante_id: number;
  cantidad: number;
}

export interface ReservaCreateDto {
  sucursal_id: number;
  fecha: string; // "YYYY-MM-DD"
  hora_inicio: string; // "HH:MM"
  duracion_minutos: number;
  items: ReservaItemDto[];
}

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reservas`;

  disponibilidad(
    sucursalId: number,
    fecha: string,
    duracionMinutos: number,
  ): Observable<SlotsDisponibilidad> {
    const params = new HttpParams()
      .set('sucursal_id', sucursalId)
      .set('fecha', fecha)
      .set('duracion_minutos', duracionMinutos);
    return this.http.get<SlotsDisponibilidad>(`${this.base}/disponibilidad`, {
      params,
    });
  }

  crear(dto: ReservaCreateDto): Observable<Reserva> {
    return this.http.post<Reserva>(this.base, dto);
  }

  mias(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.base}/mias`);
  }
}
