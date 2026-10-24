import { Page } from './usuario.model';

export interface Empresa {
  id: number;
  identificador: string;
  nombre: string;
  razon_social: string | null;
  activa: boolean;
  fecha_registro: string;
  fecha_actualizacion: string;
  plan_nombre: string | null;
  suscripcion_estado: string | null;
  fecha_vencimiento: string | null;
}

export type EmpresaPage = Page<Empresa>;

export interface LimitePlan {
  id?: number;
  codigo: string;
  valor_maximo: number;
}

export interface FuncionalidadPlan {
  id?: number;
  codigo: string;
  habilitada: boolean;
}

export interface Plan {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio_mensual: number;
  activo: boolean;
  fecha_creacion: string;
  limites: LimitePlan[];
  funcionalidades: FuncionalidadPlan[];
}

export interface Suscripcion {
  id: number;
  empresa_id: number;
  empresa_nombre: string;
  plan_id: number;
  plan_nombre: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  estado: 'ACTIVA' | 'SUSPENDIDA' | 'VENCIDA' | 'CANCELADA';
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ConsumoPlan {
  codigo: string;
  etiqueta: string;
  utilizado: number | null;
  limite: number;
  porcentaje: number | null;
  nivel: 'NORMAL' | 'ADVERTENCIA' | 'BLOQUEADO' | 'ERROR';
  error: string | null;
}

export interface PlanConsumo {
  empresa_id: number;
  empresa_nombre: string;
  plan: Plan;
  suscripcion: Suscripcion;
  dias_restantes: number;
  funcionalidades: FuncionalidadPlan[];
  consumos: ConsumoPlan[];
}

export interface CambioPlanDto {
  empresa_id?: number;
  plan_id: number;
  vigencia_meses: number;
  observacion?: string | null;
}

export interface IncompatibilidadPlan {
  codigo: string;
  etiqueta: string;
  utilizado: number | null;
  limite: number;
  mensaje: string;
}

export interface CambioPlanPreview {
  empresa_id: number;
  suscripcion_id: number;
  plan_actual: Plan;
  plan_nuevo: Plan;
  tipo_cambio: 'CAMBIO' | 'RENOVACION';
  fecha_inicio_nueva: string;
  fecha_vencimiento_nueva: string;
  compatible: boolean;
  incompatibilidades: IncompatibilidadPlan[];
}

export interface CambioPlanResultado {
  suscripcion: Suscripcion;
  tipo_cambio: 'CAMBIO' | 'RENOVACION';
  plan_anterior_id: number;
  plan_anterior_nombre: string;
  plan_nuevo_id: number;
  plan_nuevo_nombre: string;
  fecha_inicio_nueva: string;
  fecha_vencimiento_nueva: string;
  idempotente: boolean;
}

export interface HistorialCambioPlan {
  id: number;
  suscripcion_id: number;
  plan_anterior_id: number | null;
  plan_anterior_nombre: string | null;
  plan_nuevo_id: number;
  plan_nuevo_nombre: string;
  usuario_id: number;
  tipo_cambio: string;
  observacion: string | null;
  fecha_inicio_nueva: string | null;
  fecha_vencimiento_nueva: string | null;
  fecha_cambio: string;
}
