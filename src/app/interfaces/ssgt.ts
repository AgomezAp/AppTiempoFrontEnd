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

// ========================================
// Interfaces EPP - Elementos de Protección Personal
// ========================================

export interface CatalogoEPP {
  id?: number;
  nombre: string;
  descripcion?: string | null;
  categoria?: string | null;
  stockActual: number;
  stockMinimo: number;
  fechaVencimiento?: string | null;
  proveedor?: string | null;
  imagen?: string | null;
  activo: boolean;
  alertas?: AlertaEPP[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EntregaEPP {
  id?: number;
  fecha: string;
  observaciones?: string | null;
  creadoPor: number;
  empresa?: string | null;
  estado?: 'pendiente' | 'firmado' | 'completado';
  detalles?: DetalleEntregaEPP[];
  firmas?: FirmaEntregaEPP[];
  creador?: {
    Uid: number;
    name: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface DetalleEntregaEPP {
  id?: number;
  entregaId: number;
  eppId: number;
  cantidad: number;
  talla?: string | null;
  epp?: CatalogoEPP;
}

export interface FirmaEntregaEPP {
  id?: number;
  entregaId: number;
  tipo: string;
  usuarioId?: number | null;
  nombreCompleto: string;
  email: string;
  firma?: string | null;
  fechaFirma?: string | null;
  tokenFirma?: string;
  firmado: boolean;
  esExterno: boolean;
  usuario?: {
    Uid: number;
    name: string;
    lastName: string;
  };
}

export interface AlertaEPP {
  id?: number;
  eppId: number;
  tipo: 'stock_bajo' | 'vencimiento_proximo';
  mensaje: string;
  leida: boolean;
  epp?: {
    id: number;
    nombre: string;
    categoria: string | null;
  };
  createdAt?: string;
}

export interface CrearEntregaEppRequest {
  fecha: string;
  empresa?: string;
  observaciones?: string;
  creadoPor: number;
  items: { eppId: number; cantidad: number; talla?: string }[];
  firmantes: {
    tipo: string;
    esExterno: boolean;
    usuarioId?: number;
    nombreCompleto: string;
    email: string;
  }[];
}

export interface InfoFirmaEppResponse {
  firma: {
    id: number;
    tipo: string;
    nombreCompleto: string;
    email: string;
    firmado: boolean;
  };
  entrega: EntregaEPP;
}

// ========================================
// DOCUMENTOS FIRMA
// ========================================

export interface DocumentoFirma {
  id?: number;
  titulo: string;
  descripcion?: string;
  archivoOriginal: string;
  archivoPdf: string;
  tipoArchivo: string;
  totalPaginas: number;
  estado: string;
  creadoPor: number;
  empresa?: string;
  campos?: CampoFirmaDocumento[];
  creador?: { Uid: number; name: string; lastName: string };
  createdAt?: Date;
}

export interface CampoFirmaDocumento {
  id?: number;
  documentoId: number;
  paginaNumero: number;
  posX: number;
  posY: number;
  ancho: number;
  alto: number;
  etiqueta: string;
  nombreFirmante: string;
  emailFirmante: string;
  usuarioId?: number;
  esExterno: boolean;
  tokenFirma?: string;
  firma?: string;
  firmado: boolean;
  fechaFirma?: Date;
}

export interface InfoFirmaDocumentoResponse {
  campo: CampoFirmaDocumento;
  documento: DocumentoFirma;
  paginaImagenUrl: string;
}

// ========================================
// INSPECCIONES Y RIESGOS
// ========================================

export interface InspeccionSSGT {
  id?: number;
  titulo: string;
  tipo: string;
  fechaInspeccion: string;
  lugar?: string;
  inspectorId: number;
  empresa?: string;
  estado: string;
  observacionesGenerales?: string;
  checklist?: ChecklistItemSSGT[];
  condiciones?: CondicionInsegura[];
  inspector?: { Uid: number; name: string; lastName: string };
  createdAt?: Date;
}

export interface ChecklistItemSSGT {
  id?: number;
  inspeccionId?: number;
  pregunta: string;
  cumple: boolean | null;
  observacion?: string;
  orden: number;
}

export interface CondicionInsegura {
  id?: number;
  inspeccionId?: number;
  descripcion: string;
  ubicacion: string;
  foto?: string;
  severidad: string;
  estado: string;
  reportadoPor: number;
  fechaReporte: string;
  reportante?: { Uid: number; name: string; lastName: string };
  inspeccion?: InspeccionSSGT;
  createdAt?: Date;
}

export interface MatrizRiesgo {
  id?: number;
  nombre: string;
  descripcion?: string;
  proceso: string;
  peligro: string;
  probabilidad: number;
  consecuencia: number;
  nivelRiesgo: string;
  controlesExistentes?: string;
  accionRecomendada?: string;
  responsableId: number;
  empresa?: string;
  archivoAdjunto?: string;
  responsable?: { Uid: number; name: string; lastName: string };
  createdAt?: Date;
}

export interface PlanAccion {
  id?: number;
  origen: string;
  origenId: number;
  descripcion: string;
  responsableId: number;
  fechaInicio?: string;
  fechaLimite: string;
  estado: string;
  observaciones?: string;
  evidenciaArchivo?: string;
  responsablePlan?: { Uid: number; name: string; lastName: string };
  createdAt?: Date;
}

// ========================================
// CAPACITACIONES SST
// ========================================

export interface CapacitacionSST {
  id?: number;
  titulo: string;
  descripcion?: string;
  tema: string;
  instructorId?: number;
  instructorExterno?: string;
  fechaProgramada: string;
  horaInicio?: string;
  horaFin?: string;
  lugar?: string;
  empresa?: string;
  estado: string;
  asistenciaId?: number;
  materialArchivo?: string;
  instructor?: { Uid: number; name: string; lastName: string };
  evaluacion?: EvaluacionCapacitacion;
  createdAt?: Date;
}

export interface EvaluacionCapacitacion {
  id?: number;
  capacitacionId: number;
  titulo: string;
  tiempoLimite?: number;
  preguntas?: PreguntaEvaluacion[];
  respuestas?: RespuestaEvaluacion[];
}

export interface PreguntaEvaluacion {
  id?: number;
  evaluacionId?: number;
  pregunta: string;
  tipo: string;
  opciones?: string;
  respuestaCorrecta: string;
  orden: number;
}

export interface RespuestaEvaluacion {
  id?: number;
  evaluacionId: number;
  usuarioId: number;
  respuestas: string;
  calificacion: number;
  fechaRespuesta: Date;
  usuario?: { Uid: number; name: string; lastName: string };
}
