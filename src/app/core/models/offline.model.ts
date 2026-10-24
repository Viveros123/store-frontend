export interface VarianteOffline {
  id: number;
  sku: string;
  talla_id: number;
  talla: string;
  color_id: number;
  color: string;
  codigo_hex: string | null;
  precio: number | null;
  imagen_url: string | null;
  cantidad_disponible: number;
  cantidad_reservada: number;
}

export interface ProductoOffline {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
  categoria: string;
  precio_base: number | null;
  imagen_url: string | null;
  variantes: VarianteOffline[];
}

export interface DatosOffline {
  schema_version: number;
  version_datos: string;
  empresa_id: number;
  sucursal_id: number;
  sucursal_nombre: string;
  generado_en: string;
  productos: ProductoOffline[];
  total_productos: number;
  total_variantes: number;
}

export interface CopiaOffline extends DatosOffline {
  key: string;
  guardado_en: string;
}

export interface VarianteOfflineVista extends VarianteOffline {
  producto_id: number;
  producto_nombre: string;
  categoria: string;
  descripcion: string | null;
  imagen: string | null;
}
