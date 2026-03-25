import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { WhatsappService } from '../../services/whatsapp.service';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-whatsapp-config',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './whatsapp-config.component.html',
  styleUrl: './whatsapp-config.component.css',
})
export class WhatsappConfigComponent implements OnInit, OnDestroy {
  status: string = 'disconnected';
  qrCode: string | null = null;
  estadoError: string | null = null;
  loading = false;
  eventSource: EventSource | null = null;

  // Mensaje individual
  busquedaUsuario = '';
  usuariosSeleccionados: any[] = [];
  mensajeIndividual = '';

  // Mensaje masivo
  empresaMasivo = '';
  mensajeMasivo = '';

  // Usuarios
  usuarios: any[] = [];

  constructor(
    private whatsappService: WhatsappService,
    private userService: UserService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.verificarEstado();
    this.cargarUsuarios();
  }

  ngOnDestroy(): void {
    this.cerrarSSE();
  }

  cargarUsuarios(): void {
    this.userService.getListUser().subscribe({
      next: (data: any) => { this.usuarios = data; },
      error: () => {}
    });
  }

  verificarEstado(): void {
    this.whatsappService.obtenerEstado().subscribe({
      next: (data) => {
        console.log('[WhatsApp] Estado recibido:', data);
        this.status = data.status;
        this.qrCode = data.qr;
        this.estadoError = data.error || null;
        // Si ya hay un QR pendiente o está cargando, iniciar SSE automáticamente
        if (data.status === 'qr_pending' || data.status === 'loading') {
          this.iniciarSSE();
        }
      },
      error: (err) => {
        console.error('[WhatsApp] Error verificando estado:', err);
      }
    });
  }

  conectar(): void {
    this.loading = true;
    console.log('[WhatsApp] Iniciando conexión...');
    this.whatsappService.inicializar().subscribe({
      next: (data) => {
        console.log('[WhatsApp] Respuesta inicializar:', data);
        this.status = data.status;
        this.estadoError = data.error || null;
        this.loading = false;
        this.iniciarSSE();
      },
      error: (err) => {
        console.error('[WhatsApp] Error inicializando:', err);
        this.loading = false;
        Swal.fire('Error', err?.error?.msg || err?.error?.error || 'No se pudo inicializar WhatsApp', 'error');
      }
    });
  }

  desconectar(): void {
    Swal.fire({
      title: '¿Desconectar WhatsApp?',
      text: 'Se cerrará la sesión actual',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Desconectar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    }).then((r) => {
      if (r.isConfirmed) {
        this.whatsappService.desconectar().subscribe({
          next: () => {
            this.status = 'disconnected';
            this.qrCode = null;
            this.cerrarSSE();
            Swal.fire('Desconectado', 'Sesión de WhatsApp cerrada', 'success');
          },
          error: () => { Swal.fire('Error', 'Error al desconectar', 'error'); }
        });
      }
    });
  }

  iniciarSSE(): void {
    this.cerrarSSE();

    const url = this.whatsappService.getSSEUrl();
    console.log('[WhatsApp] Conectando SSE...');

    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      // Ejecutar dentro de NgZone para que Angular detecte los cambios
      this.ngZone.run(() => {
        const data = JSON.parse(event.data);
        console.log('[WhatsApp] SSE evento:', data);

        switch (data.type) {
          case 'qr':
            this.status = 'qr_pending';
            this.qrCode = data.qr;
            this.estadoError = null;
            break;
          case 'ready':
            this.status = 'ready';
            this.qrCode = null;
            this.estadoError = null;
            Swal.fire('Conectado', 'WhatsApp vinculado exitosamente', 'success');
            break;
          case 'authenticated':
            this.status = 'loading';
            break;
          case 'error':
            this.status = 'disconnected';
            this.qrCode = null;
            this.estadoError = data.msg || 'Error inicializando WhatsApp';
            Swal.fire('Error', this.estadoError || 'Error inicializando WhatsApp', 'error');
            break;
          case 'disconnected':
          case 'auth_failure':
            this.status = 'disconnected';
            this.qrCode = null;
            this.estadoError = data.msg || data.reason || null;
            break;
          case 'status':
            this.status = data.status;
            this.qrCode = data.qr;
            this.estadoError = data.error || null;
            break;
        }
      });
    };

