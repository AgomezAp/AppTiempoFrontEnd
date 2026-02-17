import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ActaRecarga,
  ActaRecargaResponse,
  ActasRecargaListResponse,
  AccesosListResponse,
  MiAccesoResponse,
  UsuariosDisponiblesResponse,
  CrearActaRequest,
  FirmarActaRequest,
  ActaRecargaAcceso,
} from '../interfaces/acta-recarga';

@Injectable({ providedIn: 'root' })
export class ActaRecargaService {
  private apiUrl = `${environment.apiUrl}/api/actas-recargas`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ==================== ACTAS ====================

  getActas(params?: { anio?: number; estado?: string; page?: number; limit?: number }): Observable<ActasRecargaListResponse> {
    let httpParams = new HttpParams();
    if (params?.anio) httpParams = httpParams.set('anio', params.anio.toString());
    if (params?.estado) httpParams = httpParams.set('estado', params.estado);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<ActasRecargaListResponse>(this.apiUrl, {
      headers: this.getHeaders(),
      params: httpParams,
    });
  }

  getActaById(id: number): Observable<ActaRecargaResponse> {
    return this.http.get<ActaRecargaResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  crearActa(data: CrearActaRequest): Observable<ActaRecargaResponse> {
    return this.http.post<ActaRecargaResponse>(this.apiUrl, data, {
      headers: this.getHeaders(),
    });
  }

  actualizarActa(id: number, data: Partial<CrearActaRequest>): Observable<ActaRecargaResponse> {
    return this.http.put<ActaRecargaResponse>(`${this.apiUrl}/${id}`, data, {
      headers: this.getHeaders(),
    });
  }

  eliminarActa(id: number): Observable<{ success: boolean; msg: string }> {
    return this.http.delete<{ success: boolean; msg: string }>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  enviarActaParaRevision(id: number, firmaEmisor?: string, firmaEmisorImagen?: string): Observable<ActaRecargaResponse> {
    return this.http.post<ActaRecargaResponse>(
      `${this.apiUrl}/${id}/enviar`,
      { firmaEmisor, firmaEmisorImagen },
      { headers: this.getHeaders() }
    );
  }

  // ==================== FIRMA POR TOKEN (público) ====================

  getActaByToken(token: string): Observable<ActaRecargaResponse> {
    return this.http.get<ActaRecargaResponse>(`${this.apiUrl}/firmar/${token}`);
  }

  firmarActa(token: string, data: FirmarActaRequest): Observable<ActaRecargaResponse> {
    return this.http.post<ActaRecargaResponse>(`${this.apiUrl}/firmar/${token}`, data);
  }

  // ==================== ACCESOS ====================

  verificarMiAcceso(): Observable<MiAccesoResponse> {
    return this.http.get<MiAccesoResponse>(`${this.apiUrl}/mi-acceso`, {
      headers: this.getHeaders(),
    });
  }

  getUsuariosDisponibles(): Observable<UsuariosDisponiblesResponse> {
    return this.http.get<UsuariosDisponiblesResponse>(`${this.apiUrl}/usuarios-disponibles`, {
      headers: this.getHeaders(),
    });
  }

  getUsuariosConAcceso(): Observable<AccesosListResponse> {
    return this.http.get<AccesosListResponse>(`${this.apiUrl}/accesos/lista`, {
      headers: this.getHeaders(),
    });
  }

  agregarAcceso(usuarioId: number, puedeVer: boolean = true, puedeEditar: boolean = false): Observable<{ success: boolean; msg: string; acceso: ActaRecargaAcceso }> {
    return this.http.post<{ success: boolean; msg: string; acceso: ActaRecargaAcceso }>(
      `${this.apiUrl}/accesos`,
      { usuarioId, puedeVer, puedeEditar },
      { headers: this.getHeaders() }
    );
  }

  actualizarAcceso(id: number, puedeVer: boolean, puedeEditar: boolean): Observable<{ success: boolean; msg: string; acceso: ActaRecargaAcceso }> {
    return this.http.put<{ success: boolean; msg: string; acceso: ActaRecargaAcceso }>(
      `${this.apiUrl}/accesos/${id}`,
      { puedeVer, puedeEditar },
      { headers: this.getHeaders() }
    );
  }

  eliminarAcceso(id: number): Observable<{ success: boolean; msg: string }> {
    return this.http.delete<{ success: boolean; msg: string }>(`${this.apiUrl}/accesos/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
