import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { CambioPlanDto, PlanConsumo } from '../../core/models/saas.model';
import { RegistrarEmpresaDto, SaasService } from './saas.service';

describe('SaasService', () => {
  let service: SaasService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SaasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('registra empresa, administrador y suscripción con CU38', () => {
    const dto: RegistrarEmpresaDto = {
      identificador: 'moda-sur',
      nombre: 'Moda Sur',
      administrador: {
        nombre: 'Ana',
        apellido: 'Admin',
        email: 'ana@example.com',
        password: 'Segura123!',
      },
      plan_id: 1,
      fecha_inicio: '2026-10-21',
      vigencia_meses: 1,
    };

    service.registrarEmpresa(dto).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/empresas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({});
  });

  it('consulta el plan de la empresa autenticada sin enviar empresa_id', () => {
    service.miPlan().subscribe((res) => expect(res.empresa_id).toBe(7));
    const req = http.expectOne(`${environment.apiUrl}/suscripciones/mi-plan`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toEqual([]);
    req.flush({ empresa_id: 7 } as PlanConsumo);
  });

  it('envía una clave de idempotencia al cambiar o renovar el plan', () => {
    const dto: CambioPlanDto = { plan_id: 2, vigencia_meses: 3 };
    service.cambiarPlan(dto, 'cambio-unico-123').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/suscripciones/cambiar-plan`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Idempotency-Key')).toBe('cambio-unico-123');
    expect(req.request.body).toEqual(dto);
    req.flush({});
  });
});
