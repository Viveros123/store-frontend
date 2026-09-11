export interface InventarioItem {
  id: number;
  variante_id: number;
  producto_id: number | null;
  producto: string | null;
  talla: string | null;
  color: string | null;
  color_hex: string | null;
  sku: string | null;
  sucursal_id: number;
  sucursal: string | null;
  ciudad: string | null;
  cantidad_disponible: number;
  cantidad_reservada: number;
  estado: 'DISPONIBLE' | 'AGOTADO';
}

export interface DisponibilidadSucursal {
  sucursal_id: number;
  sucursal: string;
  ciudad: string;
  cantidad_disponible: number;
}
