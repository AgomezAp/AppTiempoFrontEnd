import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SsgtService } from '../../services/ssgt.service';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ssgt-capacitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './ssgt-capacitaciones.component.html',
  styleUrl: './ssgt-capacitaciones.component.css',
})
export class SsgtCapacitacionesComponent implements OnInit {
  capacitaciones: any[] = [];
  usuarios: any[] = [];
  loading = false;
  userId: number = 0;

  filtroEstado: string = '';
  filtroEmpresa: string = '';

  mostrarFormCapacitacion = false;
  editandoId: number | null = null;
  nuevaCapacitacion: any = {
    titulo: '', descripcion: '', tema: '', instructorId: null,
    instructorExterno: '', fechaProgramada: '', horaInicio: '', horaFin: '',
    lugar: '', empresa: '', estado: 'programada'
  };

  // Detalle + Evaluación
  capacitacionSeleccionada: any = null;
  mostrarDetalle = false;
  evaluacion: any = null;
  resultados: any[] = [];

  // Crear evaluación
  mostrarCrearEvaluacion = false;
  nuevaEvaluacion: any = { titulo: '', tiempoLimite: null, preguntas: [] };

  constructor(
    private ssgtService: SsgtService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = parseInt(localStorage.getItem('userId') || '0');
    this.cargarCapacitaciones();
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.userService.getListUser().subscribe({
      next: (data: any) => { this.usuarios = data; },
      error: () => {}
    });
  }

  cargarCapacitaciones(): void {
    this.loading = true;
    this.ssgtService.obtenerCapacitaciones(
      this.filtroEstado || undefined,
      this.filtroEmpresa || undefined
    ).subscribe({
      next: (data) => { this.capacitaciones = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirFormCapacitacion(cap?: any): void {
    if (cap) {
      this.editandoId = cap.id;
      this.nuevaCapacitacion = { ...cap };
    } else {
      this.editandoId = null;
      this.nuevaCapacitacion = {
        titulo: '', descripcion: '', tema: '', instructorId: null,
        instructorExterno: '', fechaProgramada: '', horaInicio: '', horaFin: '',
        lugar: '', empresa: '', estado: 'programada'
      };
    }
    this.mostrarFormCapacitacion = true;
  }

  cerrarFormCapacitacion(): void {
    this.mostrarFormCapacitacion = false;
    this.editandoId = null;
  }

  guardarCapacitacion(): void {
    if (this.editandoId) {
      this.ssgtService.actualizarCapacitacion(this.editandoId, this.nuevaCapacitacion).subscribe({
        next: () => { Swal.fire('Éxito', 'Capacitación actualizada', 'success'); this.cerrarFormCapacitacion(); this.cargarCapacitaciones(); },
        error: () => { Swal.fire('Error', 'Error al actualizar', 'error'); }
      });
    } else {
      this.ssgtService.crearCapacitacion(this.nuevaCapacitacion).subscribe({
        next: () => { Swal.fire('Éxito', 'Capacitación creada', 'success'); this.cerrarFormCapacitacion(); this.cargarCapacitaciones(); },
        error: () => { Swal.fire('Error', 'Error al crear', 'error'); }
      });
    }
  }

  eliminarCapacitacion(id: number): void {
    Swal.fire({ title: '¿Eliminar capacitación?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' }).then((r) => {
      if (r.isConfirmed) {
        this.ssgtService.eliminarCapacitacion(id).subscribe({
          next: () => { Swal.fire('Eliminado', '', 'success'); this.cargarCapacitaciones(); },
          error: () => { Swal.fire('Error', 'Error al eliminar', 'error'); }
        });
      }
    });
  }

  subirMaterial(capId: number, event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.ssgtService.subirMaterialCapacitacion(capId, file).subscribe({
      next: () => { Swal.fire('Éxito', 'Material subido', 'success'); this.cargarCapacitaciones(); },
      error: () => { Swal.fire('Error', 'Error al subir material', 'error'); }
    });
  }

  // ========== DETALLE ==========
  abrirDetalle(cap: any): void {
    this.capacitacionSeleccionada = cap;
    this.mostrarDetalle = true;
    this.cargarEvaluacion(cap.id);
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.capacitacionSeleccionada = null;
    this.evaluacion = null;
    this.resultados = [];
  }

  cargarEvaluacion(capId: number): void {
    this.ssgtService.obtenerEvaluacion(capId).subscribe({
      next: (data) => {
        this.evaluacion = data;
        if (data && data.id) {
          this.cargarResultados(capId);
        }
      },
      error: () => { this.evaluacion = null; }
    });
  }

  cargarResultados(capId: number): void {
    this.ssgtService.obtenerResultadosEvaluacion(capId).subscribe({
      next: (data) => { this.resultados = data; },
      error: () => { this.resultados = []; }
    });
  }

  irAEvaluacion(capId: number): void {
    this.router.navigate(['/ssgt-evaluacion', capId]);
  }

  // ========== CREAR EVALUACION ==========
  abrirCrearEvaluacion(): void {
    this.mostrarCrearEvaluacion = true;
    this.nuevaEvaluacion = {
      titulo: `Evaluación - ${this.capacitacionSeleccionada?.titulo || ''}`,
      tiempoLimite: 15,
      preguntas: [{ pregunta: '', tipo: 'opcion_multiple', opciones: '["","","",""]', respuestaCorrecta: '', orden: 1 }]
    };
  }

  cerrarCrearEvaluacion(): void {
    this.mostrarCrearEvaluacion = false;
  }

  agregarPregunta(): void {
    this.nuevaEvaluacion.preguntas.push({
      pregunta: '', tipo: 'opcion_multiple',
      opciones: '["","","",""]', respuestaCorrecta: '', orden: this.nuevaEvaluacion.preguntas.length + 1
    });
  }

  eliminarPregunta(index: number): void {
    this.nuevaEvaluacion.preguntas.splice(index, 1);
  }

  getOpciones(pregunta: any): string[] {
    try { return JSON.parse(pregunta.opciones); } catch { return ['', '', '', '']; }
  }

  setOpcion(pregunta: any, index: number, value: string): void {
    const opciones = this.getOpciones(pregunta);
    opciones[index] = value;
    pregunta.opciones = JSON.stringify(opciones);
  }

  guardarEvaluacion(): void {
    if (!this.capacitacionSeleccionada) return;
    this.ssgtService.crearEvaluacion(this.capacitacionSeleccionada.id, this.nuevaEvaluacion).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Evaluación creada', 'success');
        this.cerrarCrearEvaluacion();
        this.cargarEvaluacion(this.capacitacionSeleccionada.id);
      },
      error: () => { Swal.fire('Error', 'Error al crear evaluación', 'error'); }
    });
  }

  // ========== HELPERS ==========
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'programada': return 'badge-info';
      case 'realizada': return 'badge-success';
      case 'cancelada': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'programada': return 'Programada';
      case 'realizada': return 'Realizada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  }

  getNombreUsuario(uid: number): string {
    const user = this.usuarios.find((u: any) => u.Uid === uid);
    return user ? user.nombre : `ID: ${uid}`;
  }

  getEmpresaNombre(empresa: string): string {
    switch (empresa) {
      case 'AP': return 'Andrés Publicidad';
      case 'AT': return 'Andrés Tobón';
      case 'ME': return 'María Evangelina';
      default: return empresa || '';
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
