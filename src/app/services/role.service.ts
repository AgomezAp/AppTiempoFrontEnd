import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { Role } from '../interfaces/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
    private appUrl : string;
    private apiUrl : string;
    constructor(private http:HttpClient) { 
        this.appUrl= environment.apiUrl
        this.apiUrl = '/api/rol'
    }

    getRoleS():Observable<Role[]>{
      console.log(`${this.appUrl}${this.apiUrl}/lectura`)
       return this.http.get<Role[]>(`${this.appUrl}${this.apiUrl}/lectura`)
    }
}
