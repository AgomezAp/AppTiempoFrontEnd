export interface RegistroAsistencia {
  id?: number;
  fecha: string;
  tema: string;
  facilitadorId: number;
  facilitadorNombre?: string;
  codigo?: string;
  version?: string;
  estado?: 'pendiente' | 'en_proceso' | 'completado';
  participantes?: ParticipanteAsistencia[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ParticipanteAsistencia {
  id?: number;
  registroId?: number;
  usuarioId: number;
  nombreCompleto: string;
  documentoIdentificacion?: string;
  cargo?: string;
  empresa: 'AP' | 'AT' | 'ME';
  email: string;
  firma?: string | null;
  fechaFirma?: string | null;
  tokenFirma?: string;
  firmado: boolean;
}

export interface CrearRegistroRequest {
  fecha: string;
  tema: string;
  facilitadorId: number;
  participantesIds: number[];
}

export interface InfoFirmaResponse {
  participante: {
    id: number;
    nombreCompleto: string;
    documentoIdentificacion: string;
    cargo: string;
    empresa: 'AP' | 'AT' | 'ME';
  };
  registro: {
    fecha: string;
    tema: string;
    facilitadorNombre: string;
    codigo: string;
    version: string;
  };
}

export interface FirmarRequest {
  firma: string; // Base64 de la imagen de firma
}
