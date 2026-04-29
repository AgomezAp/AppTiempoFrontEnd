import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { EvaluacionesService } from '../../services/evaluaciones.service';
import { UserService } from '../../services/user.service';
import { AreaService } from '../../services/area.service';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../navbar/navbar.component';

Chart.register(...registerables);

@Component({
  selector: 'app-evaluaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, BaseChartDirective, NavbarComponent],
  templateUrl: './evaluaciones.component.html',
  styleUrls: ['./evaluaciones.component.css']
})
export class EvaluacionesComponent implements OnInit {

  // ============================================================
  // Estado general
  // ============================================================
  seccionActiva: 'dashboard' | 'lista' | 'detalle' | 'config' = 'dashboard';
  cargando = false;
  modoAdmin = false;
  uidActual = 0;

  // Listados
  periodos: any[] = [];
  categorias: any[] = [];
  evaluaciones: any[] = [];
  colaboradores: any[] = [];
  areas: any[] = [];

  // Selecciones de filtro
  periodoSeleccionado: number | null = null;
  areaSeleccionada: number | null = null;
  colaboradorSeleccionado: number | null = null;

  // Evaluación en detalle
  evaluacionDetalle: any = null;
  calificaciones: { [criterioId: number]: number } = {};
  comentarios: { [criterioId: number]: string } = {};
  objetivos: any[] = [];

  // Formularios
  formPeriodo: FormGroup;
  formCategoria: FormGroup;
  formCriterio!: FormGroup;
  formNuevaEvaluacion: FormGroup;
  formCompletar: FormGroup;
  mostrarModal = '';
  categoriaParaCriterio: any = null;

  // ============================================================
  // Gráficas (ng2-charts / Chart.js)
  // ============================================================

