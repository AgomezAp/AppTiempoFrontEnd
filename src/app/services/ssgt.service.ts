import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import {
  AccidenteIncidente,
  CrearAccidenteRequest,
  CrearInvestigacionRequest,
  CrearSeguimientoRequest,
  DashboardSSGT,
  EvidenciaAccidente,
  FiltrosAccidente,
  InvestigacionAccidente,
  SeguimientoAccion,
  CatalogoEPP,
  EntregaEPP,
  CrearEntregaEppRequest,
  AlertaEPP,
  InfoFirmaEppResponse,
} from '../interfaces/ssgt';

@Injectable({
  providedIn: 'root',
})
export class SsgtService {
  private appUrl: string;
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.appUrl = environment.apiUrl;
    this.apiUrl = '/api/ssgt';
  }

  // Accidentes CRUD
  crearAccidente(data: CrearAccidenteRequest): Observable<{ msg: string; accidente: AccidenteIncidente }> {
    return this.http.post<{ msg: string; accidente: AccidenteIncidente }>(
      `${this.appUrl}${this.apiUrl}/accidentes`,
      data
    );
  }

  obtenerAccidentes(filtros?: FiltrosAccidente): Observable<AccidenteIncidente[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.severidad) params = params.set('severidad', filtros.severidad);
      if (filtros.tipoEvento) params = params.set('tipoEvento', filtros.tipoEvento);
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
      if (filtros.empresa) params = params.set('empresa', filtros.empresa);
    }
    return this.http.get<AccidenteIncidente[]>(
      `${this.appUrl}${this.apiUrl}/accidentes`,
      { params }
    );
  }

  obtenerAccidentePorId(id: number): Observable<AccidenteIncidente> {
    return this.http.get<AccidenteIncidente>(
      `${this.appUrl}${this.apiUrl}/accidentes/${id}`
    );
  }

  actualizarAccidente(id: number, data: Partial<AccidenteIncidente>): Observable<{ msg: string; accidente: AccidenteIncidente }> {
    return this.http.put<{ msg: string; accidente: AccidenteIncidente }>(
      `${this.appUrl}${this.apiUrl}/accidentes/${id}`,
      data
    );
  }

  eliminarAccidente(id: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(
      `${this.appUrl}${this.apiUrl}/accidentes/${id}`
    );
  }

  // Investigacion
  crearInvestigacion(accidenteId: number, data: CrearInvestigacionRequest): Observable<{ msg: string; investigacion: InvestigacionAccidente }> {
    return this.http.post<{ msg: string; investigacion: InvestigacionAccidente }>(
      `${this.appUrl}${this.apiUrl}/accidentes/${accidenteId}/investigacion`,
      data
    );
  }

  // Evidencias
  subirEvidencia(accidenteId: number, archivo: File, tipo: string, descripcion?: string): Observable<{ msg: string; evidencia: EvidenciaAccidente }> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('tipo', tipo);
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }
    return this.http.post<{ msg: string; evidencia: EvidenciaAccidente }>(
      `${this.appUrl}${this.apiUrl}/accidentes/${accidenteId}/evidencias`,
      formData
    );
  }

  eliminarEvidencia(id: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(
      `${this.appUrl}${this.apiUrl}/evidencias/${id}`
    );
  }

  // Seguimiento
  crearSeguimiento(accidenteId: number, data: CrearSeguimientoRequest): Observable<{ msg: string; seguimiento: SeguimientoAccion }> {
    return this.http.post<{ msg: string; seguimiento: SeguimientoAccion }>(
      `${this.appUrl}${this.apiUrl}/accidentes/${accidenteId}/seguimiento`,
      data
    );
  }

  actualizarSeguimiento(id: number, data: Partial<SeguimientoAccion>): Observable<{ msg: string; seguimiento: SeguimientoAccion }> {
    return this.http.put<{ msg: string; seguimiento: SeguimientoAccion }>(
      `${this.appUrl}${this.apiUrl}/seguimiento/${id}`,
      data
    );
  }

  // Dashboard
  obtenerDashboard(year?: number): Observable<DashboardSSGT> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<DashboardSSGT>(
      `${this.appUrl}${this.apiUrl}/dashboard`,
      { params }
    );
  }

  // ========================================
  // EPP - Elementos de Protección Personal
  // ========================================

  // Catálogo EPP
  crearEPP(data: Partial<CatalogoEPP>): Observable<{ msg: string; epp: CatalogoEPP }> {
    return this.http.post<{ msg: string; epp: CatalogoEPP }>(
      `${this.appUrl}${this.apiUrl}/epp/catalogo`,
      data
    );
  }

  obtenerEPPs(activo?: boolean, categoria?: string): Observable<CatalogoEPP[]> {
    let params = new HttpParams();
    if (activo !== undefined) params = params.set('activo', String(activo));
    if (categoria) params = params.set('categoria', categoria);
    return this.http.get<CatalogoEPP[]>(
      `${this.appUrl}${this.apiUrl}/epp/catalogo`,
      { params }
    );
  }

  actualizarEPP(id: number, data: Partial<CatalogoEPP>): Observable<{ msg: string; epp: CatalogoEPP }> {
    return this.http.put<{ msg: string; epp: CatalogoEPP }>(
      `${this.appUrl}${this.apiUrl}/epp/catalogo/${id}`,
      data
    );
  }

  eliminarEPP(id: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(
      `${this.appUrl}${this.apiUrl}/epp/catalogo/${id}`
    );
  }

  // Entregas EPP
  crearEntregaEpp(data: CrearEntregaEppRequest): Observable<{ msg: string; entrega: EntregaEPP }> {
    return this.http.post<{ msg: string; entrega: EntregaEPP }>(
      `${this.appUrl}${this.apiUrl}/epp/entregas`,
      data
    );
  }

  obtenerEntregasEpp(empresa?: string, estado?: string): Observable<EntregaEPP[]> {
    let params = new HttpParams();
    if (empresa) params = params.set('empresa', empresa);
    if (estado) params = params.set('estado', estado);
    return this.http.get<EntregaEPP[]>(
      `${this.appUrl}${this.apiUrl}/epp/entregas`,
      { params }
    );
  }

  obtenerEntregaEppPorId(id: number): Observable<EntregaEPP> {
    return this.http.get<EntregaEPP>(
      `${this.appUrl}${this.apiUrl}/epp/entregas/${id}`
    );
  }

  eliminarEntregaEpp(id: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(
      `${this.appUrl}${this.apiUrl}/epp/entregas/${id}`
    );
  }

  descargarPdfEntregaEpp(id: number): Observable<Blob> {
    return this.http.get(
      `${this.appUrl}${this.apiUrl}/epp/entregas/${id}/pdf`,
      { responseType: 'blob' }
    );
  }

  reenviarCorreoFirmaEpp(entregaId: number, firmaId: number): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(
      `${this.appUrl}${this.apiUrl}/epp/entregas/${entregaId}/firmas/${firmaId}/reenviar`,
      {}
    );
  }

  // Firma pública EPP
  obtenerInfoFirmaEpp(token: string): Observable<InfoFirmaEppResponse> {
    return this.http.get<InfoFirmaEppResponse>(
      `${this.appUrl}${this.apiUrl}/epp/firmar/${token}`
    );
  }

  firmarEntregaEpp(token: string, data: { firma: string }): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(
      `${this.appUrl}${this.apiUrl}/epp/firmar/${token}`,
      data
    );
  }

  // Alertas EPP
  obtenerAlertasEpp(leida?: boolean): Observable<AlertaEPP[]> {
    let params = new HttpParams();
    if (leida !== undefined) params = params.set('leida', String(leida));
    return this.http.get<AlertaEPP[]>(
      `${this.appUrl}${this.apiUrl}/epp/alertas`,
      { params }
    );
  }

  marcarAlertaLeidaEpp(id: number): Observable<{ msg: string; alerta: AlertaEPP }> {
    return this.http.put<{ msg: string; alerta: AlertaEPP }>(
      `${this.appUrl}${this.apiUrl}/epp/alertas/${id}`,
      {}
    );
  }

  // ========================================
  // DOCUMENTOS FIRMA
  // ========================================

  subirDocumento(archivo: File, titulo: string, descripcion?: string, empresa?: string) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('titulo', titulo);
    if (descripcion) formData.append('descripcion', descripcion);
    if (empresa) formData.append('empresa', empresa);
    return this.http.post<{ msg: string; documento: any }>(`${this.appUrl}${this.apiUrl}/documentos-firma`, formData);
  }

  obtenerDocumentosFirma(estado?: string, empresa?: string) {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (empresa) params = params.set('empresa', empresa);
    return this.http.get<any[]>(`${this.appUrl}${this.apiUrl}/documentos-firma`, { params });
  }

  obtenerDocumentoFirmaPorId(id: number) {
    return this.http.get<any>(`${this.appUrl}${this.apiUrl}/documentos-firma/${id}`);
  }

  eliminarDocumentoFirma(id: number) {
    return this.http.delete<{ msg: string }>(`${this.appUrl}${this.apiUrl}/documentos-firma/${id}`);
  }

  obtenerPaginaImagen(documentoId: number, pagina: number) {
    return `${this.appUrl}${this.apiUrl}/documentos-firma/${documentoId}/paginas/${pagina}`;
  }

  guardarCamposFirma(documentoId: number, campos: any[]) {
    return this.http.post<{ msg: string; campos: any[] }>(`${this.appUrl}${this.apiUrl}/documentos-firma/${documentoId}/campos`, { campos });
  }

  enviarDocumentoParaFirmar(documentoId: number) {
    return this.http.put<{ msg: string }>(`${this.appUrl}${this.apiUrl}/documentos-firma/${documentoId}/enviar`, {});
  }

  reenviarCorreoCampo(documentoId: number, campoId: number) {
    return this.http.post<{ msg: string }>(`${this.appUrl}${this.apiUrl}/documentos-firma/${documentoId}/campos/${campoId}/reenviar`, {});
  }

  obtenerInfoFirmaDocumento(token: string) {
    return this.http.get<any>(`${this.appUrl}${this.apiUrl}/documentos-firma/firmar/${token}`);
  }

  firmarDocumento(token: string, data: { firma: string }) {
    return this.http.post<{ msg: string }>(`${this.appUrl}${this.apiUrl}/documentos-firma/firmar/${token}`, data);
  }

  descargarPdfFirmado(documentoId: number) {
    return this.http.get(`${this.appUrl}${this.apiUrl}/documentos-firma/${documentoId}/pdf-firmado`, { responseType: 'blob' });
  }

  // ========================================
  // INSPECCIONES Y RIESGOS
  // ========================================

  crearInspeccion(data: any) {
    return this.http.post<{ msg: string; inspeccion: any }>(`${this.appUrl}${this.apiUrl}/inspecciones`, data);
  }

  obtenerInspecciones(estado?: string, empresa?: string, tipo?: string) {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (empresa) params = params.set('empresa', empresa);
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<any[]>(`${this.appUrl}${this.apiUrl}/inspecciones`, { params });
  }

  actualizarInspeccion(id: number, data: any) {
    return this.http.put<{ msg: string }>(`${this.appUrl}${this.apiUrl}/inspecciones/${id}`, data);
  }

  eliminarInspeccion(id: number) {
    return this.http.delete<{ msg: string }>(`${this.appUrl}${this.apiUrl}/inspecciones/${id}`);
  }

  guardarChecklist(inspeccionId: number, items: any[]) {
    return this.http.post<{ msg: string }>(`${this.appUrl}${this.apiUrl}/inspecciones/${inspeccionId}/checklist`, { items });
  }

  crearCondicionInsegura(data: any) {
    return this.http.post<{ msg: string; condicion: any }>(`${this.appUrl}${this.apiUrl}/condiciones-inseguras`, data);
  }

  obtenerCondicionesInseguras(estado?: string, severidad?: string) {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (severidad) params = params.set('severidad', severidad);
    return this.http.get<any[]>(`${this.appUrl}${this.apiUrl}/condiciones-inseguras`, { params });
  }

  actualizarCondicionInsegura(id: number, data: any) {
    return this.http.put<{ msg: string }>(`${this.appUrl}${this.apiUrl}/condiciones-inseguras/${id}`, data);
  }

  eliminarCondicionInsegura(id: number) {
    return this.http.delete<{ msg: string }>(`${this.appUrl}${this.apiUrl}/condiciones-inseguras/${id}`);
  }

  subirFotoCondicion(id: number, foto: File) {
    const formData = new FormData();
    formData.append('foto', foto);
    return this.http.post<{ msg: string }>(`${this.appUrl}${this.apiUrl}/condiciones-inseguras/${id}/foto`, formData);
  }

  crearRiesgo(data: any) {
    return this.http.post<{ msg: string; riesgo: any }>(`${this.appUrl}${this.apiUrl}/riesgos`, data);
  }

  obtenerRiesgos(empresa?: string, nivelRiesgo?: string) {
    let params = new HttpParams();
    if (empresa) params = params.set('empresa', empresa);
    if (nivelRiesgo) params = params.set('nivelRiesgo', nivelRiesgo);
    return this.http.get<any[]>(`${this.appUrl}${this.apiUrl}/riesgos`, { params });
  }

  actualizarRiesgo(id: number, data: any) {
    return this.http.put<{ msg: string }>(`${this.appUrl}${this.apiUrl}/riesgos/${id}`, data);
  }

  eliminarRiesgo(id: number) {
    return this.http.delete<{ msg: string }>(`${this.appUrl}${this.apiUrl}/riesgos/${id}`);
  }

  subirArchivoRiesgo(id: number, archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<{ msg: string }>(`${this.appUrl}${this.apiUrl}/riesgos/${id}/archivo`, formData);
  }

  crearPlanAccion(data: any) {
    return this.http.post<{ msg: string; plan: any }>(`${this.appUrl}${this.apiUrl}/planes-accion`, data);
  }

  obtenerPlanesAccion(estado?: string, origen?: string) {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (origen) params = params.set('origen', origen);
    return this.http.get<any[]>(`${this.appUrl}${this.apiUrl}/planes-accion`, { params });
  }

  actualizarPlanAccion(id: number, data: any) {
    return this.http.put<{ msg: string }>(`${this.appUrl}${this.apiUrl}/planes-accion/${id}`, data);
  }

  eliminarPlanAccion(id: number) {
    return this.http.delete<{ msg: string }>(`${this.appUrl}${this.apiUrl}/planes-accion/${id}`);
  }

  // ========================================
  // CAPACITACIONES SST
  // ========================================

  crearCapacitacion(data: any) {
    return this.http.post<{ msg: string; capacitacion: any }>(`${this.appUrl}${this.apiUrl}/capacitaciones`, data);
  }

  obtenerCapacitaciones(estado?: string, empresa?: string, tema?: string) {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (empresa) params = params.set('empresa', empresa);
    if (tema) params = params.set('tema', tema);
    return this.http.get<any[]>(`${this.appUrl}${this.apiUrl}/capacitaciones`, { params });
  }

  actualizarCapacitacion(id: number, data: any) {
    return this.http.put<{ msg: string }>(`${this.appUrl}${this.apiUrl}/capacitaciones/${id}`, data);
  }

  eliminarCapacitacion(id: number) {
    return this.http.delete<{ msg: string }>(`${this.appUrl}${this.apiUrl}/capacitaciones/${id}`);
  }

  subirMaterialCapacitacion(id: number, material: File) {
    const formData = new FormData();
    formData.append('material', material);
    return this.http.post<{ msg: string }>(`${this.appUrl}${this.apiUrl}/capacitaciones/${id}/material`, formData);
  }

  crearEvaluacion(capacitacionId: number, data: any) {
    return this.http.post<{ msg: string; evaluacion: any }>(`${this.appUrl}${this.apiUrl}/capacitaciones/${capacitacionId}/evaluacion`, data);
  }

  obtenerEvaluacion(capacitacionId: number) {
    return this.http.get<any>(`${this.appUrl}${this.apiUrl}/capacitaciones/${capacitacionId}/evaluacion`);
  }

  responderEvaluacion(capacitacionId: number, respuestas: any) {
    return this.http.post<{ calificacion: number; total: number; correctas: number }>(`${this.appUrl}${this.apiUrl}/capacitaciones/${capacitacionId}/evaluacion/responder`, { respuestas });
  }

  obtenerResultadosEvaluacion(capacitacionId: number) {
    return this.http.get<any[]>(`${this.appUrl}${this.apiUrl}/capacitaciones/${capacitacionId}/evaluacion/resultados`);
  }
}
