import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface ItemPlantilla {
  id?: number;
  nombre: string;
  categoria: string;
  cantidad: number;
  unidad: string;
  descripcion?: string;
}

export interface PlantillaInventario {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  items?: ItemPlantilla[];
}

export interface InventarioUsuario {
  id?: number;
  Uid: number;
  plantillaId: number;
  fechaAsignacion: string;
  observaciones?: string;
  estado: 'activo' | 'inactivo';
  plantilla?: PlantillaInventario;
}

@Injectable({ providedIn: 'root' })
export class PlantillaInventarioService {
  private base: string;

  constructor(private http: HttpClient) {
    this.base = `${environment.apiUrl}/api/plantillas-inventario`;
  }

  getAll(): Observable<PlantillaInventario[]> {
    return this.http.get<PlantillaInventario[]>(this.base);
  }

  getById(id: number): Observable<PlantillaInventario> {
    return this.http.get<PlantillaInventario>(`${this.base}/${id}`);
  }

  create(data: { nombre: string; descripcion?: string; items?: ItemPlantilla[] }): Observable<PlantillaInventario> {
    return this.http.post<PlantillaInventario>(this.base, data);
  }

  update(id: number, data: { nombre?: string; descripcion?: string; items?: ItemPlantilla[] }): Observable<PlantillaInventario> {
    return this.http.put<PlantillaInventario>(`${this.base}/${id}`, data);
  }

  toggleActivo(id: number): Observable<PlantillaInventario> {
    return this.http.patch<PlantillaInventario>(`${this.base}/${id}/toggle`, {});
  }

  getInventariosUsuario(Uid: number): Observable<InventarioUsuario[]> {
    return this.http.get<InventarioUsuario[]>(`${this.base}/usuario/${Uid}`);
  }

  asignar(Uid: number, plantillaId: number, observaciones?: string): Observable<InventarioUsuario> {
    return this.http.post<InventarioUsuario>(`${this.base}/asignar`, { Uid, plantillaId, observaciones });
  }

  asignarMultiple(uids: number[], plantillaId: number, observaciones?: string): Observable<any> {
    return this.http.post(`${this.base}/asignar/multiple`, { uids, plantillaId, observaciones });
  }

  remover(id: number): Observable<any> {
    return this.http.delete(`${this.base}/asignar/${id}`);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  getTodasAsignaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/asignaciones/todas`);
  }

  actualizarAsignacion(id: number, data: { plantillaId?: number; observaciones?: string; estado?: string }): Observable<any> {
    return this.http.put<any>(`${this.base}/asignar/${id}`, data);
  }
}