  // 1. RADAR — Perfil de competencias
  radarData: ChartData<'radar'> = { labels: [], datasets: [] };
  radarOptions: ChartOptions<'radar'> = {
    responsive: true,
    scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } },
    plugins: { legend: { position: 'top' }, tooltip: { enabled: true } }
  };

  // 2. BARRAS — Comparativo por área
  barrasData: ChartData<'bar'> = { labels: [], datasets: [] };
  barrasOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } }
  };

  // 3. LÍNEA — Evolución histórica
  lineaData: ChartData<'line'> = { labels: [], datasets: [] };
  lineaOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { min: 0, max: 5 } }
  };

  // 4. TORTA — Distribución de calificaciones
  tortaData: ChartData<'pie'> = { labels: [], datasets: [] };
  tortaOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: { legend: { position: 'right' } }
  };

  // 5. GAUGE — Calificación total (simulado con doughnut)
  gaugeData: ChartData<'doughnut'> = {
    labels: ['Calificación', 'Restante'],
    datasets: [{ data: [0, 5], backgroundColor: ['#198754', '#e9ecef'], borderWidth: 0 }]
  };
  gaugeOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    circumference: 180,
    rotation: -90,
    cutout: '75%',
    plugins: { legend: { display: false }, tooltip: { enabled: false } }
  };

  // KPIs del dashboard
  kpiDashboard: any = null;

  constructor(
    private evaluacionesService: EvaluacionesService,
    private userService: UserService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.formPeriodo = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      estado: ['configuracion'],
      empresa: ['']
    });

    this.formCategoria = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      peso_porcentaje: [100, [Validators.required, Validators.min(1), Validators.max(100)]],
      orden: [0]
    });

    this.formCriterio = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      escala_min: [1], escala_max: [5],
      peso_porcentaje: [100, [Validators.required, Validators.min(1), Validators.max(100)]],
      orden: [0]
    });

    this.formNuevaEvaluacion = this.fb.group({
      evaluado_uid: ['', Validators.required],
      evaluador_uid: ['', Validators.required],
      periodo_id: ['', Validators.required]
    });

    this.formCompletar = this.fb.group({
      fortalezas: [''], areas_mejora: [''], compromisos: [''],
      plan_mejora: [''], observaciones: ['']
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.modoAdmin = payload.role === 'Admin' || payload.role === 'Tecnologia';
        this.uidActual = payload.Uid || payload.uid || 0;
      } catch {}
    }

    // Si hay ID en la URL, abrir detalle
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.seccionActiva = 'detalle';
      this.cargarDetalle(parseInt(idParam));
    }

    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.evaluacionesService.listarPeriodos().subscribe(p => {
      this.periodos = p;
      if (p.length > 0 && !this.periodoSeleccionado) {
        this.periodoSeleccionado = p[0].id;
        this.cargarDashboard();
        this.cargarListaEvaluaciones();
      }
    });
    this.evaluacionesService.listarCategorias().subscribe(c => this.categorias = c);
    this.userService.getAllUsers().subscribe(u => this.colaboradores = u);
  }

  // ============================================================
  // DASHBOARD
  // ============================================================
  cargarDashboard(): void {
    if (!this.periodoSeleccionado) return;
    this.cargando = true;
    this.evaluacionesService.obtenerDashboard(this.periodoSeleccionado).subscribe({
      next: (data) => {
        this.kpiDashboard = data;
        this.construirTorta(data);
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  construirTorta(data: any): void {
    if (!data?.distribucion) return;
    this.tortaData = {
      labels: data.distribucion.map((d: any) => `${d.area} (${d.promedio.toFixed(1)})`),
      datasets: [{
        data: data.distribucion.map((d: any) => parseFloat(d.promedio.toFixed(2))),
        backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#0dcaf0', '#fd7e14']
      }]
    };
  }

  // ============================================================
  // GRÁFICA RADAR
  // ============================================================
  cargarGraficaRadar(): void {
    if (!this.colaboradorSeleccionado || !this.periodoSeleccionado) return;
    this.evaluacionesService.obtenerGraficaRadar(this.colaboradorSeleccionado, this.periodoSeleccionado).subscribe({
      next: (data) => {
        this.radarData = {
          labels: data.categorias.map((c: any) => c.nombre),
          datasets: [{
            label: data.colaborador,
            data: data.categorias.map((c: any) => c.promedio),
            backgroundColor: 'rgba(13,110,253,0.2)',
            borderColor: '#0d6efd',
            pointBackgroundColor: '#0d6efd'
          }]
        };
        // Actualizar gauge con calificación final
        if (data.calificacion_final !== undefined) {
          this.actualizarGauge(parseFloat(data.calificacion_final));
        }
      },
      error: () => Swal.fire('Aviso', 'El colaborador no tiene evaluación en este periodo', 'info')
    });
    // Evolución histórica del mismo colaborador
    this.evaluacionesService.obtenerGraficaEvolucion(this.colaboradorSeleccionado).subscribe({
      next: (data) => {
        this.lineaData = {
          labels: data.periodos.map((p: any) => p.periodo),
          datasets: [{
            label: 'Calificación histórica',
            data: data.periodos.map((p: any) => p.calificacion),
            borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.1)',
            fill: true, tension: 0.4, pointRadius: 5
          }]
        };
      }
    });
  }

  actualizarGauge(valor: number): void {
    const max = 5;
    const restante = Math.max(0, max - valor);
    const color = valor >= 4 ? '#198754' : valor >= 3 ? '#ffc107' : '#dc3545';
    this.gaugeData = {
      labels: ['Calificación', 'Restante'],
      datasets: [{ data: [valor, restante], backgroundColor: [color, '#e9ecef'], borderWidth: 0 }]
    };
  }

  // ============================================================
  // GRÁFICA COMPARATIVO ÁREA
  // ============================================================
  cargarComparativoArea(): void {
    if (!this.areaSeleccionada || !this.periodoSeleccionado) return;
    this.evaluacionesService.obtenerGraficaComparativoArea(this.areaSeleccionada, this.periodoSeleccionado).subscribe({
      next: (data) => {
        this.barrasData = {
          labels: data.colaboradores.map((c: any) => `${c.name} ${c.lastName}`),
          datasets: [{
            label: 'Calificación promedio',
            data: data.colaboradores.map((c: any) => c.calificacion),
            backgroundColor: data.colaboradores.map((c: any) =>
              c.calificacion >= 4 ? '#198754' : c.calificacion >= 3 ? '#ffc107' : '#dc3545'
            )
          }]
        };
      }
    });
  }

  // ============================================================
  // LISTA DE EVALUACIONES
  // ============================================================
  cargarListaEvaluaciones(): void {
    if (!this.periodoSeleccionado) return;
    this.evaluacionesService.listarEvaluacionesPeriodo(this.periodoSeleccionado).subscribe({
      next: (evs) => this.evaluaciones = evs,
      error: () => {}
    });
  }

  // ============================================================
  // DETALLE DE EVALUACIÓN
  // ============================================================
  cargarDetalle(id: number): void {
    this.cargando = true;
    this.evaluacionesService.obtenerEvaluacion(id).subscribe({
      next: (ev) => {
        this.evaluacionDetalle = ev;
        // Prellenar calificaciones existentes
        (ev.calificaciones || []).forEach((cal: any) => {
          this.calificaciones[cal.criterio_id] = cal.calificacion;
          this.comentarios[cal.criterio_id] = cal.comentario || '';
        });
        this.objetivos = ev.objetivos || [];
        this.formCompletar.patchValue({
          fortalezas: ev.fortalezas,
          areas_mejora: ev.areas_mejora,
          compromisos: ev.compromisos,
          plan_mejora: ev.plan_mejora,
          observaciones: ev.observaciones
        });
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  abrirDetalle(evaluacion: any): void {
    this.seccionActiva = 'detalle';
    this.router.navigate(['/evaluaciones', evaluacion.id]);
    this.cargarDetalle(evaluacion.id);
  }

  guardarCalificaciones(): void {
    const payload = Object.entries(this.calificaciones).map(([criterio_id, calificacion]) => ({
      criterio_id: parseInt(criterio_id), calificacion,
      comentario: this.comentarios[parseInt(criterio_id)] || ''
    }));
    this.evaluacionesService.guardarCalificaciones(this.evaluacionDetalle.id, payload).subscribe({
      next: (res) => {
        Swal.fire('Guardado', `Calificaciones guardadas. Promedio: ${res.calificacion_final}`, 'success');
        this.cargarDetalle(this.evaluacionDetalle.id);
      },
      error: (e) => Swal.fire('Error', e.error?.msg, 'error')
    });
  }

  completarEvaluacion(): void {
    const datos = this.formCompletar.value;
    this.evaluacionesService.completarEvaluacion(this.evaluacionDetalle.id, datos).subscribe({
      next: () => {
        Swal.fire('Completada', 'Evaluación marcada como completada', 'success');
        this.cargarDetalle(this.evaluacionDetalle.id);
      },
      error: (e) => Swal.fire('Error', e.error?.msg, 'error')
    });
  }

  descargarPdf(): void {
    if (!this.evaluacionDetalle) return;
    this.evaluacionesService.generarPdf(this.evaluacionDetalle.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evaluacion_${this.evaluacionDetalle.id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error', 'No se pudo generar el PDF', 'error')
    });
  }

  // ============================================================
  // GESTIÓN DE PERÍODOS Y CATEGORÍAS (solo Admin)
  // ============================================================
  abrirModal(tipo: string, extra?: any): void {
    this.mostrarModal = tipo;
    if (tipo === 'criterio' && extra) this.categoriaParaCriterio = extra;
  }
  cerrarModal(): void { this.mostrarModal = ''; this.categoriaParaCriterio = null; }

  guardarPeriodo(): void {
    if (this.formPeriodo.invalid) { this.formPeriodo.markAllAsTouched(); return; }
    this.evaluacionesService.crearPeriodo(this.formPeriodo.value).subscribe({
      next: () => { Swal.fire('Éxito', 'Período creado', 'success'); this.cerrarModal(); this.cargarDatosIniciales(); },
      error: (e) => Swal.fire('Error', e.error?.msg, 'error')
    });
  }

  guardarCategoria(): void {
    if (this.formCategoria.invalid) { this.formCategoria.markAllAsTouched(); return; }
    this.evaluacionesService.crearCategoria(this.formCategoria.value).subscribe({
      next: () => { Swal.fire('Éxito', 'Categoría creada', 'success'); this.cerrarModal(); this.cargarDatosIniciales(); },
      error: (e) => Swal.fire('Error', e.error?.msg, 'error')
    });
  }

  guardarCriterio(): void {
    if (this.formCriterio.invalid) { this.formCriterio.markAllAsTouched(); return; }
    this.evaluacionesService.crearCriterio(this.categoriaParaCriterio.id, this.formCriterio.value).subscribe({
      next: () => { Swal.fire('Éxito', 'Criterio creado', 'success'); this.cerrarModal(); this.cargarDatosIniciales(); },
      error: (e) => Swal.fire('Error', e.error?.msg, 'error')
    });
  }

  crearEvaluacion(): void {
    if (this.formNuevaEvaluacion.invalid) { this.formNuevaEvaluacion.markAllAsTouched(); return; }
    this.evaluacionesService.crearEvaluacion(this.formNuevaEvaluacion.value).subscribe({
      next: () => { Swal.fire('Éxito', 'Evaluación creada', 'success'); this.cerrarModal(); this.cargarListaEvaluaciones(); },
      error: (e) => Swal.fire('Error', e.error?.msg, 'error')
    });
  }

  // ============================================================
  // Helpers
  // ============================================================
  get calificacionFinalActual(): number {
    return parseFloat(this.evaluacionDetalle?.calificacion_final || '0') || 0;
  }

  colorCalificacion(val: number): string {
    if (val >= 4.5) return 'text-success fw-bold';
    if (val >= 3.5) return 'text-primary fw-bold';
    if (val >= 2.5) return 'text-warning fw-bold';
    return 'text-danger fw-bold';
  }

  etiquetaEstado(estado: string): string {
    const mapa: Record<string, string> = {
      pendiente: 'Pendiente', en_proceso: 'En proceso',
      completada: 'Completada', revisada: 'Revisada', aprobada: 'Aprobada'
    };
    return mapa[estado] || estado;
  }

  claseEstado(estado: string): string {
    const mapa: Record<string, string> = {
      pendiente: 'badge bg-warning text-dark', en_proceso: 'badge bg-info text-dark',
      completada: 'badge bg-primary', revisada: 'badge bg-secondary', aprobada: 'badge bg-success'
    };
    return mapa[estado] || 'badge bg-secondary';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  agregarObjetivo(): void {
    this.objetivos.push({ descripcion: '', meta_esperada: '', resultado_obtenido: '', peso_porcentaje: 10, cumplimiento_porcentaje: 0, observaciones: '' });
  }
  eliminarObjetivo(idx: number): void {
    this.objetivos.splice(idx, 1);
  }
  guardarObjetivos(): void {
    this.evaluacionesService.guardarObjetivos(this.evaluacionDetalle.id, this.objetivos).subscribe({
      next: () => Swal.fire('Éxito', 'Objetivos guardados', 'success')
    });
  }

  cambiarPeriodo(): void {
    this.cargarDashboard();
    this.cargarListaEvaluaciones();
  }
}
