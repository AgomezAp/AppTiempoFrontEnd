export interface Permiso {
    tipo: string;
    descripcion: string;
    fechaInicio?: string;
    fechaFin?: string;
    horas: number;
    Uid: number;
    emailPersonal: string;
    emailLider: string;
    nombre: string;
    numeroDocumento: string;
    horaSalida: string;
    horaRegreso: string;
    observaciones: string;
  }