export interface ColorMini {
  id: number;
  nombre: string;
  codigo_hex: string | null;
}

export interface CatalogoProducto {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  coleccion: string | null;
  temporada: string | null;
  precio_base: string;
  imagen_url: string | null;
  colores: ColorMini[];
  cantidad_variantes: number;
}

export interface CatalogoVariante {
  id: number;
  talla_id: number;
  talla: string | null;
  color_id: number;
  color: string | null;
  color_hex: string | null;
  precio_efectivo: string;
}

export interface CatalogoProductoDetalle extends CatalogoProducto {
  variantes: CatalogoVariante[];
}

export type OrdenCatalogo = 'novedad' | 'precio_asc' | 'precio_desc' | 'nombre';
