import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface PlantillaCertificado {
  id?: number;
  codigo: string;
  nombre: string;
  titulo: string;
  descripcion?: string;
  cuerpo: string;
  variables_disponibles: string[];
  activo?: boolean;
  orden?: number;
}

export const VARIABLES_DISPONIBLES: { key: string; label: string }[] = [
  { key: 'nombreCompleto', label: 'Nombre del empleado' },
  { key: 'cedula', label: 'Cédula del empleado' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'empresa', label: 'Nombre de la empresa' },
  { key: 'nit', label: 'NIT de la empresa' },
  { key: 'gerente', label: 'Nombre del gerente' },
  { key: 'cedulaGerente', label: 'Cédula del gerente' },
  { key: 'cargoGerente', label: 'Cargo del gerente' },
  { key: 'fechaIngreso', label: 'Fecha de ingreso' },
  { key: 'salario', label: 'Salario formateado' },
  { key: 'salarioEnPalabras', label: 'Salario en palabras' },
  { key: 'ciudad', label: 'Ciudad' },
  { key: 'fechaCertificado', label: 'Fecha del certificado' },
  { key: 'tipoContrato', label: 'Tipo de contrato' },
  { key: 'fechaSalida', label: 'Fecha de salida' },
];

@Injectable({ providedIn: 'root' })
export class PlantillaCertificadoService {
  private api = `${environment.apiUrl}/api/plantillas-certificado`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PlantillaCertificado[]> {
    return this.http.get<PlantillaCertificado[]>(`${this.api}/admin`);
  }

  getActivas(): Observable<PlantillaCertificado[]> {
    return this.http.get<PlantillaCertificado[]>(this.api);
  }

  create(data: PlantillaCertificado): Observable<PlantillaCertificado> {
    return this.http.post<PlantillaCertificado>(this.api, data);
  }

  update(id: number, data: Partial<PlantillaCertificado>): Observable<PlantillaCertificado> {
    return this.http.put<PlantillaCertificado>(`${this.api}/${id}`, data);
  }

  toggle(id: number): Observable<PlantillaCertificado> {
    return this.http.patch<PlantillaCertificado>(`${this.api}/${id}/toggle`, {});
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  getUrlGenerar(codigo: string, Uid: number, empresa: string, extraParams: Record<string, string> = {}): string {
    const token = localStorage.getItem('token') || '';
    const params = new URLSearchParams({ empresa, ...extraParams });
    return `${this.api}/generar/${codigo}/${Uid}?${params.toString()}`;
  }
}
