export interface Sucursal {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string | null;
  horario_atencion: string | null;
  activa: boolean;
}

export interface SucursalOpcion {
  id: number;
  nombre: string;
  ciudad: string;
}
