import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { Area } from '../interfaces/area';

@Injectable({
  providedIn: 'root'
})
export class AreaService {
private appUrl : string;
    private apiUrl : string;
    constructor(private http:HttpClient) { 
        this.appUrl= environment.apiUrl
        this.apiUrl = 'api/area'
    }

    GetArea():Observable<Area[]>{
      return this.http.get<Area[]>(`${this.appUrl}${this.apiUrl}/traerAreas`)
    }
}
