export interface HorarioUsuario {
  id?: number;
  Uid: number;
  diaSemana: number; // 1=Lunes, 2=Martes, ..., 6=Sábado
  jornadaMinutos: number; // Minutos de trabajo (sin almuerzo)
  almuerzoMinutos: number; // Minutos de almuerzo
  activo: boolean;
}

export interface HorarioUsuarioResponse {
  horarios: HorarioUsuario[];
  usuario?: {
    Uid: number;
    name: string;
    lastName: string;
  };
}
