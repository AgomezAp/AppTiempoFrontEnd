import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SsgtService } from '../../services/ssgt.service';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ssgt-inspeccion-movil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ssgt-inspeccion-movil.component.html',
  styleUrl: './ssgt-inspeccion-movil.component.css',
})
export class SsgtInspeccionMovilComponent implements OnInit {
  token = '';
  inspeccion: any = null;
  loading = true;
  error = '';
  errorTipo = '';

  // Estado de la inspección
  seccionActual = 0;
  secciones: any[] = [];
  respuestasForm: any = {};
  fotosForm: { [preguntaId: number]: File[] } = {};
  fotosPreview: { [preguntaId: number]: string[] } = {};
  guardando = false;
  apiUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private ssgtService: SsgtService,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (this.token) {
      this.cargarInspeccion();
    } else {
      this.error = 'Token de inspección no válido';
      this.loading = false;
    }
  }

  cargarInspeccion(): void {
    this.loading = true;
    this.ssgtService.obtenerInspeccionPorToken(this.token).subscribe({
      next: (data) => {
        this.inspeccion = data;
        this.prepararFormulario();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.msg || 'Error al cargar la inspección';
        this.errorTipo = err.error?.tipo || '';
        this.loading = false;
      },
    });
  }

  prepararFormulario(): void {
    const plantilla = this.inspeccion?.plantilla;
    if (!plantilla?.secciones) return;

    this.secciones = plantilla.secciones
      .sort((a: any, b: any) => a.orden - b.orden)
      .map((s: any) => ({
        ...s,
        preguntas: (s.preguntas || []).sort((a: any, b: any) => a.orden - b.orden),
      }));

    // Precargar respuestas existentes
    const respuestas = this.inspeccion.respuestas || [];
    for (const resp of respuestas) {
      this.respuestasForm[resp.preguntaId] = {
        valor: resp.valor || '',
        observacion: resp.observacion || '',
        omitida: resp.omitida || false,
        seccionId: resp.seccionId,
        preguntaId: resp.preguntaId,
        id: resp.id,
      };
      // Precargar fotos existentes
      if (resp.fotos && resp.fotos.length > 0) {
        this.fotosPreview[resp.preguntaId] = resp.fotos.map(
          (f: any) => this.apiUrl + f.rutaArchivo,
        );
      }
    }

    // Inicializar respuestas vacías para preguntas sin respuesta
    for (const seccion of this.secciones) {
      for (const pregunta of seccion.preguntas) {
        if (!this.respuestasForm[pregunta.id]) {
          this.respuestasForm[pregunta.id] = {
            valor: '',
            observacion: '',
            omitida: false,
            seccionId: seccion.id,
            preguntaId: pregunta.id,
          };
        }
      }
    }
  }

  get seccionActualData() {
    return this.secciones[this.seccionActual];
  }

  get totalSecciones() {
    return this.secciones.length;
  }

  get progreso() {
    if (!this.secciones.length) return 0;
    let total = 0;
    let respondidas = 0;
    for (const s of this.secciones) {
      for (const p of s.preguntas) {
        total++;
        const r = this.respuestasForm[p.id];
        if (r && (r.valor || r.omitida)) respondidas++;
      }
    }
    return total > 0 ? Math.round((respondidas / total) * 100) : 0;
  }

  siguienteSeccion(): void {
    if (this.seccionActual < this.totalSecciones - 1) {
      this.seccionActual++;
      window.scrollTo(0, 0);
    }
  }

  anteriorSeccion(): void {
    if (this.seccionActual > 0) {
      this.seccionActual--;
      window.scrollTo(0, 0);
    }
  }

  irASeccion(index: number): void {
    this.seccionActual = index;
    window.scrollTo(0, 0);
  }

  toggleOmitir(preguntaId: number): void {
    const r = this.respuestasForm[preguntaId];
    if (r) {
      r.omitida = !r.omitida;
      if (r.omitida) {
        r.valor = '';
      }
    }
  }

  onFotoSelected(event: any, preguntaId: number): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    if (!this.fotosForm[preguntaId]) this.fotosForm[preguntaId] = [];
    if (!this.fotosPreview[preguntaId]) this.fotosPreview[preguntaId] = [];

    for (let i = 0; i < files.length; i++) {
      this.fotosForm[preguntaId].push(files[i]);
      // Preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotosPreview[preguntaId].push(e.target.result);
      };
      reader.readAsDataURL(files[i]);
    }

    // Reset input para permitir seleccionar más fotos
    input.value = '';
  }

  eliminarFotoLocal(preguntaId: number, index: number): void {
    this.fotosForm[preguntaId]?.splice(index, 1);
    this.fotosPreview[preguntaId]?.splice(index, 1);
  }

  guardarProgreso(): void {
    this.guardando = true;
    const respuestas = Object.values(this.respuestasForm).map((r: any) => ({
      preguntaId: r.preguntaId,
      seccionId: r.seccionId,
      valor: r.valor || null,
      observacion: r.observacion || null,
      omitida: r.omitida || false,
    }));

    this.ssgtService.guardarRespuestasPorToken(this.token, respuestas).subscribe({
      next: (res) => {
        // Subir fotos pendientes
        this.subirFotosPendientes().then(() => {
          this.guardando = false;
          Swal.fire({
            title: 'Guardado',
            html: `Progreso guardado.<br>Puntaje: ${res.porcentaje.toFixed(1)}%${res.accionesCreadas > 0 ? `<br><b>${res.accionesCreadas} acciones correctivas</b> creadas automáticamente` : ''}`,
            icon: 'success',
            confirmButtonText: 'OK',
          });
        });
      },
      error: (err) => {
        this.guardando = false;
        Swal.fire('Error', err.error?.msg || 'Error al guardar', 'error');
      },
    });
  }

  async subirFotosPendientes(): Promise<void> {
    for (const preguntaIdStr of Object.keys(this.fotosForm)) {
      const preguntaId = parseInt(preguntaIdStr);
      const fotos = this.fotosForm[preguntaId];
      if (!fotos || fotos.length === 0) continue;

      const resp = this.respuestasForm[preguntaId];
      if (!resp?.id) continue;

      try {
        await this.ssgtService.subirFotosPorToken(this.token, resp.id, fotos).toPromise();
        this.fotosForm[preguntaId] = [];
      } catch (err) {
        console.error('Error subiendo fotos para pregunta', preguntaId, err);
      }
    }
  }

  completarInspeccion(): void {
    Swal.fire({
      title: '¿Completar inspección?',
      text: 'Una vez completada no podrá ser modificada',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Completar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#27ae60',
    }).then((result) => {
      if (result.isConfirmed) {
        this.guardando = true;
        // Guardar respuestas primero
        const respuestas = Object.values(this.respuestasForm).map((r: any) => ({
          preguntaId: r.preguntaId,
          seccionId: r.seccionId,
          valor: r.valor || null,
          observacion: r.observacion || null,
          omitida: r.omitida || false,
        }));

        this.ssgtService.guardarRespuestasPorToken(this.token, respuestas).subscribe({
          next: (res) => {
            this.subirFotosPendientes().then(() => {
              this.ssgtService.completarInspeccionPorToken(this.token).subscribe({
                next: () => {
                  this.guardando = false;
                  Swal.fire({
                    title: 'Inspección completada',
                    html: `<b>${res.porcentaje.toFixed(1)}%</b> - ${res.aprobada ? 'APROBADA' : 'NO APROBADA'}${res.accionesCreadas > 0 ? `<br>${res.accionesCreadas} acciones correctivas creadas` : ''}`,
                    icon: res.aprobada ? 'success' : 'warning',
                    confirmButtonText: 'OK',
                  });
                  this.inspeccion.estado = 'completada';
                },
                error: (err) => {
                  this.guardando = false;
                  Swal.fire('Error', err.error?.msg || 'Error al completar', 'error');
                },
              });
            });
          },
          error: (err) => {
            this.guardando = false;
            Swal.fire('Error', err.error?.msg || 'Error al guardar respuestas', 'error');
          },
        });
      }
    });
  }

  getOpcionesArray(opciones: string): string[] {
    try {
      return JSON.parse(opciones);
    } catch {
      return opciones.split(',').map((o: string) => o.trim());
    }
  }
}
