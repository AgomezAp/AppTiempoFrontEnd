import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Novedad , NovedadHistorico } from '../interfaces/hora'
@Injectable({
  providedIn: 'root'
})
export class NovedadService {
  private appUrl: string;
  private apiUrl: string;
  constructor(private http:HttpClient) {
    this.appUrl = environment.apiUrl
    this.apiUrl = '/api/novedad'
  }

  createNovedad():Observable<Novedad>{
    return this.http.post<Novedad>(`${this.appUrl}${this.apiUrl}/NuevaNovedad`, {})
  }
  verNovedad(desde?: string, hasta?: string): Observable<Novedad[]>{
    let query = '';
    if (desde && hasta) {
      query = `?desde=${desde}&hasta=${hasta}`;
    }
    return this.http.get<Novedad[]>(`${this.appUrl}${this.apiUrl}/ObtenerNovedad${query}`)
  }
  verNovedadHistorico(): Observable<NovedadHistorico[]>{
    return this.http.get<NovedadHistorico[]>(`${this.appUrl}${this.apiUrl}/ObtenerHistorico`)
  }
  actualizaHora(id: number, horas: string): Observable<Novedad>{
    return this.http.put<Novedad>(`${this.appUrl}${this.apiUrl}/editarNovedadHora`, {id, horas})
  }
  actualizaEstado(id: number, aceptacion: boolean| null): Observable<Novedad>{
    return this.http.put<Novedad>(`${this.appUrl}${this.apiUrl}/editarNovedadEstado`, {id, aceptacion})
  }
  aceptar(): Observable<Novedad> {
    return this.http.post<Novedad>(`${this.appUrl}${this.apiUrl}/aceptacion` ,{})
  }
  errorNovedad(Cid: string): Observable<NovedadHistorico>{    
    return this.http.put<NovedadHistorico>(`${this.appUrl}${this.apiUrl}/revisar`, {Cid})
  }
  
}
