import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Hora } from '../interfaces/hora';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private appUrl : string;
  private apiUrl : string;
  private uploadUrl : string;

  constructor(private http: HttpClient) {
    this.appUrl = environment.apiUrl;
    this.apiUrl = 'api/horario';
    this.uploadUrl = `${this.appUrl}${this.apiUrl}/subirData`;
  }

  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('xml', file, file.name);
    console.log('Archivo a subir:', formData.get('file'));
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    const req = new HttpRequest('POST', this.uploadUrl, formData, {
      headers: headers,
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }
}