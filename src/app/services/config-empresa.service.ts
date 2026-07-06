import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface ConfigEmpresa {
  id?: number;
  codigo: 'AP' | 'AT' | 'ME';
  nombre: string;
  nit: string;
  gerente: string;
  cargo_gerente: string;
  cedula_gerente: string;
  direccion: string;
  telefono: string;
  email: string;
  logo_url: string;
  watermark_url: string;
  header_color: string;
  accent_color: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfigEmpresaService {
  private base: string;

  constructor(private http: HttpClient) {
    this.base = `${environment.apiUrl}/api/config-empresas`;
  }

  getAll(): Observable<ConfigEmpresa[]> {
    return this.http.get<ConfigEmpresa[]>(this.base);
  }

  getByCodigo(codigo: string): Observable<ConfigEmpresa> {
    return this.http.get<ConfigEmpresa>(`${this.base}/${codigo}`);
  }

  update(codigo: string, data: Partial<ConfigEmpresa>): Observable<ConfigEmpresa> {
    return this.http.put<ConfigEmpresa>(`${this.base}/${codigo}`, data);
  }

  uploadImagen(codigo: string, file: File, tipo: 'logo' | 'watermark'): Observable<any> {
    const form = new FormData();
    form.append('imagen', file);
    return this.http.post(`${this.base}/${codigo}/imagen?tipo=${tipo}`, form);
  }
}
