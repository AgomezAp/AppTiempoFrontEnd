import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { SsgtService } from '../../services/ssgt.service';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ssgt-inspecciones',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './ssgt-inspecciones.component.html',
  styleUrl: './ssgt-inspecciones.component.css',
})
export class SsgtInspeccionesComponent implements OnInit {
  tabActual = 'inspecciones';
  loading = false;
  usuarios: any[] = [];
  userId: number = 0;

  // Inspecciones
  inspecciones: any[] = [];
  mostrarFormInspeccion = false;
  editandoInspeccionId: number | null = null;
  nuevaInspeccion: any = { titulo: '', tipo: 'general', fechaInspeccion: '', lugar: '', empresa: '', observacionesGenerales: '' };
  checklistItems: any[] = [];
  inspeccionSeleccionada: any = null;
  mostrarChecklist = false;

  // Condiciones Inseguras
  condiciones: any[] = [];
  mostrarFormCondicion = false;
  editandoCondicionId: number | null = null;
  nuevaCondicion: any = { descripcion: '', ubicacion: '', severidad: 'media', fechaReporte: '', estado: 'abierta' };

  // Matriz de Riesgos
  riesgos: any[] = [];
  mostrarFormRiesgo = false;
  editandoRiesgoId: number | null = null;
  nuevoRiesgo: any = { nombre: '', descripcion: '', proceso: '', peligro: '', probabilidad: 1, consecuencia: 1, nivelRiesgo: 'bajo', controlesExistentes: '', accionRecomendada: '', empresa: '' };

  // Planes de Acción
  planes: any[] = [];
  mostrarFormPlan = false;
  editandoPlanId: number | null = null;
  nuevoPlan: any = { origen: 'inspeccion', origenId: 0, descripcion: '', responsableId: 0, fechaInicio: '', fechaLimite: '', observaciones: '' };

  constructor(
    private ssgtService: SsgtService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userId = parseInt(localStorage.getItem('userId') || '0');
    this.cargarUsuarios();
    this.cargarInspecciones();
  }

  cargarUsuarios(): void {
    this.userService.getListUser().subscribe({
      next: (data: any) => { this.usuarios = data; },
      error: () => {}
    });
  }

  cambiarTab(tab: string): void {
    this.tabActual = tab;
    switch (tab) {
      case 'inspecciones': this.cargarInspecciones(); break;
      case 'condiciones': this.cargarCondiciones(); break;
      case 'riesgos': this.cargarRiesgos(); break;
      case 'planes': this.cargarPlanes(); break;
    }
  }