    this.eventSource.onerror = (err) => {
      console.error('[WhatsApp] SSE error:', err);
      this.ngZone.run(() => {
        this.cerrarSSE();
        // Solo mostrar alerta si estaba esperando QR
        if (this.status === 'loading' || this.status === 'qr_pending') {
          this.status = 'disconnected';
          this.loading = false;
          Swal.fire('Error de conexión', 'Se perdió la conexión con el servidor. Intente conectar nuevamente.', 'error');
        }
      });
    };
  }

  cerrarSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  usuariosFiltrados(): any[] {
    const q = this.busquedaUsuario.toLowerCase();
    return this.usuarios.filter((u: any) =>
      u.celular && (
        !q ||
        (u.nombre || '').toLowerCase().includes(q) ||
        (u.apellido || '').toLowerCase().includes(q) ||
        (u.celular || '').includes(q)
      )
    );
  }

  esSeleccionado(u: any): boolean {
    return this.usuariosSeleccionados.some((s: any) => s.id === u.id);
  }

  toggleUsuario(u: any): void {
    const idx = this.usuariosSeleccionados.findIndex((s: any) => s.id === u.id);
    if (idx >= 0) {
      this.usuariosSeleccionados.splice(idx, 1);
    } else {
      this.usuariosSeleccionados.push(u);
    }
  }

  enviarMensajeIndividual(): void {
    if (!this.usuariosSeleccionados.length || !this.mensajeIndividual) {
      Swal.fire('Error', 'Seleccione al menos un destinatario y escriba el mensaje', 'warning');
      return;
    }

    const telefonos = this.usuariosSeleccionados.map((u: any) => u.celular);
    const nombres = this.usuariosSeleccionados.map((u: any) => `${u.nombre} ${u.apellido}`).join(', ');

    Swal.fire({
      title: '¿Enviar mensaje?',
      text: `Se enviará a: ${nombres}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (!r.isConfirmed) return;

      this.loading = true;
      const envios = telefonos.map((tel: string) =>
        this.whatsappService.enviarMensaje(tel, this.mensajeIndividual).toPromise()
      );

      Promise.allSettled(envios).then((resultados) => {
        this.loading = false;
        const fallidos = resultados.filter(r => r.status === 'rejected').length;
        if (fallidos === 0) {
          Swal.fire('Enviado', 'Mensaje enviado a todos los destinatarios', 'success');
        } else {
          Swal.fire('Advertencia', `${resultados.length - fallidos} enviado(s), ${fallidos} fallido(s)`, 'warning');
        }
        this.usuariosSeleccionados = [];
        this.mensajeIndividual = '';
        this.busquedaUsuario = '';
      });
    });
  }

  enviarMasivo(): void {
    if (!this.mensajeMasivo) {
      Swal.fire('Error', 'El mensaje es requerido', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Enviar mensaje masivo?',
      text: `Se enviará a todos los usuarios ${this.empresaMasivo ? 'de ' + this.getEmpresaNombre(this.empresaMasivo) : ''} con celular registrado`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (r.isConfirmed) {
        this.loading = true;
        this.whatsappService.enviarMensajeMasivo(this.mensajeMasivo, this.empresaMasivo || undefined).subscribe({
          next: (res) => {
            this.loading = false;
            Swal.fire('Resultado', res.msg, res.failed > 0 ? 'warning' : 'success');
            this.mensajeMasivo = '';
          },
          error: (err) => {
            this.loading = false;
            Swal.fire('Error', err.error?.msg || 'Error al enviar', 'error');
          }
        });
      }
    });
  }

  getStatusLabel(): string {
    switch (this.status) {
      case 'ready': return 'Conectado';
      case 'qr_pending': return 'Esperando escaneo QR';
      case 'loading': return 'Cargando...';
      default: return 'Desconectado';
    }
  }

  getStatusClass(): string {
    switch (this.status) {
      case 'ready': return 'status-connected';
      case 'qr_pending': return 'status-pending';
      case 'loading': return 'status-loading';
      default: return 'status-disconnected';
    }
  }

  getEmpresaNombre(empresa: string): string {
    switch (empresa) {
      case 'AP': return 'Andrés Publicidad';
      case 'AT': return 'Andrés Tobón';
      case 'ME': return 'María Evangelina';
      default: return empresa || 'Todas';
    }
  }

  getUsuariosConCelular(): number {
    return this.usuarios.filter((u: any) => u.celular).length;
  }
}
