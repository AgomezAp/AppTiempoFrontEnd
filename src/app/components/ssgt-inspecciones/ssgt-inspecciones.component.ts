import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { SsgtService } from '../../services/ssgt.service';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';
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

  // Plantillas
  plantillas: any[] = [];
  mostrarFormPlantilla = false;
  editandoPlantillaId: number | null = null;
  nuevaPlantilla: any = { titulo: '', descripcion: '', categoria: '', empresa: '', umbralAprobacion: 80, secciones: [] };

  // Inspecciones
  inspecciones: any[] = [];
  mostrarFormInspeccion = false;
  editandoInspeccionId: number | null = null;
  nuevaInspeccion: any = { titulo: '', tipo: 'plantilla', fechaInspeccion: '', lugar: '', empresa: '', plantillaId: null, observacionesGenerales: '' };

  // Formulario de respuestas / realizar inspección
  inspeccionActiva: any = null;
  respuestasForm: any[] = [];
  mostrarRealizarInspeccion = false;
  modoVisualizacion = false; // true = solo lectura (inspección completada)

  // Condiciones Inseguras
  condiciones: any[] = [];
  mostrarFormCondicion = false;
  editandoCondicionId: number | null = null;
  nuevaCondicion: any = { descripcion: '', ubicacion: '', severidad: 'media', fechaReporte: '', estado: 'abierta' };

  // Acciones Correctivas
  acciones: any[] = [];
  mostrarFormAccion = false;
  editandoAccionId: number | null = null;
  nuevaAccion: any = { inspeccionId: 0, descripcion: '', prioridad: 'media', responsableId: null, fechaLimite: '', preguntaTexto: '' };

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
      case 'plantillas': this.cargarPlantillas(); break;
      case 'condiciones': this.cargarCondiciones(); break;
      case 'acciones': this.cargarAcciones(); break;
    }
  }

  // ========== PLANTILLAS ==========
  cargarPlantillas(): void {
    this.loading = true;
    this.ssgtService.obtenerPlantillas().subscribe({
      next: (data) => { this.plantillas = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirFormPlantilla(plantilla?: any): void {
    if (plantilla) {
      this.editandoPlantillaId = plantilla.id;
      this.nuevaPlantilla = {
        titulo: plantilla.titulo,
        descripcion: plantilla.descripcion,
        categoria: plantilla.categoria,
        empresa: plantilla.empresa,
        umbralAprobacion: plantilla.umbralAprobacion || 80,
        secciones: (plantilla.secciones || []).map((s: any) => ({
          titulo: s.titulo,
          descripcion: s.descripcion,
          orden: s.orden,
          peso: s.peso,
          preguntas: (s.preguntas || []).map((p: any) => ({
            texto: p.texto,
            tipo: p.tipo,
            opciones: p.opciones ? (typeof p.opciones === 'string' ? JSON.parse(p.opciones) : p.opciones) : [],
            requerida: p.requerida,
            peso: p.peso,
            respuestaEsperada: p.respuestaEsperada,
            orden: p.orden,
            requiereAccionSiNoConforme: p.requiereAccionSiNoConforme,
            omitible: p.omitible || false,
          }))
        }))
      };
    } else {
      this.editandoPlantillaId = null;
      this.nuevaPlantilla = { titulo: '', descripcion: '', categoria: '', empresa: '', umbralAprobacion: 80, secciones: [] };
    }
    this.mostrarFormPlantilla = true;
  }

  cerrarFormPlantilla(): void {
    this.mostrarFormPlantilla = false;
    this.editandoPlantillaId = null;
  }

  agregarSeccion(): void {
    this.nuevaPlantilla.secciones.push({
      titulo: '', descripcion: '', orden: this.nuevaPlantilla.secciones.length, peso: 1.0, preguntas: []
    });
  }

  eliminarSeccion(index: number): void {
    this.nuevaPlantilla.secciones.splice(index, 1);
  }

  agregarPregunta(seccionIndex: number): void {
    this.nuevaPlantilla.secciones[seccionIndex].preguntas.push({
      texto: '', tipo: 'si_no', opciones: [], requerida: true, peso: 1.0, respuestaEsperada: 'si', orden: this.nuevaPlantilla.secciones[seccionIndex].preguntas.length, requiereAccionSiNoConforme: false, omitible: false
    });
  }

  eliminarPregunta(seccionIndex: number, preguntaIndex: number): void {
    this.nuevaPlantilla.secciones[seccionIndex].preguntas.splice(preguntaIndex, 1);
  }

  guardarPlantilla(): void {
    if (this.editandoPlantillaId) {
      this.ssgtService.actualizarPlantilla(this.editandoPlantillaId, this.nuevaPlantilla).subscribe({
        next: () => { Swal.fire('Éxito', 'Plantilla actualizada', 'success'); this.cerrarFormPlantilla(); this.cargarPlantillas(); },
        error: () => { Swal.fire('Error', 'Error al actualizar', 'error'); }
      });
    } else {
      this.ssgtService.crearPlantilla(this.nuevaPlantilla).subscribe({
        next: () => { Swal.fire('Éxito', 'Plantilla creada', 'success'); this.cerrarFormPlantilla(); this.cargarPlantillas(); },
        error: () => { Swal.fire('Error', 'Error al crear', 'error'); }
      });
    }
  }

  duplicarPlantilla(id: number): void {
    this.ssgtService.duplicarPlantilla(id).subscribe({
      next: () => { Swal.fire('Éxito', 'Plantilla duplicada', 'success'); this.cargarPlantillas(); },
      error: () => { Swal.fire('Error', 'Error al duplicar', 'error'); }
    });
  }

  eliminarPlantilla(id: number): void {
    Swal.fire({ title: '¿Eliminar plantilla?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' }).then((r) => {
      if (r.isConfirmed) {
        this.ssgtService.eliminarPlantilla(id).subscribe({
          next: () => { Swal.fire('Eliminado', '', 'success'); this.cargarPlantillas(); },
          error: () => { Swal.fire('Error', 'Error al eliminar', 'error'); }
        });
      }
    });
  }

  getTotalPreguntas(plantilla: any): number {
    if (!plantilla.secciones) return 0;
    return plantilla.secciones.reduce((acc: number, s: any) => acc + (s.preguntas?.length || 0), 0);
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
      this.nuevaInspeccion = { titulo: '', tipo: 'plantilla', fechaInspeccion: '', lugar: '', empresa: '', plantillaId: null, observacionesGenerales: '' };
      if (this.plantillas.length === 0) this.cargarPlantillas();
    }
    this.mostrarFormInspeccion = true;
  }

  cerrarFormInspeccion(): void {
    this.mostrarFormInspeccion = false;
    this.editandoInspeccionId = null;
  }

  onPlantillaSeleccionada(): void {
    const plantilla = this.plantillas.find(p => p.id == this.nuevaInspeccion.plantillaId);
    if (plantilla && !this.nuevaInspeccion.titulo) {
      this.nuevaInspeccion.titulo = plantilla.titulo;
    }
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

  // Realizar inspección: abrir formulario de respuestas
  abrirRealizarInspeccion(inspeccion: any): void {
    this.modoVisualizacion = false;
    this.loading = true;
    this.ssgtService.obtenerInspeccionPorId(inspeccion.id).subscribe({
      next: (data) => {
        this.inspeccionActiva = data;
        this.prepararRespuestas(data);
        this.mostrarRealizarInspeccion = true;
        this.loading = false;
      },
      error: () => { this.loading = false; Swal.fire('Error', 'Error al cargar inspección', 'error'); }
    });
  }

  // Ver inspección completada (modo lectura)
  verInspeccion(inspeccion: any): void {
    this.modoVisualizacion = true;
    this.loading = true;
    this.ssgtService.obtenerInspeccionPorId(inspeccion.id).subscribe({
      next: (data) => {
        this.inspeccionActiva = data;
        this.prepararRespuestas(data);
        this.mostrarRealizarInspeccion = true;
        this.loading = false;
      },
      error: () => { this.loading = false; Swal.fire('Error', 'Error al cargar inspección', 'error'); }
    });
  }

  prepararRespuestas(inspeccion: any): void {
    const plantilla = inspeccion.plantilla;
    if (!plantilla || !plantilla.secciones) {
      this.respuestasForm = [];
      return;
    }

    this.respuestasForm = plantilla.secciones.map((seccion: any) => ({
      ...seccion,
      preguntas: seccion.preguntas.map((pregunta: any) => {
        const respExistente = (inspeccion.respuestas || []).find((r: any) => r.preguntaId === pregunta.id);
        return {
          ...pregunta,
          respuestaId: respExistente?.id,
          valor: respExistente?.valor || '',
          valorArchivo: respExistente?.valorArchivo || '',
          observacion: respExistente?.observacion || '',
          omitida: respExistente?.omitida || false,
          fotos: respExistente?.fotos || [],
          subiendoFoto: false,
          opciones: pregunta.opciones ? (typeof pregunta.opciones === 'string' ? JSON.parse(pregunta.opciones) : pregunta.opciones) : [],
        };
      }).sort((a: any, b: any) => a.orden - b.orden)
    })).sort((a: any, b: any) => a.orden - b.orden);
  }

  cerrarRealizarInspeccion(): void {
    this.mostrarRealizarInspeccion = false;
    this.inspeccionActiva = null;
    this.modoVisualizacion = false;
  }

  subirFotoEvidencia(event: Event, pregunta: any): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.inspeccionActiva) return;

    const archivos: File[] = Array.from(input.files);
    for (const archivo of archivos) {
      if (!archivo.type.startsWith('image/')) {
        Swal.fire('Error', 'Solo se permiten archivos de imagen', 'warning');
        return;
      }
    }

    if (!pregunta.respuestaId) {
      Swal.fire('Info', 'Guarde las respuestas primero antes de subir fotos', 'info');
      return;
    }

    pregunta.subiendoFoto = true;
    this.ssgtService.subirFotoInspeccion(this.inspeccionActiva.id, pregunta.respuestaId, archivos).subscribe({
      next: (res) => {
        if (!pregunta.fotos) pregunta.fotos = [];
        pregunta.fotos.push(...res.fotos);
        pregunta.subiendoFoto = false;
        Swal.fire('Fotos subidas', `${res.fotos.length} foto(s) adjuntada(s) correctamente`, 'success');
      },
      error: () => {
        pregunta.subiendoFoto = false;
        Swal.fire('Error', 'Error al subir las fotos', 'error');
      }
    });
  }

  eliminarFoto(fotoId: number, pregunta: any): void {
    Swal.fire({ title: '¿Eliminar foto?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' }).then((r) => {
      if (r.isConfirmed) {
        this.ssgtService.eliminarFotoRespuesta(fotoId).subscribe({
          next: () => {
            pregunta.fotos = pregunta.fotos.filter((f: any) => f.id !== fotoId);
            Swal.fire('Eliminada', 'Foto eliminada', 'success');
          },
          error: () => { Swal.fire('Error', 'Error al eliminar foto', 'error'); }
        });
      }
    });
  }

  getUrlArchivo(ruta: string): string {
    if (!ruta) return '';
    if (ruta.startsWith('http')) return ruta;
    return environment.apiUrl + ruta;
  }

  guardarRespuestas(): void {
    if (!this.inspeccionActiva) return;

    const respuestas: any[] = [];
    for (const seccion of this.respuestasForm) {
      for (const pregunta of seccion.preguntas) {
        respuestas.push({
          preguntaId: pregunta.id,
          seccionId: seccion.id,
          valor: pregunta.valor,
          valorArchivo: pregunta.valorArchivo || null,
          observacion: pregunta.observacion,
          omitida: pregunta.omitida || false,
          orden: pregunta.orden,
        });
      }
    }

    this.ssgtService.guardarRespuestas(this.inspeccionActiva.id, respuestas).subscribe({
      next: (res: any) => {
        const accionesMsg = res.accionesCreadas > 0 ? `\n${res.accionesCreadas} acciones correctivas creadas` : '';
        Swal.fire('Guardado', `Puntaje: ${res.porcentaje}% — ${res.aprobada ? 'APROBADA' : 'NO APROBADA'}${accionesMsg}`, res.aprobada ? 'success' : 'warning');
        this.cargarInspecciones();
      },
      error: () => { Swal.fire('Error', 'Error al guardar respuestas', 'error'); }
    });
  }

  completarInspeccion(id: number): void {
    Swal.fire({ title: '¿Completar inspección?', text: 'No se podrán editar más las respuestas', icon: 'question', showCancelButton: true, confirmButtonText: 'Completar', cancelButtonText: 'Cancelar' }).then((r) => {
      if (r.isConfirmed) {
        this.ssgtService.completarInspeccion(id).subscribe({
          next: () => { Swal.fire('Completada', 'Inspección finalizada', 'success'); this.cerrarRealizarInspeccion(); this.cargarInspecciones(); },
          error: () => { Swal.fire('Error', 'Error al completar', 'error'); }
        });
      }
    });
  }

  descargarPdf(id: number): void {
    this.ssgtService.descargarPdfInspeccion(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inspeccion_${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => { Swal.fire('Error', 'Error al generar PDF', 'error'); }
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

  // ========== ACCIONES CORRECTIVAS ==========
  cargarAcciones(): void {
    this.loading = true;
    this.ssgtService.obtenerAccionesCorrectivas().subscribe({
      next: (data) => { this.acciones = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  abrirFormAccion(accion?: any): void {
    if (accion) {
      this.editandoAccionId = accion.id;
      this.nuevaAccion = { ...accion };
    } else {
      this.editandoAccionId = null;
      this.nuevaAccion = { inspeccionId: 0, descripcion: '', prioridad: 'media', responsableId: null, fechaLimite: '', preguntaTexto: '' };
    }
    this.mostrarFormAccion = true;
  }

  cerrarFormAccion(): void {
    this.mostrarFormAccion = false;
    this.editandoAccionId = null;
  }

  guardarAccion(): void {
    if (this.editandoAccionId) {
      this.ssgtService.actualizarAccionCorrectiva(this.editandoAccionId, this.nuevaAccion).subscribe({
        next: () => { Swal.fire('Éxito', 'Acción actualizada', 'success'); this.cerrarFormAccion(); this.cargarAcciones(); },
        error: () => { Swal.fire('Error', 'Error al actualizar', 'error'); }
      });
    } else {
      this.ssgtService.crearAccionCorrectiva(this.nuevaAccion).subscribe({
        next: () => { Swal.fire('Éxito', 'Acción creada', 'success'); this.cerrarFormAccion(); this.cargarAcciones(); },
        error: () => { Swal.fire('Error', 'Error al crear', 'error'); }
      });
    }
  }

  eliminarAccion(id: number): void {
    Swal.fire({ title: '¿Eliminar acción?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' }).then((r) => {
      if (r.isConfirmed) {
        this.ssgtService.eliminarAccionCorrectiva(id).subscribe({
          next: () => { Swal.fire('Eliminado', '', 'success'); this.cargarAcciones(); },
          error: () => { Swal.fire('Error', 'Error al eliminar', 'error'); }
        });
      }
    });
  }

  // ========== ACCIONES DESDE VISTA DE INSPECCION ==========
  actualizarEstadoAccion(accion: any, nuevoEstado: string): void {
    this.ssgtService.actualizarAccionCorrectiva(accion.id, { ...accion, estado: nuevoEstado }).subscribe({
      next: () => {
        accion.estado = nuevoEstado;
        if (accion.responsable?.email) {
          Swal.fire({
            title: 'Acción actualizada',
            text: `¿Desea enviar un correo a ${accion.responsable.name} ${accion.responsable.lastName} (${accion.responsable.email}) notificándole esta acción correctiva?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, enviar correo',
            cancelButtonText: 'No',
            confirmButtonColor: '#3498db',
          }).then((result) => {
            if (result.isConfirmed) {
              this.enviarCorreoAccion(accion);
            }
          });
        } else {
          Swal.fire('Actualizado', `Acción marcada como ${nuevoEstado}`, 'success');
        }
      },
      error: () => { Swal.fire('Error', 'Error al actualizar', 'error'); }
    });
  }

  enviarCorreoAccion(accion: any): void {
    Swal.fire({ title: 'Enviando correo...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    this.ssgtService.enviarCorreoAccionCorrectiva(accion.id).subscribe({
      next: (res) => {
        Swal.fire('Correo enviado', res.msg, 'success');
      },
      error: (err) => {
        Swal.fire('Error', err.error?.msg || 'Error al enviar el correo', 'error');
      }
    });
  }

  // ========== QR / LINK MÓVIL ==========
  mostrarQR(inspeccion: any): void {
    const token = inspeccion.tokenAcceso;
    if (!token) {
      Swal.fire('Error', 'Esta inspección no tiene token de acceso', 'error');
      return;
    }
    const url = `${window.location.origin}/inspeccion-movil/${token}`;
    Swal.fire({
      title: 'Inspección Móvil',
      html: `
        <div style="text-align: center;">
          <p style="font-size: 13px; color: #666;">Escanee el QR o copie el enlace para realizar la inspección desde un dispositivo móvil</p>
          <div id="qr-container" style="display: flex; justify-content: center; margin: 15px 0;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" alt="QR Code" style="border: 2px solid #ddd; border-radius: 8px; padding: 8px;" />
          </div>
          <div style="background: #f5f6fa; padding: 10px; border-radius: 8px; word-break: break-all; font-size: 12px; margin-top: 10px;">
            <a href="${url}" target="_blank">${url}</a>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Copiar enlace',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#2c3e50',
    }).then((result) => {
      if (result.isConfirmed) {
        navigator.clipboard.writeText(url).then(() => {
          Swal.fire('Copiado', 'Enlace copiado al portapapeles', 'success');
        });
      }
    });
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

  getPrioridadClass(pri: string): string {
    switch (pri) {
      case 'baja': return 'badge-info';
      case 'media': return 'badge-warning';
      case 'alta': return 'badge-danger';
      case 'critica': return 'badge-dark';
      default: return 'badge-secondary';
    }
  }

  getEstadoInspeccionClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge-warning';
      case 'en_proceso': return 'badge-info';
      case 'completada': return 'badge-success';
      default: return 'badge-secondary';
    }
  }

  getEstadoAccionClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge-warning';
      case 'en_progreso': return 'badge-info';
      case 'completada': return 'badge-success';
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

  getPorcentajeColor(porcentaje: number): string {
    if (porcentaje >= 80) return '#27ae60';
    if (porcentaje >= 60) return '#f39c12';
    return '#e74c3c';
  }

  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
