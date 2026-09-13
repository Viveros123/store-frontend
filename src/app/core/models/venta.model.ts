export interface ItemVenta {
  id: number;
  variante_id: number;
  producto_id: number | null;
  producto: string | null;
  talla: string | null;
  color: string | null;
  sku: string | null;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
}

export type EstadoVenta = 'PENDIENTE_PAGO' | 'PAGADA' | 'COMPLETADA' | 'ANULADA';

export interface Venta {
  id: number;
  sucursal_id: number;
  sucursal: string | null;
  ciudad: string | null;
  estado: EstadoVenta;
  total: string;
  fecha_creacion: string;
  items: ItemVenta[];
}

export type EstadoPago = 'PENDIENTE' | 'PROCESANDO' | 'APROBADO' | 'RECHAZADO';

export interface Pago {
  id: number;
  venta_id: number;
  metodo: string;
  estado: EstadoPago;
  monto: string;
  checkout_url: string | null;
  qr_data_url: string | null;
  fecha_creacion: string;
}

export interface EstadoPagoInfo {
  venta_id: number;
  venta_estado: EstadoVenta;
  pago_id: number | null;
  pago_estado: EstadoPago | null;
}
