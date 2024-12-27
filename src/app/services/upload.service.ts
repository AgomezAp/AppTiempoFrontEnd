import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private uploadUrl = '/api/upload-xml';  // La URL de tu API para subir archivos

  constructor(private http: HttpClient) {}

  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

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