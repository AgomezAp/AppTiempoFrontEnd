import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { Permiso } from '../interfaces/permiso';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private appUrl : string;
  private apiUrl : string;
  constructor(private http:HttpClient) { 
    this.appUrl= environment.apiUrl
    this.apiUrl = 'api/permisos'
  }

  createPermiso(permiso: FormData): Observable<Permiso> {
    return this.http.post<Permiso>(`${this.appUrl}${this.apiUrl}/crear`, permiso);
  }

  getPermisosByUserId(Uid: number): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.apiUrl}/${Uid}`);
  }

  getAllUsersWithPermisos(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users-with-permisos`);
  }
}
