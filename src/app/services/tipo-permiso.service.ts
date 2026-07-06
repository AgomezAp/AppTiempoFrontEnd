import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface TipoPermiso {
  id?: number;
  nombre: string;
  descripcion?: string;
  requiere_horas: boolean;
  requiere_soporte: boolean;
  requiere_fecha_fin: boolean;
  minimo_dias_general?: number;
  minimo_dias_gestion_admin?: number;
  es_para_cc_filtrado: boolean;
  activo: boolean;
  orden: number;
}

@Injectable({ providedIn: 'root' })
export class TipoPermisoService {
  private base: string;

  constructor(private http: HttpClient) {
    this.base = `${environment.apiUrl}/api/tipos-permiso`;
  }

  getActivos(): Observable<TipoPermiso[]> {
    return this.http.get<TipoPermiso[]>(this.base);
  }

  getAllAdmin(): Observable<TipoPermiso[]> {
    return this.http.get<TipoPermiso[]>(`${this.base}/admin`);
  }

  create(t: Omit<TipoPermiso, 'id'>): Observable<TipoPermiso> {
    return this.http.post<TipoPermiso>(this.base, t);
  }

  update(id: number, t: Partial<TipoPermiso>): Observable<TipoPermiso> {
    return this.http.put<TipoPermiso>(`${this.base}/${id}`, t);
  }

  toggle(id: number): Observable<TipoPermiso> {
    return this.http.patch<TipoPermiso>(`${this.base}/${id}/toggle`, {});
  }

  reorder(orden: { id: number; orden: number }[]): Observable<any> {
    return this.http.patch(`${this.base}/reorder/bulk`, { orden });
  }
}
