import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { Hora } from '../interfaces/hora';

@Injectable({
  providedIn: 'root'
})
export class HoraService {
  private appUrl: string;
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.appUrl = environment.apiHoras;
    this.apiUrl = 'api/horas';
  }

  getHoras(): Observable<Hora[]> {
    return this.http.get<Hora[]>(`${this.appUrl}${this.apiUrl}`);
  }
}