  // ========== INSPECCIONES ==========
  cargarInspecciones(): void {
    this.loading = true;
    this.ssgtService.obtenerInspecciones().subscribe({
      next: (data) => { this.inspecciones = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirFormInspeccion(inspeccion?: any): void {
    if (inspeccion) {
      this.editandoInspeccionId = inspeccion.id;
      this.nuevaInspeccion = { ...inspeccion };
    } else {
      this.editandoInspeccionId = null;
      this.nuevaInspeccion = { titulo: '', tipo: 'general', fechaInspeccion: '', lugar: '', empresa: '', observacionesGenerales: '' };
    }
    this.mostrarFormInspeccion = true;
  }

  cerrarFormInspeccion(): void {
    this.mostrarFormInspeccion = false;
    this.editandoInspeccionId = null;
  }

  guardarInspeccion(): void {
    const data = { ...this.nuevaInspeccion, inspectorId: this.userId };
    if (this.editandoInspeccionId) {
      this.ssgtService.actualizarInspeccion(this.editandoInspeccionId, data).subscribe({
        next: () => { Swal.fire('Éxito', 'Inspección actualizada', 'success'); this.cerrarFormInspeccion(); this.cargarInspecciones(); },
        error: () => { Swal.fire('Error', 'Error al actualizar', 'error'); }
      });
    } else {
      this.ssgtService.crearInspeccion(data).subscribe({
        next: () => { Swal.fire('Éxito', 'Inspección creada', 'success'); this.cerrarFormInspeccion(); this.cargarInspecciones(); },
        error: () => { Swal.fire('Error', 'Error al crear', 'error'); }
      });
    }
  }

  eliminarInspeccion(id: number): void {
    Swal.fire({ title: '¿Eliminar inspección?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' }).then((r) => {
      if (r.isConfirmed) {
        this.ssgtService.eliminarInspeccion(id).subscribe({
          next: () => { Swal.fire('Eliminado', '', 'success'); this.cargarInspecciones(); },
          error: () => { Swal.fire('Error', 'Error al eliminar', 'error'); }
        });
      }
    });
  }

  abrirChecklist(inspeccion: any): void {
    this.inspeccionSeleccionada = inspeccion;
    this.checklistItems = (inspeccion.checklist || []).map((item: any) => ({ ...item }));
    if (this.checklistItems.length === 0) {
      this.checklistItems = [
        { pregunta: '', cumple: null, observacion: '', orden: 1 }
      ];
    }
    this.mostrarChecklist = true;
  }

  cerrarChecklist(): void {
    this.mostrarChecklist = false;
    this.inspeccionSeleccionada = null;
  }

  agregarItemChecklist(): void {
    this.checklistItems.push({ pregunta: '', cumple: null, observacion: '', orden: this.checklistItems.length + 1 });
  }

  eliminarItemChecklist(index: number): void {
    this.checklistItems.splice(index, 1);
  }

  guardarChecklist(): void {
    if (!this.inspeccionSeleccionada) return;
    const items = this.checklistItems.filter(i => i.pregunta.trim() !== '');
    this.ssgtService.guardarChecklist(this.inspeccionSeleccionada.id, items).subscribe({
      next: () => { Swal.fire('Éxito', 'Checklist guardado', 'success'); this.cerrarChecklist(); this.cargarInspecciones(); },
      error: () => { Swal.fire('Error', 'Error al guardar checklist', 'error'); }
    });
  }

  // ========== CONDICIONES INSEGURAS ==========
  cargarCondiciones(): void {
    this.loading = true;
    this.ssgtService.obtenerCondicionesInseguras().subscribe({
      next: (data) => { this.condiciones = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirFormCondicion(condicion?: any): void {
    if (condicion) {
      this.editandoCondicionId = condicion.id;
      this.nuevaCondicion = { ...condicion };
    } else {
      this.editandoCondicionId = null;
      this.nuevaCondicion = { descripcion: '', ubicacion: '', severidad: 'media', fechaReporte: new Date().toISOString().split('T')[0], estado: 'abierta' };
    }
    this.mostrarFormCondicion = true;
  }

  cerrarFormCondicion(): void {
    this.mostrarFormCondicion = false;
    this.editandoCondicionId = null;
  }

  guardarCondicion(): void {
    const data = { ...this.nuevaCondicion, reportadoPor: this.userId };
    if (this.editandoCondicionId) {
      this.ssgtService.actualizarCondicionInsegura(this.editandoCondicionId, data).subscribe({
        next: () => { Swal.fire('Éxito', 'Condición actualizada', 'success'); this.cerrarFormCondicion(); this.cargarCondiciones(); },
        error: () => { Swal.fire('Error', 'Error al actualizar', 'error'); }
      });
    } else {
      this.ssgtService.crearCondicionInsegura(data).subscribe({
        next: () => { Swal.fire('Éxito', 'Condición reportada', 'success'); this.cerrarFormCondicion(); this.cargarCondiciones(); },
        error: () => { Swal.fire('Error', 'Error al reportar', 'error'); }
      });
    }
  }

  eliminarCondicion(id: number): void {
    Swal.fire({ title: '¿Eliminar condición?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' }).then((r) => {
      if (r.isConfirmed) {
        this.ssgtService.eliminarCondicionInsegura(id).subscribe({
          next: () => { Swal.fire('Eliminado', '', 'success'); this.cargarCondiciones(); },
          error: () => { Swal.fire('Error', 'Error al eliminar', 'error'); }
        });
      }
    });
  }

  subirFotoCondicion(condicionId: number, event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.ssgtService.subirFotoCondicion(condicionId, file).subscribe({
      next: () => { Swal.fire('Éxito', 'Foto subida', 'success'); this.cargarCondiciones(); },
      error: () => { Swal.fire('Error', 'Error al subir foto', 'error'); }
    });
  }

  // ========== MATRIZ DE RIESGOS ==========
  cargarRiesgos(): void {
    this.loading = true;
    this.ssgtService.obtenerRiesgos().subscribe({
      next: (data) => { this.riesgos = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirFormRiesgo(riesgo?: any): void {
    if (riesgo) {
      this.editandoRiesgoId = riesgo.id;
      this.nuevoRiesgo = { ...riesgo };
    } else {
      this.editandoRiesgoId = null;
      this.nuevoRiesgo = { nombre: '', descripcion: '', proceso: '', peligro: '', probabilidad: 1, consecuencia: 1, nivelRiesgo: 'bajo', controlesExistentes: '', accionRecomendada: '', empresa: '' };
    }
    this.mostrarFormRiesgo = true;
  }

  cerrarFormRiesgo(): void {
    this.mostrarFormRiesgo = false;
    this.editandoRiesgoId = null;
  }

  calcularNivelRiesgo(): void {
    const valor = this.nuevoRiesgo.probabilidad * this.nuevoRiesgo.consecuencia;
    if (valor <= 4) this.nuevoRiesgo.nivelRiesgo = 'bajo';
    else if (valor <= 9) this.nuevoRiesgo.nivelRiesgo = 'medio';
    else if (valor <= 15) this.nuevoRiesgo.nivelRiesgo = 'alto';
    else if (valor <= 20) this.nuevoRiesgo.nivelRiesgo = 'muy_alto';
    else this.nuevoRiesgo.nivelRiesgo = 'critico';
  }

  guardarRiesgo(): void {
    this.calcularNivelRiesgo();
    const data = { ...this.nuevoRiesgo, responsableId: this.userId };
    if (this.editandoRiesgoId) {
      this.ssgtService.actualizarRiesgo(this.editandoRiesgoId, data).subscribe({
        next: () => { Swal.fire('Éxito', 'Riesgo actualizado', 'success'); this.cerrarFormRiesgo(); this.cargarRiesgos(); },
        error: () => { Swal.fire('Error', 'Error al actualizar', 'error'); }
      });
    } else {
      this.ssgtService.crearRiesgo(data).subscribe({
        next: () => { Swal.fire('Éxito', 'Riesgo creado', 'success'); this.cerrarFormRiesgo(); this.cargarRiesgos(); },
        error: () => { Swal.fire('Error', 'Error al crear', 'error'); }
      });
    }
  }

  eliminarRiesgo(id: number): void {
    Swal.fire({ title: '¿Eliminar riesgo?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' }).then((r) => {
      if (r.isConfirmed) {
        this.ssgtService.eliminarRiesgo(id).subscribe({
          next: () => { Swal.fire('Eliminado', '', 'success'); this.cargarRiesgos(); },
          error: () => { Swal.fire('Error', 'Error al eliminar', 'error'); }
        });
      }
    });
  }

  getNivelRiesgoClass(nivel: string): string {
    switch (nivel) {
      case 'bajo': return 'nivel-bajo';
      case 'medio': return 'nivel-medio';
      case 'alto': return 'nivel-alto';
      case 'muy_alto': return 'nivel-muy-alto';
      case 'critico': return 'nivel-critico';
      default: return '';
    }
  }

  getNivelRiesgoLabel(nivel: string): string {
    switch (nivel) {
      case 'bajo': return 'Bajo';
      case 'medio': return 'Medio';
      case 'alto': return 'Alto';
      case 'muy_alto': return 'Muy Alto';
      case 'critico': return 'Crítico';
      default: return nivel;
    }
  }

  // ========== PLANES DE ACCIÓN ==========
  cargarPlanes(): void {
    this.loading = true;
    this.ssgtService.obtenerPlanesAccion().subscribe({
      next: (data) => { this.planes = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirFormPlan(plan?: any): void {
    if (plan) {
      this.editandoPlanId = plan.id;
      this.nuevoPlan = { ...plan };
    } else {
      this.editandoPlanId = null;
      this.nuevoPlan = { origen: 'inspeccion', origenId: 0, descripcion: '', responsableId: 0, fechaInicio: new Date().toISOString().split('T')[0], fechaLimite: '', observaciones: '' };
    }
    this.mostrarFormPlan = true;
  }

  cerrarFormPlan(): void {
    this.mostrarFormPlan = false;
    this.editandoPlanId = null;
  }

  guardarPlan(): void {
    if (this.editandoPlanId) {
      this.ssgtService.actualizarPlanAccion(this.editandoPlanId, this.nuevoPlan).subscribe({
        next: () => { Swal.fire('Éxito', 'Plan actualizado', 'success'); this.cerrarFormPlan(); this.cargarPlanes(); },
        error: () => { Swal.fire('Error', 'Error al actualizar', 'error'); }
      });
    } else {
      this.ssgtService.crearPlanAccion(this.nuevoPlan).subscribe({
        next: () => { Swal.fire('Éxito', 'Plan creado', 'success'); this.cerrarFormPlan(); this.cargarPlanes(); },
        error: () => { Swal.fire('Error', 'Error al crear', 'error'); }
      });
    }
  }

  eliminarPlan(id: number): void {
    Swal.fire({ title: '¿Eliminar plan?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' }).then((r) => {
      if (r.isConfirmed) {
        this.ssgtService.eliminarPlanAccion(id).subscribe({
          next: () => { Swal.fire('Eliminado', '', 'success'); this.cargarPlanes(); },
          error: () => { Swal.fire('Error', 'Error al eliminar', 'error'); }
        });
      }
    });
  }

  getEstadoPlanClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge-warning';
      case 'en_progreso': return 'badge-info';
      case 'completado': return 'badge-success';
      case 'vencido': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getEstadoPlanLabel(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_progreso': return 'En Progreso';
      case 'completado': return 'Completado';
      case 'vencido': return 'Vencido';
      default: return estado;
    }
  }

  // ========== HELPERS ==========
  getNombreUsuario(uid: number): string {
    const user = this.usuarios.find(u => u.Uid === uid);
    return user ? user.nombre : `ID: ${uid}`;
  }

  getSeveridadClass(sev: string): string {
    switch (sev) {
      case 'baja': return 'badge-success';
      case 'media': return 'badge-warning';
      case 'alta': return 'badge-danger';
      case 'critica': return 'badge-dark';
      default: return 'badge-secondary';
    }
  }

  getEmpresaNombre(empresa: string): string {
    switch (empresa) {
      case 'AP': return 'Andrés Publicidad';
      case 'AT': return 'Andrés Tobón';
      case 'ME': return 'María Evangelina';
      default: return empresa || '';
    }
  }

  getChecklistCumple(checklist: any[]): number {
    if (!checklist) return 0;
    return checklist.filter(c => c.cumple === true).length;
  }

  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
