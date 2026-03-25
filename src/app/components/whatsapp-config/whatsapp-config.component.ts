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

  // Tab activa
  tabActiva: 'individual' | 'masivo' | 'programar' | 'historial' = 'individual';

  // Mensaje individual
  busquedaUsuario = '';
  usuariosSeleccionados: any[] = [];
  mensajeIndividual = '';
  archivoIndividual: File | null = null;
  archivoIndividualNombre = '';

  // Mensaje masivo
  empresaMasivo = '';
  mensajeMasivo = '';
  archivoMasivo: File | null = null;
  archivoMasivoNombre = '';

  // Programar mensaje
  busquedaProgramar = '';
  usuariosProgramados: any[] = [];
  mensajeProgramado = '';
  fechaProgramada = '';
  horaProgramada = '';
  archivoProgramado: File | null = null;
  archivoProgramadoNombre = '';

  // Historial programados
  mensajesProgramados: any[] = [];

  // Usuarios
  usuarios: any[] = [];

  // Seleccionar todos
  todosSeleccionados = false;
  todosProgramadosSeleccionados = false;

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

  cargarProgramados(): void {
    this.whatsappService.obtenerProgramados().subscribe({
      next: (data) => { this.mensajesProgramados = data; },
      error: () => {}
    });
  }

  verificarEstado(): void {
    this.whatsappService.obtenerEstado().subscribe({
      next: (data) => {
        this.status = data.status;
        this.qrCode = data.qr;
        this.estadoError = data.error || null;
        if (data.status === 'qr_pending' || data.status === 'loading') {
          this.iniciarSSE();
        }
      },
      error: () => {}
    });
  }

  conectar(): void {
    this.loading = true;
    this.whatsappService.inicializar().subscribe({
      next: (data) => {
        this.status = data.status;
        this.estadoError = data.error || null;
        this.loading = false;
        this.iniciarSSE();
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('Error', err?.error?.msg || 'No se pudo inicializar WhatsApp', 'error');
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
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      this.ngZone.run(() => {
        const data = JSON.parse(event.data);
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
            Swal.fire('Error', this.estadoError || 'Error', 'error');
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

    this.eventSource.onerror = () => {
      this.ngZone.run(() => {
        this.cerrarSSE();
        if (this.status === 'loading' || this.status === 'qr_pending') {
          this.status = 'disconnected';
          this.loading = false;
          Swal.fire('Error de conexión', 'Se perdió la conexión con el servidor.', 'error');
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

  // === Selección de usuarios ===
  usuariosFiltrados(): any[] {
    const q = this.busquedaUsuario.toLowerCase();
    return this.usuarios.filter((u: any) =>
      u.celular && (
        !q ||
        (u.nombre || '').toLowerCase().includes(q) ||
        (u.celular || '').includes(q)
      )
    );
  }

  usuariosFiltradosProgramar(): any[] {
    const q = this.busquedaProgramar.toLowerCase();
    return this.usuarios.filter((u: any) =>
      u.celular && (
        !q ||
        (u.nombre || '').toLowerCase().includes(q) ||
        (u.celular || '').includes(q)
      )
    );
  }

  esSeleccionado(u: any): boolean {
    return this.usuariosSeleccionados.some((s: any) => s.Uid === u.Uid);
  }

  esProgramadoSeleccionado(u: any): boolean {
    return this.usuariosProgramados.some((s: any) => s.Uid === u.Uid);
  }

  toggleUsuario(u: any): void {
    if (this.esSeleccionado(u)) {
      this.usuariosSeleccionados = this.usuariosSeleccionados.filter((s: any) => s.Uid !== u.Uid);
    } else {
      this.usuariosSeleccionados = [...this.usuariosSeleccionados, u];
    }
    this.todosSeleccionados = this.usuariosSeleccionados.length === this.usuariosFiltrados().length;
  }

  toggleUsuarioProgramado(u: any): void {
    if (this.esProgramadoSeleccionado(u)) {
      this.usuariosProgramados = this.usuariosProgramados.filter((s: any) => s.Uid !== u.Uid);
    } else {
      this.usuariosProgramados = [...this.usuariosProgramados, u];
    }
    this.todosProgramadosSeleccionados = this.usuariosProgramados.length === this.usuariosFiltradosProgramar().length;
  }

  toggleTodos(): void {
    if (this.todosSeleccionados) {
      this.usuariosSeleccionados = [];
      this.todosSeleccionados = false;
    } else {
      this.usuariosSeleccionados = [...this.usuariosFiltrados()];
      this.todosSeleccionados = true;
    }
  }

  toggleTodosProgramados(): void {
    if (this.todosProgramadosSeleccionados) {
      this.usuariosProgramados = [];
      this.todosProgramadosSeleccionados = false;
    } else {
      this.usuariosProgramados = [...this.usuariosFiltradosProgramar()];
      this.todosProgramadosSeleccionados = true;
    }
  }

  // === Archivos ===
  onArchivoIndividual(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.archivoIndividual = input.files[0];
      this.archivoIndividualNombre = input.files[0].name;
    }
  }

  quitarArchivoIndividual(): void {
    this.archivoIndividual = null;
    this.archivoIndividualNombre = '';
  }

  onArchivoMasivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.archivoMasivo = input.files[0];
      this.archivoMasivoNombre = input.files[0].name;
    }
  }

  quitarArchivoMasivo(): void {
    this.archivoMasivo = null;
    this.archivoMasivoNombre = '';
  }

  onArchivoProgramado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.archivoProgramado = input.files[0];
      this.archivoProgramadoNombre = input.files[0].name;
    }
  }

  quitarArchivoProgramado(): void {
    this.archivoProgramado = null;
    this.archivoProgramadoNombre = '';
  }

  // === Enviar mensaje individual ===
  enviarMensajeIndividual(): void {
    if (this.usuariosSeleccionados.length === 0 || !this.mensajeIndividual.trim()) {
      Swal.fire('Error', 'Seleccione al menos un destinatario y escriba el mensaje', 'warning');
      return;
    }

    const telefonos = this.usuariosSeleccionados.map((u: any) => u.celular);
    const nombres = this.usuariosSeleccionados.map((u: any) => u.nombre).join(', ');

    Swal.fire({
      title: '¿Enviar mensaje?',
      html: `<b>Destinatarios:</b> ${nombres}<br><b>Archivo:</b> ${this.archivoIndividualNombre || 'Ninguno'}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (!r.isConfirmed) return;

      this.loading = true;

      if (this.archivoIndividual) {
        this.whatsappService.enviarConMedia(telefonos, this.mensajeIndividual, this.archivoIndividual).subscribe({
          next: (res) => {
            this.loading = false;
            Swal.fire('Resultado', res.msg, res.failed > 0 ? 'warning' : 'success');
            this.limpiarIndividual();
          },
          error: (err) => {
            this.loading = false;
            Swal.fire('Error', err.error?.msg || 'Error al enviar', 'error');
          }
        });
      } else {
        const envios = telefonos.map((tel: string) =>
          this.whatsappService.enviarMensaje(tel, this.mensajeIndividual).toPromise()
        );

        Promise.allSettled(envios).then((resultados) => {
          this.loading = false;
          const fallidos = resultados.filter(r => r.status === 'rejected').length;
          if (fallidos === 0) {
            Swal.fire('Enviado', `Mensaje enviado a ${resultados.length} destinatario(s)`, 'success');
          } else {
            Swal.fire('Advertencia', `${resultados.length - fallidos} enviado(s), ${fallidos} fallido(s)`, 'warning');
          }
          this.limpiarIndividual();
        });
      }
    });
  }

  limpiarIndividual(): void {
    this.usuariosSeleccionados = [];
    this.mensajeIndividual = '';
    this.busquedaUsuario = '';
    this.archivoIndividual = null;
    this.archivoIndividualNombre = '';
    this.todosSeleccionados = false;
  }

  // === Enviar masivo ===
  enviarMasivo(): void {
    if (!this.mensajeMasivo.trim()) {
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
            this.archivoMasivo = null;
            this.archivoMasivoNombre = '';
          },
          error: (err) => {
            this.loading = false;
            Swal.fire('Error', err.error?.msg || 'Error al enviar', 'error');
          }
        });
      }
    });
  }

  // === Programar mensaje ===
  programarMensaje(): void {
    if (this.usuariosProgramados.length === 0 || !this.mensajeProgramado.trim() || !this.fechaProgramada || !this.horaProgramada) {
      Swal.fire('Error', 'Complete todos los campos: destinatarios, mensaje, fecha y hora', 'warning');
      return;
    }

    const fechaEnvio = `${this.fechaProgramada}T${this.horaProgramada}`;
    const fechaObj = new Date(fechaEnvio);
    if (fechaObj <= new Date()) {
      Swal.fire('Error', 'La fecha y hora deben ser futuras', 'warning');
      return;
    }

    const telefonos = this.usuariosProgramados.map((u: any) => u.celular);
    const nombres = this.usuariosProgramados.map((u: any) => u.nombre).join(', ');

    Swal.fire({
      title: '¿Programar mensaje?',
      html: `<b>Destinatarios:</b> ${nombres}<br><b>Fecha:</b> ${this.fechaProgramada} a las ${this.horaProgramada}<br><b>Archivo:</b> ${this.archivoProgramadoNombre || 'Ninguno'}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Programar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (!r.isConfirmed) return;

      this.loading = true;
      this.whatsappService.programarMensaje(
        telefonos, this.mensajeProgramado, fechaEnvio, this.archivoProgramado || undefined
      ).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire('Programado', 'Mensaje programado correctamente', 'success');
          this.limpiarProgramado();
          this.cargarProgramados();
        },
        error: (err) => {
          this.loading = false;
          Swal.fire('Error', err.error?.msg || 'Error al programar', 'error');
        }
      });
    });
  }

  limpiarProgramado(): void {
    this.usuariosProgramados = [];
    this.mensajeProgramado = '';
    this.fechaProgramada = '';
    this.horaProgramada = '';
    this.busquedaProgramar = '';
    this.archivoProgramado = null;
    this.archivoProgramadoNombre = '';
    this.todosProgramadosSeleccionados = false;
  }

  cancelarMensajeProgramado(id: string): void {
    Swal.fire({
      title: '¿Cancelar mensaje programado?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
      confirmButtonColor: '#d33',
    }).then((r) => {
      if (r.isConfirmed) {
        this.whatsappService.cancelarProgramado(id).subscribe({
          next: () => {
            Swal.fire('Cancelado', 'Mensaje programado cancelado', 'success');
            this.cargarProgramados();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.msg || 'No se pudo cancelar', 'error');
          }
        });
      }
    });
  }

  // === Cambio de tab ===
  cambiarTab(tab: 'individual' | 'masivo' | 'programar' | 'historial'): void {
    this.tabActiva = tab;
    if (tab === 'historial') {
      this.cargarProgramados();
    }
  }

  // === Helpers ===
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

  getEstadoBadge(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge-pending';
      case 'enviado': return 'badge-sent';
      case 'fallido': return 'badge-failed';
      case 'cancelado': return 'badge-cancelled';
      default: return '';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'enviado': return 'Enviado';
      case 'fallido': return 'Fallido';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  }

  getFechaMinima(): string {
    return new Date().toISOString().split('T')[0];
  }
}
