import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
import {
  UResponse,
  User,
} from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private appUrl : string;
  private apiUrl : string;
  constructor(private http:HttpClient) { 
    this.appUrl= environment.apiUrl
    this.apiUrl = '/api/user'
  }
  signIn(user :User):Observable<any>{
    return this.http.post(`${this.appUrl}${this.apiUrl}/register`,user)
  }
  logIn(user :User):Observable<string>{
    return this.http.post<string>(`${this.appUrl}${this.apiUrl}/login`,user)
  }
  resetPassword(data: { email: string, newPassword: string }): Observable<string> {
    return this.http.patch<string>(`${this.appUrl}${this.apiUrl}/reset-password`, data);
  }
  
  getAllUsers(): Observable<UResponse[]> {
    return this.http.get<UResponse[]>(`${this.appUrl}${this.apiUrl}/AllUsers`);
  }

  getListUser(): Observable<any[]> {
    return this.http.get<any[]>(`${this.appUrl}${this.apiUrl}/ListUsers`)
  }

  deleteUserById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.appUrl}${this.apiUrl}/delete/${id}`);
  }

  updateUser(id: number, user: any): Observable<any> {
    return this.http.put<any>(`${this.appUrl}${this.apiUrl}/editarUsuario/${id}`, user);
  }

  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.appUrl}${this.apiUrl}/search?query=${encodeURIComponent(query)}`);
  }
}
