export interface AccidenteIncidente {
  id?: number;
  fecha: string;
  hora: string;
  lugar: string;
  descripcion: string;
  tipoEvento: 'accidente' | 'incidente';
  severidad: 'leve' | 'grave' | 'mortal';
  tipoLesion?: string | null;
  parteAfectada?: string | null;
  testigos?: string | null;
  diasIncapacidad?: number | null;
  reportadoPor: number;
  estado?: 'reportado' | 'en_investigacion' | 'cerrado';
  empresa?: string;
  reportante?: {
    Uid: number;
    name: string;
    lastName: string;
  };
  investigacion?: InvestigacionAccidente;
  evidencias?: EvidenciaAccidente[];
  seguimientos?: SeguimientoAccion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestigacionAccidente {
  id?: number;
  accidenteId: number;
  causasInmediatas?: string;
  causasBasicas?: string;
  accionesCorrectivas?: string;
  responsableInvestigacion: number;
  fechaInvestigacion: string;
  conclusiones?: string;
  responsable?: {
    Uid: number;
    name: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface EvidenciaAccidente {
  id?: number;
  accidenteId: number;
  tipo: 'foto' | 'documento_medico' | 'formato_reporte' | 'otro';
  nombreArchivo: string;
  rutaArchivo: string;
  descripcion?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeguimientoAccion {
  id?: number;
  accidenteId: number;
  descripcion: string;
  responsableId: number;
  fechaLimite: string;
  estado: 'pendiente' | 'en_progreso' | 'completado';
  observaciones?: string | null;
  responsable?: {
    Uid: number;
    name: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearAccidenteRequest {
  fecha: string;
  hora: string;
  lugar: string;
  descripcion: string;
  tipoEvento: 'accidente' | 'incidente';
  severidad: 'leve' | 'grave' | 'mortal';
  tipoLesion?: string;
  parteAfectada?: string;
  testigos?: string;
  diasIncapacidad?: number;
  reportadoPor: number;
  empresa?: string;
}

export interface CrearInvestigacionRequest {
  causasInmediatas?: string;
  causasBasicas?: string;
  accionesCorrectivas?: string;
  responsableInvestigacion: number;
  fechaInvestigacion: string;
  conclusiones?: string;
}

export interface CrearSeguimientoRequest {
  descripcion: string;
  responsableId: number;
  fechaLimite: string;
  observaciones?: string;
}

export interface DashboardSSGT {
  anio: number;
  totalAccidentes: number;
  totalIncidentes: number;
  totalDiasIncapacidad: number;
  porSeveridad: { severidad: string; total: number }[];
  porEstado: { estado: string; total: number }[];
  porMes: { mes: number; tipoEvento: string; total: number }[];
  seguimientosPendientes: number;
}

export interface FiltrosAccidente {
  estado?: string;
  severidad?: string;
  tipoEvento?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  empresa?: string;
}
