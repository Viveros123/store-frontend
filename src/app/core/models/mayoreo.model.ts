// CU53 — Ventas al por mayor.

export interface VarianteOpcionMayoreo {
  id: number;
  producto_id: number;
  producto: string;
  talla: string | null;
  color: string | null;
}

export interface DescuentoMayorista {
  id: number;
  variante_id: number;
  producto_id: number;
  producto: string;
  talla: string | null;
  color: string | null;
  cantidad_minima: number;
  porcentaje_descuento: string;
  activo: boolean;
}

export interface DescuentoMayoristaDto {
  variante_id: number;
  cantidad_minima: number;
  porcentaje_descuento: number;
}

export interface DescuentoMayoristaUpdateDto {
  cantidad_minima?: number;
  porcentaje_descuento?: number;
  activo?: boolean;
}
