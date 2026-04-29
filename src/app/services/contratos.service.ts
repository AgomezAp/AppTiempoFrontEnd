import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Contrato {
  id?: number;
  Uid: number;
  tipo_contrato: string;
  numero_contrato?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  salario: number;
  cargo: string;
  empresa: string;
  area?: string;
  jornada?: string;
  lugar_trabajo?: string;
  periodo_prueba_dias?: number;
  estado?: string;
  observaciones?: string;
  documento_url?: string;
  colaborador?: any;
  modificaciones?: ContratoModificacion[];
  created_at?: string;
  updated_at?: string;
}

export interface ContratoModificacion {
  id?: number;
  contrato_id: number;
  tipo_modificacion: string;
  fecha_efectiva: string;
  descripcion: string;
  nuevo_salario?: number;
  nuevo_cargo?: string;
  nueva_fecha_fin?: string;
  documento_url?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContratosService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.apiUrl}/api/contratos`;
  }

  // Contratos de un empleado específico
  obtenerContratosEmpleado(uid: number): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(`${this.apiUrl}/empleado/${uid}`);
  }

  // Todos los contratos vigentes (Admin)
  obtenerContratosVigentes(): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(`${this.apiUrl}/vigentes`);
  }

  // Detalle de un contrato
  obtenerContrato(id: number): Observable<Contrato> {
    return this.http.get<Contrato>(`${this.apiUrl}/${id}`);
  }

  // Crear contrato
  crearContrato(contrato: Partial<Contrato>): Observable<any> {
    return this.http.post(this.apiUrl, contrato);
  }

  // Actualizar contrato
  actualizarContrato(id: number, datos: Partial<Contrato>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, datos);
  }

  // Agregar modificación / otrosí
  agregarModificacion(contratoId: number, modificacion: Partial<ContratoModificacion>): Observable<any> {
    return this.http.post(`${this.apiUrl}/${contratoId}/modificaciones`, modificacion);
  }

  // Generar PDF del contrato
  generarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
