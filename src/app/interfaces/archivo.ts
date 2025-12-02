export interface Archivo {
  Aid: number;
  nombre: string;
  descripcion?: string;
  url: string;
  tipo: string;
  categoria: string;
  fechaSubida: Date;
  estado: number;
}

export interface ArchivoResponse {
  message: string;
  archivo?: Archivo;
  archivos?: Archivo[];
}
