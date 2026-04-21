import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FilaCompensacion {
  fecha: string;
  horas: string;
}

export interface PlanCompensacion {
  id?: number;
  Uid?: number;
  nombreEmpleado: string;
  cargo: string;
  mesGenerador: string;
  mesCompensacion: string;
  anio: number;
  horasAcumuladas: string;
  observaciones: string;
  filas: FilaCompensacion[];
  usuario?: { name: string; lastName: string; cargo: string; email: string };
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CompensacionHorasService {
  private apiUrl = `${environment.apiUrl}/api/compensacion-horas`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` });
  }

  guardarPlan(plan: PlanCompensacion): Observable<any> {
    return this.http.post(this.apiUrl, plan, { headers: this.headers() });
  }

  getMiPlan(): Observable<PlanCompensacion[]> {
    return this.http.get<PlanCompensacion[]>(`${this.apiUrl}/mi-plan`, { headers: this.headers() });
  }

  getTodosLosPlanes(): Observable<PlanCompensacion[]> {
    return this.http.get<PlanCompensacion[]>(this.apiUrl, { headers: this.headers() });
  }

  eliminarPlan(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }
}
