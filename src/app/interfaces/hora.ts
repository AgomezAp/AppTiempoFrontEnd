export interface Hora {
    unique_key?: number;
    ID: number;
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
  ID: number;
  Name: string;
  type: string;
  description: string;
  Fecha: string;
}