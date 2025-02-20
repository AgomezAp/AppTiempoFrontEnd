import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment.development';
import { Hora, Extra, Novedad} from '../interfaces/hora';
import { response } from 'express';

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
    return this.http.get<Hora[]>(`${this.appUrl}${this.apiUrl}/ObtenerHorario`);
  }
  
  getHorarioById(ID:number):Observable<Hora[]>{
    return this.http.get<Hora[]>(`${this.appUrl}${this.apiUrl}/ObtenerHorario/${ID}`).pipe(
      map((response: any) => {
        return Array.isArray(response) ? response : [response];
      })
    );
  }
  getHorarioByFecha(Fecha:string):Observable<Hora[]>{
    return this.http.get<Hora[]>(`${this.appUrl}${this.apiUrl}/Obtener/${Fecha}`).pipe(
      map((response: any) => {
        return Array.isArray(response) ? response : [response];
      })
    );
  }

  getRegistro(id: number, fecha: string): Observable<Hora> {
    return this.http.get<Hora>(`${this.appUrl}${this.apiUrl}/ObtenerHorario/${id}/${fecha}`);
  } 
  updateSalida(id: number, fecha: string, salida: string): Observable<any> {
    return this.http.put(`${this.appUrl}${this.apiUrl}/ActualizarSalida`, { id, fecha, salida });
  }

  updateEntrada(id: number, fecha: string, entrada: string): Observable<any> {
    return this.http.put(`${this.appUrl}${this.apiUrl}/ActualizarEntrada`, { id, fecha, entrada });
  }

  getExtra(): Observable<Extra[]> {
    return this.http.get<Extra[]>(`${this.appUrl}${this.apiUrl}/ObtenerExtra`);
  }

  getExtraById(id: number): Observable<Extra[]> {
    return this.http.get<Extra>(`${this.appUrl}${this.apiUrl}/ObtenerExtra/${id}`).pipe(
      map((response: any) => {
        return Array.isArray(response) ? response : [response];
      })
    );
  }

  createRegistro(registro:Hora):Observable<Hora>{
    return this.http.post<Hora>(`${this.appUrl}${this.apiUrl}/agregarRegistro`, registro);
  }

  informePersonal(id: number[], fechaInicial: string, fechaFinal: string): Observable<Blob>{
    const body = {
      id: id,
      fechaInicial: fechaInicial,
      fechaFinal: fechaFinal
    };
    return this.http.post<Blob>(`${this.appUrl}${this.apiUrl}/informePersonal`, body, { 
      responseType: 'blob' as 'json'
    });
  }

  informeNovedad(fechaInicial: string, fechaFinal: string): Observable<Blob>{
    const body = {
      fechaInicial: fechaInicial,
      fechaFinal: fechaFinal
    };
    return this.http.post<Blob>(`${this.appUrl}${this.apiUrl}/informeNovedad`, body, {
      responseType: 'blob' as 'json'
    });
  }

  informeRiesgo(fechaInicial: string, fechaFinal: string): Observable<Blob>{
    const body = {
      fechaInicial: fechaInicial,
      fechaFinal: fechaFinal
    };
    return this.http.post<Blob>(`${this.appUrl}${this.apiUrl}/InformeRiesgo`, body, {
      responseType: 'blob' as 'json'
    });
  }
  
}