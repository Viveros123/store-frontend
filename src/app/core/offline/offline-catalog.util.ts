import { CopiaOffline, VarianteOfflineVista } from '../models/offline.model';

export function filtrarCatalogoOffline(
  copia: CopiaOffline | null,
  q: string,
  talla: string,
  color: string,
): VarianteOfflineVista[] {
  if (!copia) return [];
  const termino = q.trim().toLocaleLowerCase('es');
  return copia.productos.flatMap((producto) =>
    producto.variantes
      .filter((variante) =>
        (!termino || `${producto.nombre} ${producto.categoria} ${variante.sku}`.toLocaleLowerCase('es').includes(termino)) &&
        (!talla || variante.talla === talla) &&
        (!color || variante.color === color),
      )
      .map((variante) => ({
        ...variante,
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        categoria: producto.categoria,
        descripcion: producto.descripcion,
        imagen: variante.imagen_url ?? producto.imagen_url,
      })),
  );
}
