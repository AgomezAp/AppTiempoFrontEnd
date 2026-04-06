import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HorarioUsuario } from '../interfaces/horario-usuario';

@Injectable({
  providedIn: 'root'
})
export class HorarioUsuarioService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/api/horario-usuario`;
  }

  getHorarioUsuario(uid: number): Observable<HorarioUsuario[]> {
    return this.http.get<HorarioUsuario[]>(`${this.baseUrl}/${uid}`);
  }

  updateHorarioUsuario(uid: number, horarios: HorarioUsuario[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/${uid}`, { horarios });
  }

  inicializarHorariosGlobal(): Observable<any> {
    return this.http.post(`${this.baseUrl}/inicializar`, {});
  }
}
