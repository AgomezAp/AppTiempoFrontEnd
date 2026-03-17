import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import {
  RegistroAsistencia,
  CrearRegistroRequest,
  InfoFirmaResponse,
  FirmarRequest,
} from '../interfaces/asistencia';

@Injectable({
  providedIn: 'root',
})
export class AsistenciaService {
  private appUrl: string;
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.appUrl = environment.apiUrl;
    this.apiUrl = '/api/asistencia';
  }

  // Crear un nuevo registro de asistencia
  crearRegistro(data: CrearRegistroRequest): Observable<{ msg: string; registro: RegistroAsistencia }> {
    return this.http.post<{ msg: string; registro: RegistroAsistencia }>(
      `${this.appUrl}${this.apiUrl}/crear`,
      data
    );
  }

  // Obtener todos los registros
  obtenerRegistros(): Observable<RegistroAsistencia[]> {
    return this.http.get<RegistroAsistencia[]>(`${this.appUrl}${this.apiUrl}/lista`);
  }

  // Obtener un registro por ID
  obtenerRegistroPorId(id: number): Observable<RegistroAsistencia> {
    return this.http.get<RegistroAsistencia>(`${this.appUrl}${this.apiUrl}/detalle/${id}`);
  }

  // Obtener información para firmar (ruta pública)
  obtenerInfoFirma(token: string): Observable<InfoFirmaResponse> {
    return this.http.get<InfoFirmaResponse>(`${this.appUrl}${this.apiUrl}/firmar/${token}`);
  }

  // Firmar asistencia (ruta pública)
  firmarAsistencia(token: string, firma: FirmarRequest): Observable<{ msg: string; firmados: number; totalParticipantes: number }> {
    return this.http.post<{ msg: string; firmados: number; totalParticipantes: number }>(
      `${this.appUrl}${this.apiUrl}/firmar/${token}`,
      firma
    );
  }

  // Descargar PDF del acta
  descargarPDF(id: number, empresa: string): Observable<Blob> {
    return this.http.get(`${this.appUrl}${this.apiUrl}/pdf/${id}?empresa=${empresa}`, {
      responseType: 'blob',
    });
  }

  // Reenviar correo de firma a un participante
  reenviarCorreoFirma(participanteId: number): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(
      `${this.appUrl}${this.apiUrl}/reenviar/${participanteId}`,
      {}
    );
  }

  // Eliminar un registro
  eliminarRegistro(id: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${this.appUrl}${this.apiUrl}/eliminar/${id}`);
  }

  // Cancelar token de firma de un participante
  cancelarToken(participanteId: number, motivo?: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(
      `${this.appUrl}${this.apiUrl}/cancelar-token/${participanteId}`,
      { motivo }
    );
  }

  // Anular firma de un participante
  anularFirma(participanteId: number, motivo?: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(
      `${this.appUrl}${this.apiUrl}/anular-firma/${participanteId}`,
      { motivo }
    );
  }
}
