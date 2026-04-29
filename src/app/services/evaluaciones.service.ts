import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionesService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.apiUrl}/api/evaluaciones`;
  }

  // ==================== PERÍODOS ====================
  listarPeriodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/periodos`);
  }
  crearPeriodo(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/periodos`, datos);
  }
  actualizarPeriodo(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/periodos/${id}`, datos);
  }

  // ==================== CATEGORÍAS Y CRITERIOS ====================
  listarCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categorias`);
  }
  crearCategoria(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias`, datos);
  }
  crearCriterio(categoriaId: number, datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias/${categoriaId}/criterios`, datos);
  }

  // ==================== EVALUACIONES ====================
  crearEvaluacion(datos: any): Observable<any> {
    return this.http.post(this.apiUrl, datos);
  }
  obtenerEvaluacion(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  listarEvaluacionesPeriodo(periodoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/periodo/${periodoId}`);
  }
  guardarCalificaciones(id: number, calificaciones: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/calificaciones`, { calificaciones });
  }
  guardarObjetivos(id: number, objetivos: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/objetivos`, { objetivos });
  }
  completarEvaluacion(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/completar`, datos);
  }
  generarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  // ==================== GRÁFICAS ====================
  obtenerGraficaRadar(uid: number, periodoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/graficas/radar/${uid}/${periodoId}`);
  }
  obtenerGraficaComparativoArea(areaId: number, periodoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/graficas/comparativo-area/${areaId}/${periodoId}`);
  }
  obtenerGraficaEvolucion(uid: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/graficas/evolucion/${uid}`);
  }
  obtenerGraficaDistribucion(periodoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/graficas/distribucion/${periodoId}`);
  }
  obtenerDashboard(periodoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/graficas/dashboard/${periodoId}`);
  }
}
