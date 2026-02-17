import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AlertItem {
  Aid: number;
  Uid: number;
  Name: string;
  type: string;
  minutes: number;
  periodoInicio: string;
  periodoFin: string;
  notified: boolean;
  createdAt: string;
}

export interface PermisoDetalle {
  id: number;
  fecha: string;
  tipo: string;
  costo: number;
  cancelado: boolean;
}

export interface CostoUsuario {
  Uid: number;
  nombre: string;
  cargo: string;
  empresa: string;
  salario: number;
  citasMedicas: number;
  citasOdontologicas: number;
  totalPermisos: number;
  totalHoras: number;
  costoTotal: number;
  tarifaHora: number;
  permisos: PermisoDetalle[];
}

export interface CostoPermisosMedicos {
  summary: {
    totalPermisos: number;
    totalHoras: number;
    totalCosto: number;
    empleadosAfectados: number;
    horasPorCita: number;
    salarioMinimoReferencia: number;
  };
  byUser: CostoUsuario[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAlerts(from?: string, to?: string): Observable<{ alerts: AlertItem[] }> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<{ alerts: AlertItem[] }>(`${this.apiUrl}/alerts`, {
      headers: this.getHeaders(),
      params,
    });
  }

  getCostoPermisosMedicos(from?: string, to?: string): Observable<{ success: boolean; stats: CostoPermisosMedicos }> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<{ success: boolean; stats: CostoPermisosMedicos }>(`${this.apiUrl}/ausentismo/stats`, {
      headers: this.getHeaders(),
      params,
    });
  }

  togglePermisoCancelado(permisoId: number): Observable<{ success: boolean; cancelado: boolean; message: string }> {
    return this.http.patch<{ success: boolean; cancelado: boolean; message: string }>(
      `${this.apiUrl}/ausentismo/permiso/${permisoId}/toggle-cancelado`,
      {},
      { headers: this.getHeaders() }
    );
  }
}

