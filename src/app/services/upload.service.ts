import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable , catchError, throwError} from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Hora } from '../interfaces/hora';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private appUrl : string;
  private apiUrl : string;
  private uploadUrl : string;
  private uploadConcatUrl: string;

  constructor(private http: HttpClient) {
    this.appUrl = environment.apiUrl;
    this.apiUrl = 'api/horario';
    this.uploadUrl = `${this.appUrl}/${this.apiUrl}/subirData`;
    this.uploadConcatUrl = `${this.appUrl}/${this.apiUrl}/concatenar`
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
  uploadFiles(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file); // 'files' debe coincidir con el nombre esperado en el backend
    });

    const headers = new HttpHeaders();
    headers.append('Accept', 'application/xml'); // Aceptar respuesta en formato XML

    return this.http.post(this.uploadConcatUrl, formData, {
      headers,
      responseType: 'blob', // Esperamos un archivo binario (XML) como respuesta
    });
  }
}