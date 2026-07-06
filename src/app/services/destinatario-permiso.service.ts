import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface DestinatarioPermiso {
  id?: number;
  email: string;
  nombre: string;
  tipo: 'fijo' | 'filtrado';
  tipos_permiso: string[];
  es_cc: boolean;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class DestinatarioPermisoService {
  private base: string;

  constructor(private http: HttpClient) {
    this.base = `${environment.apiUrl}/api/destinatarios-permiso`;
  }

  getAll(): Observable<DestinatarioPermiso[]> {
    return this.http.get<DestinatarioPermiso[]>(this.base);
  }

  create(d: Omit<DestinatarioPermiso, 'id'>): Observable<DestinatarioPermiso> {
    return this.http.post<DestinatarioPermiso>(this.base, d);
  }

  update(id: number, d: Partial<DestinatarioPermiso>): Observable<DestinatarioPermiso> {
    return this.http.put<DestinatarioPermiso>(`${this.base}/${id}`, d);
  }

  toggle(id: number): Observable<DestinatarioPermiso> {
    return this.http.patch<DestinatarioPermiso>(`${this.base}/${id}/toggle`, {});
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
