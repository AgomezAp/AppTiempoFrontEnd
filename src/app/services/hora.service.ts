import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { Hora } from '../interfaces/hora';

@Injectable({
  providedIn: 'root'
})
export class HoraService {
  private appUrl : string;
  private apiUrl : string;

  constructor(private http: HttpClient) {
    this.appUrl = environment.apiUrl;
    this.apiUrl = 'api/horario';
  }

  getHoras(): Observable<Hora[]> {
    return this.http.get<Hora[]>(`${this.appUrl}${this.apiUrl}`);
  }
  updateHoraSalida( id:number, hora: Hora): Observable<Hora> {
    return this.http.patch<Hora>(`${this.appUrl}${this.apiUrl}/actualizar/${id}`, hora);
  }
  getHorarioById(id:number):Observable<Hora>{
    return this.http.get<Hora>(`${this.appUrl}${this.apiUrl}/obtener/${id}`)
  }
  guardarDatos(hora:Hora):Observable<Hora>{
    return this.http.post<Hora>(`${this.appUrl}${this.apiUrl}/register`, hora)
  }
}