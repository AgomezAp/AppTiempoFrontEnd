export interface ActaRecarga {
  id: number;
  periodoInicio: string;
  periodoFin: string;
  anio: number;
  totalRequeridoProyectado: number | null;
  totalIngresadoTarjetas: number | null;
  totalRecargadoGoogleAds: number | null;
  totalReportadoFormularios: number | null;
  firmaEmisor: string | null;
  firmaRevisor: string | null;
  firmaEmisorImagen: string | null;
  firmaRevisorImagen: string | null;
  fechaFirmaEmisor: string | null;
  fechaFirmaRevisor: string | null;
  estado: 'borrador' | 'pendiente_revision' | 'firmado' | 'completado';
  emisorId: number;
  revisorId: number;
  tokenFirma: string | null;
  tokenExpiracion: string | null;
  createdAt: string;
  updatedAt: string;
  emisor?: UsuarioActa;
  revisor?: UsuarioActa;
}

export interface UsuarioActa {
  Uid: number;
  name: string;
  lastName: string;
  email: string;
  cargo?: string;
}

export interface ActaRecargaAcceso {
  id: number;
  usuarioId: number;
  puedeVer: boolean;
  puedeEditar: boolean;
  createdAt: string;
  updatedAt: string;
  usuario?: UsuarioActa;
}

export interface ActaRecargaResponse {
  success: boolean;
  acta: ActaRecarga;
  msg?: string;
}

export interface ActasRecargaListResponse {
  success: boolean;
  actas: ActaRecarga[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AccesosListResponse {
  success: boolean;
  accesos: ActaRecargaAcceso[];
}

export interface MiAccesoResponse {
  success: boolean;
  tieneAcceso: boolean;
  puedeVer: boolean;
  puedeEditar: boolean;
  esAdmin: boolean;
}

export interface UsuariosDisponiblesResponse {
  success: boolean;
  usuarios: UsuarioActa[];
}

export interface CrearActaRequest {
  periodoInicio: string;
  periodoFin: string;
  anio: number;
  totalRequeridoProyectado?: number;
  totalIngresadoTarjetas?: number;
  totalRecargadoGoogleAds?: number;
  totalReportadoFormularios?: number;
  firmaEmisor?: string;
  firmaEmisorImagen?: string;
  revisorId: number;
}

export interface FirmarActaRequest {
  firmaRevisor?: string;
  firmaRevisorImagen?: string;
}
