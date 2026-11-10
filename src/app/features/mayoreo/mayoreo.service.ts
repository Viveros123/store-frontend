import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  DescuentoMayorista,
  DescuentoMayoristaDto,
  DescuentoMayoristaUpdateDto,
  VarianteOpcionMayoreo,
} from '../../core/models/mayoreo.model';

/** CU53 — Ventas al por mayor (Administrador). */
@Injectable({ providedIn: 'root' })
export class MayoreoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/mayoreo`;

  variantesOpciones(): Observable<VarianteOpcionMayoreo[]> {
    return this.http.get<VarianteOpcionMayoreo[]>(`${this.base}/variantes/opciones`);
  }

  listar(): Observable<DescuentoMayorista[]> {
    return this.http.get<DescuentoMayorista[]>(this.base);
  }

  crear(dto: DescuentoMayoristaDto): Observable<DescuentoMayorista> {
    return this.http.post<DescuentoMayorista>(this.base, dto);
  }

  actualizar(id: number, dto: DescuentoMayoristaUpdateDto): Observable<DescuentoMayorista> {
    return this.http.patch<DescuentoMayorista>(`${this.base}/${id}`, dto);
  }
}
