import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { NavbarComponent } from '../navbar/navbar.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { AsistenciaService } from '../../services/asistencia.service';
import { UserService } from '../../services/user.service';
import { RegistroAsistencia, ParticipanteAsistencia, ParticipanteExterno } from '../../interfaces/asistencia';
import { UResponse } from '../../interfaces/user';

@Component({
  selector: 'app-registro-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SpinnerComponent],
  templateUrl: './registro-asistencia.component.html',
  styleUrl: './registro-asistencia.component.css',
})
export class RegistroAsistenciaComponent implements OnInit {
  loading = false;
  activeTab: 'crear' | 'lista' = 'lista';

  // Para crear registro
  usuarios: UResponse[] = [];
  fechaEvento: string = '';
  tema: string = '';
  facilitadorId: number | string | null = null;
  // Campos para facilitador externo
  facilitadorExternoNombre: string = '';
  facilitadorExternoEmpresa: string = '';
  participantesSeleccionados: number[] = [];
  searchTerm: string = '';
  filteredUsuarios: UResponse[] = [];

  // Participantes externos
  participantesExternos: ParticipanteExterno[] = [];
  nuevoExterno: ParticipanteExterno = {
    nombreCompleto: '',
    documentoIdentificacion: '',
    cargo: '',
    empresa: '',
    email: '',
  };

  // Lista de registros
  registros: RegistroAsistencia[] = [];
  registroDetalle: RegistroAsistencia | null = null;

  constructor(
    private asistenciaService: AsistenciaService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRegistros();
    this.setFechaHoy();
  }

  setFechaHoy(): void {
    const today = new Date();
    this.fechaEvento = today.toISOString().split('T')[0];
  }

