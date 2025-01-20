import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Novedad } from '../interfaces/hora'
@Injectable({
  providedIn: 'root'
})
export class NovedadService {
  private appUrl: string;
  private apiUrl: string;
  constructor(private http:HttpClient) {
    this.appUrl = environment.apiUrl
    this.apiUrl = 'api/horario'
  }

  createNovedad(novedad:Novedad):Observable<Novedad>{
    return this.http.post<Novedad>(`${this.appUrl}${this.apiUrl}/NuevaNovedad`, novedad)
  }
  verNovedad(): Observable<Novedad[]>{
    return this.http.get<Novedad[]>(`${this.appUrl}${this.apiUrl}/ObtenerNovedad`)
  }
}
