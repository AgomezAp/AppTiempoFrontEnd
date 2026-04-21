export interface RegistroAsistencia {
  id?: number;
  fecha: string;
  tema: string;
  facilitadorId?: number | string | null;
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
  usuarioId: number | null;
  nombreCompleto: string;
  documentoIdentificacion?: string;
  cargo?: string;
  empresa: string;
  email: string;
  firma?: string | null;
  fechaFirma?: string | null;
  tokenFirma?: string;
  firmado: boolean;
  esExterno?: boolean;
  cancelado?: boolean;
  anulado?: boolean;
  fechaCancelacion?: string | null;
  motivoCancelacion?: string | null;
}

export interface ParticipanteExterno {
  nombreCompleto: string;
  documentoIdentificacion: string;
  cargo: string;
  empresa: string;
  email: string;
}

export interface CrearRegistroRequest {
  fecha: string;
  tema: string;
  facilitadorId?: number | string | null;
  facilitadorExternoNombre?: string;
  facilitadorExternoEmpresa?: string;
  participantesIds: number[];
  participantesExternos?: ParticipanteExterno[];
}

export interface InfoFirmaResponse {
  participante: {
    id: number;
    nombreCompleto: string;
    documentoIdentificacion: string;
    cargo: string;
    empresa: string;
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
