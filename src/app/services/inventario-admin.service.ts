import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface CatalogoInventario {
  dispositivos: any[];
  mobiliario: any[];
  tiposInventario: any[];
}

export interface EditarDispositivoDto {
  nombre?: string; categoria?: string; descripcion?: string;
  observaciones?: string; ubicacion?: string; color?: string;
  marca?: string; modelo?: string;
}

export interface EditarMobiliarioDto {
  nombre?: string; categoria?: string; descripcion?: string;
  observaciones?: string; ubicacionAlmacen?: string; proveedor?: string;
}

export interface EditarConsumibleDto {
  nombre?: string; categoria?: string; descripcion?: string;
  observaciones?: string; ubicacionAlmacen?: string; proveedor?: string;
  stockMinimo?: number; stockMaximo?: number;
}

export interface CampoTipoInventario {
  id?: number;
  tipoInventarioId: number;
  nombre: string;
  clave: string;
  tipo_campo: 'texto' | 'numero' | 'fecha' | 'booleano';
  requerido: boolean;
  orden?: number;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class InventarioAdminService {
  private base: string;

  constructor(private http: HttpClient) {
    this.base = `${environment.apiUrl}/api/inventario-admin`;
  }

  getCatalogo(): Observable<CatalogoInventario> {
    return this.http.get<CatalogoInventario>(this.base);
  }

  getTiposInventario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/tipos`);
  }

  crearInventarioCompleto(data: { nombre: string; codigo: string; descripcion: string; items: any[] }): Observable<any> {
    return this.http.post(`${this.base}/crear-inventario`, data);
  }

  editarDispositivo(id: number, data: EditarDispositivoDto): Observable<any> {
    return this.http.put(`${this.base}/dispositivo/${id}`, data);
  }
  ocultarDispositivo(id: number): Observable<any> {
    return this.http.patch(`${this.base}/dispositivo/${id}/ocultar`, {});
  }
  restaurarDispositivo(id: number): Observable<any> {
    return this.http.patch(`${this.base}/dispositivo/${id}/restaurar`, {});
  }

  editarMobiliario(id: number, data: EditarMobiliarioDto): Observable<any> {
    return this.http.put(`${this.base}/mobiliario/${id}`, data);
  }
  ocultarMobiliario(id: number): Observable<any> {
    return this.http.patch(`${this.base}/mobiliario/${id}/ocultar`, {});
  }
  restaurarMobiliario(id: number): Observable<any> {
    return this.http.patch(`${this.base}/mobiliario/${id}/restaurar`, {});
  }

  editarConsumible(id: number, data: EditarConsumibleDto): Observable<any> {
    return this.http.put(`${this.base}/consumible/${id}`, data);
  }
  ocultarConsumible(id: number): Observable<any> {
    return this.http.patch(`${this.base}/consumible/${id}/ocultar`, {});
  }
  restaurarConsumible(id: number): Observable<any> {
    return this.http.patch(`${this.base}/consumible/${id}/restaurar`, {});
  }

  getCampos(tipoId: number): Observable<CampoTipoInventario[]> {
    return this.http.get<CampoTipoInventario[]>(`${this.base}/campos/${tipoId}`);
  }
  crearCampo(data: CampoTipoInventario): Observable<any> {
    return this.http.post(`${this.base}/campos`, data);
  }
  actualizarCampo(id: number, data: Partial<CampoTipoInventario>): Observable<any> {
    return this.http.put(`${this.base}/campos/${id}`, data);
  }
  eliminarCampo(id: number): Observable<any> {
    return this.http.delete(`${this.base}/campos/${id}`);
  }
}
