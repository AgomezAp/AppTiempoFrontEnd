import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  private appUrl = environment.apiUrl;
  private apiUrl = '/api/whatsapp';

  constructor(private http: HttpClient) {}

  inicializar() {
    return this.http.post<{ msg: string; status: string; error?: string }>(`${this.appUrl}${this.apiUrl}/inicializar`, {});
  }

  obtenerEstado() {
    return this.http.get<{ status: string; qr: string | null; error?: string | null }>(`${this.appUrl}${this.apiUrl}/estado`);
  }

  desconectar() {
    return this.http.post<{ msg: string }>(`${this.appUrl}${this.apiUrl}/desconectar`, {});
  }

  enviarMensaje(telefono: string, mensaje: string) {
    return this.http.post<{ msg: string }>(`${this.appUrl}${this.apiUrl}/enviar`, { telefono, mensaje });
  }

  notificarCapacitacion(capacitacionId: number, mensaje?: string) {
    return this.http.post<{ msg: string; sent: number; failed: number; errors: string[] }>(
      `${this.appUrl}${this.apiUrl}/notificar-capacitacion`, { capacitacionId, mensaje }
    );
  }

  enviarMensajeMasivo(mensaje: string, empresa?: string) {
    return this.http.post<{ msg: string; sent: number; failed: number; errors: string[] }>(
      `${this.appUrl}${this.apiUrl}/enviar-masivo`, { mensaje, empresa }
    );
  }

  getSSEUrl(): string {
    const token = localStorage.getItem('token');
    return `${this.appUrl}${this.apiUrl}/sse?token=${encodeURIComponent(token || '')}`;
  }
}
