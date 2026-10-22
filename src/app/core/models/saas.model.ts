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
