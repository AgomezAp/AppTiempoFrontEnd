import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { SsgtService } from '../../services/ssgt.service';
import { UserService } from '../../services/user.service';
import {
  AccidenteIncidente,
  CrearAccidenteRequest,
  CrearInvestigacionRequest,
  CrearSeguimientoRequest,
  FiltrosAccidente,
} from '../../interfaces/ssgt';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ssgt-accidentes',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './ssgt-accidentes.component.html',
  styleUrl: './ssgt-accidentes.component.css',
})
export class SsgtAccidentesComponent implements OnInit {
  accidentes: AccidenteIncidente[] = [];
  usuarios: any[] = [];
  loading = false;
  userId: number = 0;

  // Filtros
  filtros: FiltrosAccidente = {};

  // Formulario nuevo accidente
  mostrarFormulario = false;
  editandoId: number | null = null;
  nuevoAccidente: CrearAccidenteRequest = {
    fecha: '',
    hora: '',
    lugar: '',
    descripcion: '',
    tipoEvento: 'accidente',
    severidad: 'leve',
    reportadoPor: 0,
    empresa: '',
  };

  // Detalle
  accidenteSeleccionado: AccidenteIncidente | null = null;
  mostrarDetalle = false;

  // Investigacion
  mostrarInvestigacion = false;
  investigacion: CrearInvestigacionRequest = {
    responsableInvestigacion: 0,
    fechaInvestigacion: '',
    causasInmediatas: '',
    causasBasicas: '',
    accionesCorrectivas: '',
    conclusiones: '',
  };

  // Evidencias
  mostrarEvidencias = false;
  archivoEvidencia: File | null = null;
  tipoEvidencia: 'foto' | 'documento_medico' | 'formato_reporte' | 'otro' = 'otro';
  descripcionEvidencia = '';

  // Seguimiento
  mostrarSeguimiento = false;
  nuevoSeguimiento: CrearSeguimientoRequest = {
    descripcion: '',
    responsableId: 0,
    fechaLimite: '',
    observaciones: '',
  };

  constructor(
    private ssgtService: SsgtService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userId')) || 0;
    this.nuevoAccidente.reportadoPor = this.userId;
    this.cargarAccidentes();
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.userService.getListUser().subscribe({
      next: (users) => {
        this.usuarios = users;
      },
      error: () => {
        console.error('Error al cargar usuarios');
      },
    });
  }

