export interface Hora {
    unique_key?: number;
    Hid: number;
    Name: string;
    Entrada: string;
    Salida: string;
    Fecha: string;
    Extra?: string;
    Total?: string;
  }

  export interface Extra {
    Sid: number;
    Name: string;
    Acumulado: string;
  }

export interface Novedad {
  id: number;
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

export interface NovedadHistorico {
  id: number;
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