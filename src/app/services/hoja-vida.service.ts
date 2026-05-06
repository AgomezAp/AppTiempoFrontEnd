import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HojaVidaService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.apiUrl}/api/hoja-vida`;
  }

  // Hoja de vida completa del colaborador
  obtenerHojaVidaCompleta(uid: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${uid}`);
  }

  // Generar PDF de la hoja de vida
  generarPdf(uid: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${uid}/pdf`, { responseType: 'blob' });
  }

  // ---- Experiencia laboral ----
  agregarExperiencia(uid: number, datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${uid}/experiencia`, datos);
  }
  editarExperiencia(uid: number, id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${uid}/experiencia/${id}`, datos);
  }
  eliminarExperiencia(uid: number, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${uid}/experiencia/${id}`);
  }

  // ---- Formación académica ----
  agregarFormacion(uid: number, datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${uid}/formacion`, datos);
  }
  editarFormacion(uid: number, id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${uid}/formacion/${id}`, datos);
  }
  eliminarFormacion(uid: number, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${uid}/formacion/${id}`);
  }

  // ---- Habilidades ----
  agregarHabilidad(uid: number, datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${uid}/habilidades`, datos);
  }
  eliminarHabilidad(uid: number, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${uid}/habilidades/${id}`);
  }

  // ---- Referencias ----
  agregarReferencia(uid: number, datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${uid}/referencias`, datos);
  }
  eliminarReferencia(uid: number, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${uid}/referencias/${id}`);
  }

  // ---- Grupo familiar ----
  agregarFamiliar(uid: number, datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${uid}/grupo-familiar`, datos);
  }
  editarFamiliar(uid: number, id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${uid}/grupo-familiar/${id}`, datos);
  }
  eliminarFamiliar(uid: number, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${uid}/grupo-familiar/${id}`);
  }

  // ---- Expediente: Trazabilidad empresa ----
  obtenerPermisos(uid: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${uid}/permisos`);
  }
  obtenerNovedades(uid: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${uid}/novedades`);
  }
  obtenerActasInventario(uid: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${uid}/actas-inventario`);
  }

  // ---- Expediente: Documentos adjuntos ----
  listarDocumentos(uid: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${uid}/documentos`);
  }
  subirDocumento(uid: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${uid}/documentos`, formData);
  }
  descargarDocumento(uid: number, docId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${uid}/documentos/${docId}/descargar`, { responseType: 'blob' });
  }
  eliminarDocumento(uid: number, docId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${uid}/documentos/${docId}`);
  }

  // ---- Lista de todos los colaboradores (Admin / RRHH) ----
  listarColaboradores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }

  // ---- Inicializar carpetas de todos los colaboradores ----
  inicializarCarpetas(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inicializar-carpetas`, {});
  }

  // ---- Expediente: Notas admin ----
  listarNotas(uid: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${uid}/notas`);
  }
  agregarNota(uid: number, nota: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${uid}/notas`, { nota });
  }
  eliminarNota(uid: number, notaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${uid}/notas/${notaId}`);
  }
}

