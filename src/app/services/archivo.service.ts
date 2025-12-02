import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Archivo, ArchivoResponse } from '../interfaces/archivo';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArchivoService {
  private apiUrl = `${environment.apiUrl}/api/archivos`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todos los archivos
  getArchivos(): Observable<ArchivoResponse> {
    return this.http.get<ArchivoResponse>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  // Obtener archivos por categoría
  getArchivosPorCategoria(categoria: string): Observable<ArchivoResponse> {
    return this.http.get<ArchivoResponse>(`${this.apiUrl}/categoria/${categoria}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener un archivo por ID
  getArchivo(id: number): Observable<ArchivoResponse> {
    return this.http.get<ArchivoResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Crear archivo (solo admin)
  createArchivo(formData: FormData): Observable<ArchivoResponse> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<ArchivoResponse>(this.apiUrl, formData, {
      headers: headers
    });
  }

  // Actualizar archivo (solo admin)
  updateArchivo(id: number, formData: FormData): Observable<ArchivoResponse> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.put<ArchivoResponse>(`${this.apiUrl}/${id}`, formData, {
      headers: headers
    });
  }

  // Eliminar archivo lógicamente (solo admin)
  deleteArchivo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Eliminar archivo físicamente (solo admin)
  deleteArchivoFisico(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/fisico/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener URL completa del archivo
  getFileUrl(url: string): string {
    return `${environment.apiUrl}${url}`;
  }
}
