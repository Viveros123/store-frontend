import { CopiaOffline } from '../models/offline.model';
import { filtrarCatalogoOffline } from './offline-catalog.util';

describe('filtrarCatalogoOffline', () => {
  const copia = {
    productos: [{
      id: 1, nombre: 'Polera básica', descripcion: null, categoria_id: 1,
      categoria: 'Poleras', precio_base: 80, imagen_url: null,
      variantes: [
        { id: 10, sku: 'POL-M-NEG', talla_id: 1, talla: 'M', color_id: 1, color: 'Negro', codigo_hex: '#000000', precio: 85, imagen_url: null, cantidad_disponible: 3, cantidad_reservada: 0 },
      ],
    }],
  } as CopiaOffline;

  it('busca y filtra usando únicamente la copia local', () => {
    expect(filtrarCatalogoOffline(copia, 'polera', 'M', 'Negro').length).toBe(1);
    expect(filtrarCatalogoOffline(copia, '', 'L', '').length).toBe(0);
  });
});
