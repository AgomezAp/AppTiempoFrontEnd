import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CertificadoResponse } from '../interfaces/certificado';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CertificadoService {
  private apiUrl = `${environment.apiUrl}/api/certificados`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Generar certificado en formato JSON
  generarCertificado(uid: number): Observable<CertificadoResponse> {
    return this.http.get<CertificadoResponse>(`${this.apiUrl}/${uid}`, {
      headers: this.getHeaders()
    });
  }

  // Abrir certificado en formato HTML en nueva ventana (vista previa)
  abrirCertificadoHTML(uid: number): void {
    const token = localStorage.getItem('token');
    const url = `${this.apiUrl}/${uid}/html`;
    
    // Crear una nueva ventana con el certificado
    const ventana = window.open('', '_blank');
    
    if (ventana) {
      // Hacer fetch con autenticación
      fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.text())
      .then(html => {
        ventana.document.write(html);
        ventana.document.close();
      })
      .catch(error => {
        console.error('Error al cargar certificado:', error);
        ventana.close();
      });
    }
  }

  // Descargar certificado como IMAGEN PNG (seguro y no editable)
  descargarCertificadoImagen(uid: number): void {
    const token = localStorage.getItem('token');
    const url = `${this.apiUrl}/${uid}/imagen`;
    
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado_laboral_${uid}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Error al descargar certificado:', error);
      alert('Error al descargar el certificado');
    });
  }

  // Descargar certificado como PDF (requiere librería adicional en backend o frontend)
  descargarCertificadoPDF(uid: number): void {
    // Ahora descarga como imagen PNG en lugar de abrir HTML
    this.descargarCertificadoImagen(uid);
  }
}