  cargarAccidentes(): void {
    this.loading = true;
    this.ssgtService.obtenerAccidentes(this.filtros).subscribe({
      next: (data) => {
        this.accidentes = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'No se pudieron cargar los accidentes', 'error');
      },
    });
  }

  aplicarFiltros(): void {
    this.cargarAccidentes();
  }

  limpiarFiltros(): void {
    this.filtros = {};
    this.cargarAccidentes();
  }

  // ========================
  // CRUD
  // ========================

  abrirFormulario(accidente?: AccidenteIncidente): void {
    if (accidente) {
      this.editandoId = accidente.id!;
      this.nuevoAccidente = {
        fecha: accidente.fecha,
        hora: accidente.hora,
        lugar: accidente.lugar,
        descripcion: accidente.descripcion,
        tipoEvento: accidente.tipoEvento,
        severidad: accidente.severidad,
        tipoLesion: accidente.tipoLesion || undefined,
        parteAfectada: accidente.parteAfectada || undefined,
        testigos: accidente.testigos || undefined,
        diasIncapacidad: accidente.diasIncapacidad || undefined,
        reportadoPor: accidente.reportadoPor,
        empresa: accidente.empresa || '',
      };
    } else {
      this.editandoId = null;
      this.nuevoAccidente = {
        fecha: new Date().toISOString().split('T')[0],
        hora: '',
        lugar: '',
        descripcion: '',
        tipoEvento: 'accidente',
        severidad: 'leve',
        reportadoPor: this.userId,
        empresa: '',
      };
    }
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.editandoId = null;
  }

  guardarAccidente(): void {
    if (!this.nuevoAccidente.fecha || !this.nuevoAccidente.hora || !this.nuevoAccidente.lugar || !this.nuevoAccidente.descripcion) {
      Swal.fire('Error', 'Complete los campos obligatorios', 'warning');
      return;
    }

    if ((this.nuevoAccidente.severidad === 'grave' || this.nuevoAccidente.severidad === 'mortal') &&
        (!this.nuevoAccidente.tipoLesion || !this.nuevoAccidente.parteAfectada)) {
      Swal.fire('Error', 'Para eventos graves o mortales, tipo de lesión y parte afectada son obligatorios', 'warning');
      return;
    }

    if (this.editandoId) {
      this.ssgtService.actualizarAccidente(this.editandoId, this.nuevoAccidente).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'El reporte ha sido actualizado', 'success');
          this.cerrarFormulario();
          this.cargarAccidentes();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.msg || 'Error al actualizar', 'error');
        },
      });
    } else {
      this.ssgtService.crearAccidente(this.nuevoAccidente).subscribe({
        next: () => {
          Swal.fire('Creado', 'El reporte ha sido creado exitosamente', 'success');
          this.cerrarFormulario();
          this.cargarAccidentes();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.msg || 'Error al crear reporte', 'error');
        },
      });
    }
  }

  eliminarAccidente(id: number): void {
    Swal.fire({
      title: 'Confirmar eliminación',
      text: 'Se eliminarán también las investigaciones, evidencias y seguimientos asociados',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ssgtService.eliminarAccidente(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El reporte ha sido eliminado', 'success');
            this.cargarAccidentes();
            if (this.accidenteSeleccionado?.id === id) {
              this.cerrarDetalle();
            }
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el reporte', 'error');
          },
        });
      }
    });
  }

  // ========================
  // DETALLE
  // ========================

  verDetalle(id: number): void {
    this.loading = true;
    this.ssgtService.obtenerAccidentePorId(id).subscribe({
      next: (data) => {
        this.accidenteSeleccionado = data;
        this.mostrarDetalle = true;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar el detalle', 'error');
      },
    });
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.accidenteSeleccionado = null;
    this.mostrarInvestigacion = false;
    this.mostrarEvidencias = false;
    this.mostrarSeguimiento = false;
  }

  cambiarEstado(accidente: AccidenteIncidente, estado: 'reportado' | 'en_investigacion' | 'cerrado'): void {
    this.ssgtService.actualizarAccidente(accidente.id!, { estado }).subscribe({
      next: () => {
        accidente.estado = estado;
        Swal.fire('Actualizado', `Estado cambiado a "${estado.replace('_', ' ')}"`, 'success');
        this.cargarAccidentes();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
      },
    });
  }

  // ========================
  // INVESTIGACION
  // ========================

  abrirInvestigacion(): void {
    if (this.accidenteSeleccionado?.investigacion) {
      const inv = this.accidenteSeleccionado.investigacion;
      this.investigacion = {
        causasInmediatas: inv.causasInmediatas || '',
        causasBasicas: inv.causasBasicas || '',
        accionesCorrectivas: inv.accionesCorrectivas || '',
        responsableInvestigacion: inv.responsableInvestigacion,
        fechaInvestigacion: inv.fechaInvestigacion,
        conclusiones: inv.conclusiones || '',
      };
    } else {
      this.investigacion = {
        responsableInvestigacion: this.userId,
        fechaInvestigacion: new Date().toISOString().split('T')[0],
        causasInmediatas: '',
        causasBasicas: '',
        accionesCorrectivas: '',
        conclusiones: '',
      };
    }
    this.mostrarInvestigacion = true;
  }

  guardarInvestigacion(): void {
    if (!this.investigacion.responsableInvestigacion || !this.investigacion.fechaInvestigacion) {
      Swal.fire('Error', 'Responsable y fecha de investigación son requeridos', 'warning');
      return;
    }

    this.ssgtService.crearInvestigacion(this.accidenteSeleccionado!.id!, this.investigacion).subscribe({
      next: () => {
        Swal.fire('Guardado', 'Investigación guardada exitosamente', 'success');
        this.mostrarInvestigacion = false;
        this.verDetalle(this.accidenteSeleccionado!.id!);
      },
      error: (err) => {
        Swal.fire('Error', err.error?.msg || 'Error al guardar investigación', 'error');
      },
    });
  }

  // ========================
  // EVIDENCIAS
  // ========================

  abrirEvidencias(): void {
    this.mostrarEvidencias = true;
    this.archivoEvidencia = null;
    this.tipoEvidencia = 'otro';
    this.descripcionEvidencia = '';
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoEvidencia = input.files[0];
    }
  }

  subirEvidencia(): void {
    if (!this.archivoEvidencia) {
      Swal.fire('Error', 'Seleccione un archivo', 'warning');
      return;
    }

    this.ssgtService.subirEvidencia(
      this.accidenteSeleccionado!.id!,
      this.archivoEvidencia,
      this.tipoEvidencia,
      this.descripcionEvidencia
    ).subscribe({
      next: () => {
        Swal.fire('Subido', 'Evidencia subida exitosamente', 'success');
        this.archivoEvidencia = null;
        this.descripcionEvidencia = '';
        this.verDetalle(this.accidenteSeleccionado!.id!);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo subir la evidencia', 'error');
      },
    });
  }

  eliminarEvidencia(id: number): void {
    Swal.fire({
      title: 'Eliminar evidencia',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ssgtService.eliminarEvidencia(id).subscribe({
          next: () => {
            Swal.fire('Eliminada', 'Evidencia eliminada', 'success');
            this.verDetalle(this.accidenteSeleccionado!.id!);
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar', 'error');
          },
        });
      }
    });
  }

  // ========================
  // SEGUIMIENTO
  // ========================

  abrirSeguimiento(): void {
    this.nuevoSeguimiento = {
      descripcion: '',
      responsableId: 0,
      fechaLimite: '',
      observaciones: '',
    };
    this.mostrarSeguimiento = true;
  }

  guardarSeguimiento(): void {
    if (!this.nuevoSeguimiento.descripcion || !this.nuevoSeguimiento.responsableId || !this.nuevoSeguimiento.fechaLimite) {
      Swal.fire('Error', 'Descripción, responsable y fecha límite son requeridos', 'warning');
      return;
    }

    this.ssgtService.crearSeguimiento(this.accidenteSeleccionado!.id!, this.nuevoSeguimiento).subscribe({
      next: () => {
        Swal.fire('Creado', 'Acción de seguimiento creada', 'success');
        this.mostrarSeguimiento = false;
        this.verDetalle(this.accidenteSeleccionado!.id!);
      },
      error: (err) => {
        Swal.fire('Error', err.error?.msg || 'Error al crear seguimiento', 'error');
      },
    });
  }

  actualizarEstadoSeguimiento(seguimientoId: number, estado: 'pendiente' | 'en_progreso' | 'completado'): void {
    this.ssgtService.actualizarSeguimiento(seguimientoId, { estado }).subscribe({
      next: () => {
        this.verDetalle(this.accidenteSeleccionado!.id!);
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el seguimiento', 'error');
      },
    });
  }

  // ========================
  // HELPERS
  // ========================

  getNombreUsuario(uid: number): string {
    const user = this.usuarios.find((u) => u.Uid === uid);
    return user ? `${user.name} ${user.lastName}` : 'Desconocido';
  }

  getSeveridadClass(severidad: string): string {
    switch (severidad) {
      case 'leve': return 'badge-leve';
      case 'grave': return 'badge-grave';
      case 'mortal': return 'badge-mortal';
      default: return '';
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'reportado': return 'badge-reportado';
      case 'en_investigacion': return 'badge-investigacion';
      case 'cerrado': return 'badge-cerrado';
      default: return '';
    }
  }

  getTipoClass(tipo: string): string {
    return tipo === 'accidente' ? 'badge-accidente' : 'badge-incidente';
  }

  getEstadoSeguimientoClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge-pendiente';
      case 'en_progreso': return 'badge-en-progreso';
      case 'completado': return 'badge-completado';
      default: return '';
    }
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  esSevero(): boolean {
    return this.nuevoAccidente.severidad === 'grave' || this.nuevoAccidente.severidad === 'mortal';
  }
}
