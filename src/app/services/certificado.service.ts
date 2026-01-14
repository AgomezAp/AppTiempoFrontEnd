import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CertificadoResponse } from '../interfaces/certificado';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CertificadoService {
  private apiUrl = `${environment.apiUrl}/api/certificados`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Generar certificado en formato JSON
  generarCertificado(uid: number): Observable<CertificadoResponse> {
    return this.http.get<CertificadoResponse>(`${this.apiUrl}/${uid}`, {
      headers: this.getHeaders(),
    });
  }

  // Abrir certificado en formato HTML en nueva ventana (vista previa)
  abrirCertificadoHTML(uid: number): void {
    const token = localStorage.getItem('token');
    const url = `${this.apiUrl}/${uid}/html`;

    const ventana = window.open('', '_blank');

    if (ventana) {
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.text())
        .then((html) => {
          ventana.document.write(html);
          ventana.document.close();
        })
        .catch((error) => {
          console.error('Error al cargar certificado:', error);
          ventana.close();
        });
    }
  }

  // ✅ CORREGIDO: Descargar certificado como PDF
  descargarCertificadoImagen(uid: number): void {
    const token = localStorage.getItem('token');
    const url = `${this.apiUrl}/${uid}/imagen`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // ✅ CAMBIO: .png → .pdf
        a.download = `certificado_laboral_${uid}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((error) => {
        console.error('Error al descargar certificado:', error);
        alert('Error al descargar el certificado');
      });
  }

  // Descargar certificado como PDF
  descargarCertificadoPDF(uid: number): void {
    this.descargarCertificadoImagen(uid);
  }
}
