export interface Hora {
    unique_key?: number;
    Hid: number;
    Name: string;
    Entrada: string;
    Salida: string;
    Fecha: string;
    Extra: string;
  }

  export interface Extra {
    unique_key?: number;
    ID: number;
    Name: string;
    Acumulado: string;
  }

export interface Novedad {
  unique_key?: number;
  Nid: number;
  Name: string;
  type: string;
  Fecha: string;
  HoraEntrada: string;
  HoraSalida: string;
  description: string;
  horas: string;
  aceptacion: boolean;
}