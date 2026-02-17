import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { NavbarComponent } from '../navbar/navbar.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { AsistenciaService } from '../../services/asistencia.service';
import { UserService } from '../../services/user.service';
import { RegistroAsistencia, ParticipanteAsistencia } from '../../interfaces/asistencia';
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
  facilitadorId: number | null = null;
  participantesSeleccionados: number[] = [];
  searchTerm: string = '';
  filteredUsuarios: UResponse[] = [];

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
    return this.getUsuarioNombre(this.facilitadorId);
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
    if (this.participantesSeleccionados.length === 0) {
      this.toastr.error('Debe seleccionar al menos un participante', 'Error');
      return;
    }

    Swal.fire({
      title: '¿Crear registro de asistencia?',
      html: `
        <p>Se enviará un correo a <strong>${this.participantesSeleccionados.length}</strong> participante(s) para que firmen.</p>
        <p><strong>Fecha:</strong> ${this.fechaEvento}</p>
        <p><strong>Tema:</strong> ${this.tema}</p>
        <p><strong>Facilitador:</strong> ${this.getFacilitadorNombre()}</p>
      `,
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
            facilitadorId: this.facilitadorId!,
            participantesIds: this.participantesSeleccionados,
          })
          .subscribe({
            next: (response) => {
              this.toastr.success('Registro creado y correos enviados', 'Éxito');
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
    return participantes.filter((p) => p.firmado).length;
  }

  descargarPDF(registro: RegistroAsistencia, empresa: 'AP' | 'AT' | 'ME'): void {
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

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date + 'T12:00:00').toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