  cargarUsuarios(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.usuarios = data.filter(u => u.status === 1);
        this.filteredUsuarios = [...this.usuarios];
      },
      error: () => {
        this.toastr.error('Error al cargar usuarios', 'Error');
      },
    });
  }

  cargarRegistros(): void {
    this.loading = true;
    this.asistenciaService.obtenerRegistros().subscribe({
      next: (data) => {
        this.registros = data;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Error al cargar registros', 'Error');
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredUsuarios = [...this.usuarios];
    } else {
      this.filteredUsuarios = this.usuarios.filter(
        (user) =>
          user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  toggleParticipante(userId: number): void {
    const index = this.participantesSeleccionados.indexOf(userId);
    if (index === -1) {
      this.participantesSeleccionados.push(userId);
    } else {
      this.participantesSeleccionados.splice(index, 1);
    }
  }

  isSelected(userId: number): boolean {
    return this.participantesSeleccionados.includes(userId);
  }

  seleccionarTodos(): void {
    this.participantesSeleccionados = this.filteredUsuarios.map((u) => u.Uid!);
  }

  deseleccionarTodos(): void {
    this.participantesSeleccionados = [];
  }

  getUsuarioNombre(userId: number): string {
    const user = this.usuarios.find((u) => u.Uid === userId);
    return user ? `${user.name} ${user.lastName}` : '';
  }

  getFacilitadorNombre(): string {
    if (!this.facilitadorId) return '';
    if (this.facilitadorId === 'EXTERNO') {
      return this.facilitadorExternoNombre || '';
    }
    const idNum = typeof this.facilitadorId === 'string' ? parseInt(this.facilitadorId, 10) : this.facilitadorId;
    if (!idNum || isNaN(Number(idNum))) return '';
    return this.getUsuarioNombre(Number(idNum));
  }

  crearRegistro(): void {
    if (!this.fechaEvento) {
      this.toastr.error('La fecha es requerida', 'Error');
      return;
    }
    if (!this.tema.trim()) {
      this.toastr.error('El tema es requerido', 'Error');
      return;
    }
    if (!this.facilitadorId) {
      this.toastr.error('Debe seleccionar un facilitador', 'Error');
      return;
    }
    // Si se eligió facilitador externo, validar campos
    if (this.facilitadorId === 'EXTERNO') {
      if (!this.facilitadorExternoNombre.trim()) {
        this.toastr.error('El nombre del facilitador externo es requerido', 'Error');
        return;
      }
      if (!this.facilitadorExternoEmpresa.trim()) {
        this.toastr.error('La empresa/entidad del facilitador externo es requerida', 'Error');
        return;
      }
    }
    if (this.participantesSeleccionados.length === 0 && this.participantesExternos.length === 0) {
      this.toastr.error('Debe agregar al menos un participante (interno o externo)', 'Error');
      return;
    }

    const htmlParts: string[] = [];
    htmlParts.push(`<p><strong>Fecha:</strong> ${this.fechaEvento}</p>`);
    htmlParts.push(`<p><strong>Tema:</strong> ${this.tema}</p>`);
    htmlParts.push(`<p><strong>Facilitador:</strong> ${this.getFacilitadorNombre()}</p>`);
    if (this.participantesSeleccionados.length > 0) {
      htmlParts.push(`<p>Se enviará correo a <strong>${this.participantesSeleccionados.length}</strong> participante(s) interno(s).</p>`);
    }
    if (this.participantesExternos.length > 0) {
      htmlParts.push(`<p>Se registrarán <strong>${this.participantesExternos.length}</strong> participante(s) externo(s) (sin correo).</p>`);
    }

    Swal.fire({
      title: '¿Crear registro de asistencia?',
      html: htmlParts.join(''),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FFD600',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, crear y enviar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.asistenciaService
          .crearRegistro({
            fecha: this.fechaEvento,
            tema: this.tema,
            facilitadorId: this.facilitadorId === 'EXTERNO' ? undefined : this.facilitadorId,
            facilitadorExternoNombre: this.facilitadorId === 'EXTERNO' ? this.facilitadorExternoNombre : undefined,
            facilitadorExternoEmpresa: this.facilitadorId === 'EXTERNO' ? this.facilitadorExternoEmpresa : undefined,
            participantesIds: this.participantesSeleccionados,
            participantesExternos: this.participantesExternos.length > 0
              ? this.participantesExternos
              : undefined,
          })
          .subscribe({
            next: (response) => {
              this.toastr.success('Registro creado exitosamente', 'Éxito');
              this.limpiarFormulario();
              this.cargarRegistros();
              this.activeTab = 'lista';
              this.loading = false;
            },
            error: (err) => {
              this.toastr.error(err.error?.msg || 'Error al crear registro', 'Error');
              this.loading = false;
            },
          });
      }
    });
  }

  limpiarFormulario(): void {
    this.setFechaHoy();
    this.tema = '';
    this.facilitadorId = null;
    this.participantesSeleccionados = [];
    this.participantesExternos = [];
    this.nuevoExterno = {
      nombreCompleto: '',
      documentoIdentificacion: '',
      cargo: '',
      empresa: '',
      email: '',
    };
    this.searchTerm = '';
    this.filteredUsuarios = [...this.usuarios];
  }

  verDetalle(registro: RegistroAsistencia): void {
    this.registroDetalle = registro;
  }

  cerrarDetalle(): void {
    this.registroDetalle = null;
  }

  getEstadoBadgeClass(estado: string | undefined): string {
    switch (estado) {
      case 'completado':
        return 'badge-success';
      case 'en_proceso':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  }

  getEstadoTexto(estado: string | undefined): string {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'en_proceso':
        return 'En Proceso';
      default:
        return 'Pendiente';
    }
  }

  getFirmadosCount(participantes: ParticipanteAsistencia[] | undefined): number {
    if (!participantes) return 0;
    return participantes.filter((p) => p.firmado && !p.anulado).length;
  }

  getActivosCount(participantes: ParticipanteAsistencia[] | undefined): number {
    if (!participantes) return 0;
    return participantes.filter((p) => !p.cancelado).length;
  }

  descargarPDF(registro: RegistroAsistencia, empresa: string): void {
    this.loading = true;
    this.asistenciaService.descargarPDF(registro.id!, empresa).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `acta_asistencia_${empresa}_${registro.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.msg || 'Error al descargar PDF', 'Error');
        this.loading = false;
      },
    });
  }

  reenviarCorreo(participante: ParticipanteAsistencia): void {
    Swal.fire({
      title: '¿Reenviar correo?',
      text: `Se reenviará el correo de firma a ${participante.nombreCompleto}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FFD600',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, reenviar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.asistenciaService.reenviarCorreoFirma(participante.id!).subscribe({
          next: () => {
            this.toastr.success('Correo reenviado exitosamente', 'Éxito');
          },
          error: (err) => {
            this.toastr.error(err.error?.msg || 'Error al reenviar correo', 'Error');
          },
        });
      }
    });
  }

  eliminarRegistro(registro: RegistroAsistencia): void {
    Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.asistenciaService.eliminarRegistro(registro.id!).subscribe({
          next: () => {
            this.toastr.success('Registro eliminado', 'Éxito');
            this.cargarRegistros();
            this.cerrarDetalle();
          },
          error: (err) => {
            this.toastr.error(err.error?.msg || 'Error al eliminar', 'Error');
            this.loading = false;
          },
        });
      }
    });
  }

  getEmpresaNombre(empresa: string): string {
    switch (empresa) {
      case 'AP':
        return 'Andrés Publicidad';
      case 'AT':
        return 'Andrés Tobón';
      case 'ME':
        return 'María Evangelina';
      default:
        return empresa;
    }
  }

  getEmpresasEnRegistro(participantes: ParticipanteAsistencia[] | undefined): string[] {
    if (!participantes) return [];
    const empresas = new Set(participantes.map((p) => p.empresa));
    return Array.from(empresas);
  }

  // === Participantes Externos ===

  agregarExterno(): void {
    if (!this.nuevoExterno.nombreCompleto.trim()) {
      this.toastr.error('El nombre completo es requerido', 'Error');
      return;
    }
    if (!this.nuevoExterno.documentoIdentificacion.trim()) {
      this.toastr.error('El documento de identificación es requerido', 'Error');
      return;
    }
    if (!this.nuevoExterno.cargo.trim()) {
      this.toastr.error('El cargo es requerido', 'Error');
      return;
    }
    if (!this.nuevoExterno.empresa.trim()) {
      this.toastr.error('La empresa/entidad es requerida', 'Error');
      return;
    }

    this.participantesExternos.push({ ...this.nuevoExterno });
    this.nuevoExterno = {
      nombreCompleto: '',
      documentoIdentificacion: '',
      cargo: '',
      empresa: '',
      email: '',
    };
    this.toastr.success('Participante externo agregado', 'OK');
  }

  eliminarExterno(index: number): void {
    this.participantesExternos.splice(index, 1);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date + 'T12:00:00').toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  cancelarToken(participante: ParticipanteAsistencia): void {
    Swal.fire({
      title: '¿Cancelar firma?',
      html: `Se cancelará el enlace de firma de <strong>${participante.nombreCompleto}</strong>. Esta persona no podrá firmar.`,
      input: 'text',
      inputLabel: 'Motivo de cancelación (opcional)',
      inputPlaceholder: 'Ej: Se retiró de la empresa...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar firma',
      cancelButtonText: 'No, volver',
    }).then((result) => {
      if (result.isConfirmed) {
        this.asistenciaService.cancelarToken(participante.id!, result.value || undefined).subscribe({
          next: () => {
            this.toastr.success('Token de firma cancelado', 'Éxito');
            this.cargarRegistros();
            if (this.registroDetalle) {
              this.asistenciaService.obtenerRegistroPorId(this.registroDetalle.id!).subscribe({
                next: (reg) => this.registroDetalle = reg,
              });
            }
          },
          error: (err) => {
            this.toastr.error(err.error?.msg || 'Error al cancelar token', 'Error');
          },
        });
      }
    });
  }

  anularFirma(participante: ParticipanteAsistencia): void {
    Swal.fire({
      title: '¿Anular firma?',
      html: `Se anulará la firma de <strong>${participante.nombreCompleto}</strong>. La firma registrada será eliminada.`,
      input: 'text',
      inputLabel: 'Motivo de anulación (opcional)',
      inputPlaceholder: 'Ej: Firma incorrecta, se retiró...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, anular firma',
      cancelButtonText: 'No, volver',
    }).then((result) => {
      if (result.isConfirmed) {
        this.asistenciaService.anularFirma(participante.id!, result.value || undefined).subscribe({
          next: () => {
            this.toastr.success('Firma anulada exitosamente', 'Éxito');
            this.cargarRegistros();
            if (this.registroDetalle) {
              this.asistenciaService.obtenerRegistroPorId(this.registroDetalle.id!).subscribe({
                next: (reg) => this.registroDetalle = reg,
              });
            }
          },
          error: (err) => {
            this.toastr.error(err.error?.msg || 'Error al anular firma', 'Error');
          },
        });
      }
    });
  }
}
