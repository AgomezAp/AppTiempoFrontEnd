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
}
