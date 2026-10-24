import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CambioPlanDto,
  CambioPlanPreview,
  CambioPlanResultado,
  Empresa,
  EmpresaPage,
  FuncionalidadPlan,
  HistorialCambioPlan,
  LimitePlan,
  Plan,
  PlanConsumo,
  Suscripcion,
} from '../../core/models/saas.model';

export interface RegistrarEmpresaDto {
  identificador: string;
  nombre: string;
  razon_social?: string | null;
  administrador: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    telefono?: string | null;
  };
  plan_id: number;
  fecha_inicio: string;
  vigencia_meses: number;
}

export interface ActualizarPlanDto {
  nombre?: string;
  descripcion?: string | null;
  precio_mensual?: number;
  activo?: boolean;
  limites?: Omit<LimitePlan, 'id'>[];
  funcionalidades?: Omit<FuncionalidadPlan, 'id'>[];
}

export interface GestionarSuscripcionDto {
  empresa_id: number;
  plan_id: number;
  fecha_inicio: string;
  vigencia_meses: number;
  estado: Suscripcion['estado'];
  observacion?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SaasService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  empresas(params: {
    q?: string;
    activa?: boolean | null;
    page?: number;
    size?: number;
  } = {}): Observable<EmpresaPage> {
    let query = new HttpParams()
      .set('page', params.page ?? 1)
      .set('size', params.size ?? 20);
    if (params.q) query = query.set('q', params.q);
    if (params.activa != null) query = query.set('activa', params.activa);
    return this.http.get<EmpresaPage>(`${this.base}/empresas`, { params: query });
  }

  registrarEmpresa(dto: RegistrarEmpresaDto): Observable<Empresa> {
    return this.http.post<Empresa>(`${this.base}/empresas`, dto);
  }

  actualizarEmpresa(
    id: number,
    dto: Partial<Pick<Empresa, 'nombre' | 'razon_social' | 'activa'>>,
  ): Observable<Empresa> {
    return this.http.patch<Empresa>(`${this.base}/empresas/${id}`, dto);
  }

  planes(soloActivos = false): Observable<Plan[]> {
    const params = new HttpParams().set('solo_activos', soloActivos);
    return this.http.get<Plan[]>(`${this.base}/planes`, { params });
  }

  actualizarPlan(id: number, dto: ActualizarPlanDto): Observable<Plan> {
    return this.http.put<Plan>(`${this.base}/planes/${id}`, dto);
  }

  suscripciones(q?: string): Observable<Suscripcion[]> {
    const params = q ? new HttpParams().set('q', q) : undefined;
    return this.http.get<Suscripcion[]>(`${this.base}/suscripciones`, { params });
  }

  gestionarSuscripcion(dto: GestionarSuscripcionDto): Observable<Suscripcion> {
    return this.http.post<Suscripcion>(`${this.base}/suscripciones`, dto);
  }

  miPlan(): Observable<PlanConsumo> {
    return this.http.get<PlanConsumo>(`${this.base}/suscripciones/mi-plan`);
  }

  validarCambio(dto: CambioPlanDto): Observable<CambioPlanPreview> {
    return this.http.post<CambioPlanPreview>(
      `${this.base}/suscripciones/validar-cambio`,
      dto,
    );
  }

  cambiarPlan(
    dto: CambioPlanDto,
    idempotencyKey: string,
  ): Observable<CambioPlanResultado> {
    return this.http.put<CambioPlanResultado>(
      `${this.base}/suscripciones/cambiar-plan`,
      dto,
      { headers: { 'Idempotency-Key': idempotencyKey } },
    );
  }

  historialCambios(empresaId?: number): Observable<HistorialCambioPlan[]> {
    const params = empresaId == null
      ? undefined
      : new HttpParams().set('empresa_id', empresaId);
    return this.http.get<HistorialCambioPlan[]>(
      `${this.base}/suscripciones/historial`,
      { params },
    );
  }
}
