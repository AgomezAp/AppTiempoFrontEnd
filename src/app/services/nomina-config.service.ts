import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NominaConfig } from '../interfaces/nomina-config';

@Injectable({
  providedIn: 'root'
})
export class NominaConfigService {
  private apiUrl = `${environment.apiUrl}/api/nomina-config`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener configuración vigente
  getConfigVigente(): Observable<NominaConfig> {
    return this.http.get<NominaConfig>(`${this.apiUrl}/vigente`, {
      headers: this.getHeaders()
    });
  }

  // Obtener todas las configuraciones (historial)
  getAllConfigs(): Observable<NominaConfig[]> {
    return this.http.get<NominaConfig[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  // Crear nueva configuración
  createConfig(config: Partial<NominaConfig>): Observable<NominaConfig> {
    return this.http.post<NominaConfig>(this.apiUrl, config, {
      headers: this.getHeaders()
    });
  }

  // Actualizar configuración
  updateConfig(id: number, config: Partial<NominaConfig>): Observable<NominaConfig> {
    return this.http.put<NominaConfig>(`${this.apiUrl}/${id}`, config, {
      headers: this.getHeaders()
    });
  }

  // Activar configuración como vigente
  toggleVigencia(id: number): Observable<NominaConfig> {
    return this.http.patch<NominaConfig>(`${this.apiUrl}/${id}/vigencia`, {}, {
      headers: this.getHeaders()
    });
  }

  // Eliminar configuración
  deleteConfig(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
