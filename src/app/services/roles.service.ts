import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export const MODULOS_SISTEMA = [
  { key: 'horas',                   label: 'Horas y Registro',              grupo: 'Horarios' },
  { key: 'novedades',               label: 'Novedades',                     grupo: 'Horarios' },
  { key: 'permisos',                label: 'Permisos',                      grupo: 'Horarios' },
  { key: 'usuarios',                label: 'Usuarios',                      grupo: 'Administración' },
  { key: 'admin_roles',             label: 'Gestión de Roles',              grupo: 'Administración' },
  { key: 'recursos',                label: 'Recursos (Certificados, etc.)', grupo: 'Recursos' },
  { key: 'ssgt',                    label: 'SSGT',                          grupo: 'Seguridad' },
  { key: 'rrhh_contratos',          label: 'RRHH - Contratos',              grupo: 'RRHH' },
  { key: 'rrhh_hoja_vida',          label: 'RRHH - Hoja de Vida',           grupo: 'RRHH' },
  { key: 'rrhh_evaluaciones',       label: 'RRHH - Evaluaciones',           grupo: 'RRHH' },
  { key: 'inventario_dispositivos', label: 'Inventario - Dispositivos',     grupo: 'Inventario' },
  { key: 'inventario_mobiliario',   label: 'Inventario - Mobiliario',       grupo: 'Inventario' },
  { key: 'inventario_aseo',         label: 'Inventario - Aseo',             grupo: 'Inventario' },
  { key: 'inventario_papeleria',    label: 'Inventario - Papelería',        grupo: 'Inventario' },
  { key: 'inventario_botiquin',     label: 'Inventario - Botiquín',         grupo: 'Inventario' },
  { key: 'inventario_dotacion',     label: 'Inventario - Dotación',         grupo: 'Inventario' },
];

@Injectable({ providedIn: 'root' })
export class RolesService {
  private base: string;

  constructor(private http: HttpClient) {
    this.base = `${environment.apiUrl}/api/roles`;
  }

  listarRoles(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  crearRol(Rname: string): Observable<any> {
    return this.http.post(this.base, { Rname });
  }

  actualizarNombreRol(id: number, Rname: string): Observable<any> {
    return this.http.put(`${this.base}/${id}`, { Rname });
  }

  eliminarRol(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  getModulosRol(id: number): Observable<{ role: any; modulos: any[] }> {
    return this.http.get<any>(`${this.base}/${id}/modulos`);
  }

  actualizarModulosRol(id: number, modulos: string[]): Observable<any> {
    return this.http.put(`${this.base}/${id}/modulos`, { modulos });
  }

  getUsuariosRol(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/${id}/usuarios`);
  }

  getMisModulos(): Observable<{ modulos: string[] }> {
    return this.http.get<any>(`${this.base}/mis-modulos`);
  }
}
