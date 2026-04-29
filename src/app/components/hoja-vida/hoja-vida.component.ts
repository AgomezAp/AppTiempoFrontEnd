import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HojaVidaService } from '../../services/hoja-vida.service';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-hoja-vida',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './hoja-vida.component.html',
  styleUrls: ['./hoja-vida.component.css']
})
export class HojaVidaComponent implements OnInit {
  uid!: number;
  colaborador: any = null;
  experiencias: any[] = [];
  formaciones: any[] = [];
  habilidades: any[] = [];
  referencias: any[] = [];
  grupoFamiliar: any[] = [];

  // Expediente - trazabilidad empresa
  permisos: any[] = [];
  novedades: any[] = [];
  actasDispositivos: any[] = [];
  actasConsumibles: any[] = [];
  actasMobiliario: any[] = [];
  documentos: any[] = [];
  notas: any[] = [];

  cargando = false;
  cargandoExpediente = false;
  generandoPdf = false;
  subiendoDoc = false;
  modoAdmin = false;
  esRRHH = false;
  puedeEditarExpediente = false;

  // Sección activa en el tab
  seccionActiva = 'personal';

  // Formularios modales
  mostrarModal = '';
  editandoId: number | null = null;

  // Subir documento
  archivoSeleccionado: File | null = null;
  nombreDocumento = '';
  descripcionDocumento = '';

  // Nota nueva
  nuevaNota = '';

  formPersonal: FormGroup;
  formExperiencia: FormGroup;
  formFormacion: FormGroup;
  formHabilidad: FormGroup;
  formReferencia: FormGroup;
  formFamiliar: FormGroup;

  nivelesFormacion = ['primaria', 'bachillerato', 'tecnico', 'tecnologo', 'universitario', 'especializacion', 'maestria', 'doctorado'];
  tiposHabilidad = ['tecnica', 'blanda', 'idioma', 'herramienta', 'software'];
  nivelesHabilidad = ['basico', 'intermedio', 'avanzado', 'experto'];
  tiposReferencia = ['personal', 'laboral'];
  parentescos = ['Padre', 'Madre', 'Hijo(a)', 'Cónyuge', 'Hermano(a)', 'Abuelo(a)', 'Otro'];

  constructor(
    private hojaVidaService: HojaVidaService,
    private userService: UserService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.formPersonal = this.fb.group({
      segundo_nombre: [''], segundo_apellido: [''],
      tipo_documento: ['CC'], fecha_nacimiento: [''], lugar_nacimiento: [''],
      genero: [''], estado_civil: [''], direccion: [''], ciudad: [''], barrio: [''],
      telefono_fijo: [''], celular: [''],
      contacto_emergencia_nombre: [''], contacto_emergencia_telefono: [''], contacto_emergencia_parentesco: [''],
      rh: [''], talla_camisa: [''], talla_pantalon: [''], talla_zapatos: [''],
      eps: [''], arl: [''], caja_compensacion: [''],
      numero_cuenta_bancaria: [''], tipo_cuenta_bancaria: [''], banco: [''],
      estado_colaborador: ['activo'], fecha_retiro: [''], motivo_retiro: ['']
    });

    this.formExperiencia = this.fb.group({
      empresa: ['', Validators.required], cargo: ['', Validators.required],
      fecha_inicio: ['', Validators.required], fecha_fin: [''],
      descripcion: [''], telefono: [''], jefe_inmediato: [''],
      motivo_retiro: [''], activo: [false]
    });

    this.formFormacion = this.fb.group({
      nivel: ['universitario', Validators.required],
      institucion: ['', Validators.required],
      titulo: [''], fecha_inicio: [''], fecha_fin: [''],
      graduado: [false], numero_tarjeta: ['']
    });

    this.formHabilidad = this.fb.group({
      habilidad: ['', Validators.required],
      tipo: ['tecnica'], nivel: ['intermedio']
    });

    this.formReferencia = this.fb.group({
      nombre: ['', Validators.required], cargo: [''],
      empresa: [''], telefono: ['', Validators.required], tipo: ['laboral']
    });

    this.formFamiliar = this.fb.group({
      nombre: ['', Validators.required], parentesco: ['', Validators.required],
      fecha_nacimiento: [''], documento: [''],
      ocupacion: [''], telefono: [''], dependiente: [false]
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.modoAdmin = payload.role === 'Admin';
        this.esRRHH = payload.role === 'RRHH' || payload.role === 'Admin';
        this.puedeEditarExpediente = this.esRRHH;
        const uidParam = this.route.snapshot.paramMap.get('uid');
        this.uid = uidParam ? parseInt(uidParam) : (payload.Uid || payload.uid);
      } catch {}
    }
    this.cargarHojaVida();
  }

  cargarHojaVida(): void {
    if (!this.uid) return;
    this.cargando = true;
    this.hojaVidaService.obtenerHojaVidaCompleta(this.uid).subscribe({
      next: (datos) => {
        this.colaborador = datos.colaborador;
        this.experiencias = datos.experiencias || [];
        this.formaciones = datos.formaciones || [];
        this.habilidades = datos.habilidades || [];
        this.referencias = datos.referencias || [];
        this.grupoFamiliar = datos.grupoFamiliar || [];
        if (this.colaborador) this.formPersonal.patchValue(this.colaborador);
        this.cargando = false;
      },
      error: () => { this.cargando = false; Swal.fire('Error', 'No se pudo cargar la hoja de vida', 'error'); }
    });
  }

  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    // Cargar datos de expediente bajo demanda
    if (seccion === 'permisos' && this.permisos.length === 0) this.cargarPermisos();
    if (seccion === 'novedades' && this.novedades.length === 0) this.cargarNovedades();
    if (seccion === 'actas' && this.actasDispositivos.length === 0 && this.actasConsumibles.length === 0) this.cargarActasInventario();
    if (seccion === 'documentos' && this.documentos.length === 0) this.cargarDocumentos();
    if (seccion === 'notas' && this.notas.length === 0) this.cargarNotas();
  }

  cargarPermisos(): void {
    this.cargandoExpediente = true;
    this.hojaVidaService.obtenerPermisos(this.uid).subscribe({
      next: (data) => { this.permisos = data; this.cargandoExpediente = false; },
      error: () => { this.cargandoExpediente = false; }
    });
  }

  cargarNovedades(): void {
    this.cargandoExpediente = true;
    this.hojaVidaService.obtenerNovedades(this.uid).subscribe({
      next: (data) => { this.novedades = data; this.cargandoExpediente = false; },
      error: () => { this.cargandoExpediente = false; }
    });
  }

  cargarActasInventario(): void {
    this.cargandoExpediente = true;
    this.hojaVidaService.obtenerActasInventario(this.uid).subscribe({
      next: (data) => {
        this.actasDispositivos = data.dispositivos || [];
        this.actasConsumibles = data.consumibles || [];
        this.actasMobiliario = data.mobiliario || [];
        this.cargandoExpediente = false;
      },
      error: () => { this.cargandoExpediente = false; }
    });
  }

  cargarDocumentos(): void {
    this.hojaVidaService.listarDocumentos(this.uid).subscribe({
      next: (data) => { this.documentos = data; },
      error: () => {}
    });
  }

  cargarNotas(): void {
    this.hojaVidaService.listarNotas(this.uid).subscribe({
      next: (data) => { this.notas = data; },
      error: () => {}
    });
  }

  // ---- Datos personales ----
  guardarPersonal(): void {
    const datos = this.formPersonal.value;
    this.userService.updateUser(this.uid, datos).subscribe({
      next: () => { Swal.fire('Éxito', 'Datos personales actualizados', 'success'); this.cargarHojaVida(); },
      error: (err) => Swal.fire('Error', err.error?.msg || 'Error al actualizar', 'error')
    });
  }

  descargarPdf(): void {
    this.generandoPdf = true;
    this.hojaVidaService.generarPdf(this.uid).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hoja_vida_${this.colaborador?.name}_${this.colaborador?.lastName}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.generandoPdf = false;
      },
      error: () => { this.generandoPdf = false; Swal.fire('Error', 'Error al generar el PDF', 'error'); }
    });
  }

  // ---- Documentos expediente ----
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      if (!this.nombreDocumento) this.nombreDocumento = input.files[0].name;
    }
  }

  subirDocumento(): void {
    if (!this.archivoSeleccionado) { Swal.fire('Error', 'Selecciona un archivo', 'error'); return; }
    const fd = new FormData();
    fd.append('archivo', this.archivoSeleccionado);
    fd.append('nombre', this.nombreDocumento || this.archivoSeleccionado.name);
    fd.append('descripcion', this.descripcionDocumento);
    this.subiendoDoc = true;
    this.hojaVidaService.subirDocumento(this.uid, fd).subscribe({
      next: () => {
        this.subiendoDoc = false;
        this.archivoSeleccionado = null;
        this.nombreDocumento = '';
        this.descripcionDocumento = '';
        this.cargarDocumentos();
        Swal.fire('Éxito', 'Documento subido correctamente', 'success');
      },
      error: () => { this.subiendoDoc = false; Swal.fire('Error', 'Error al subir el documento', 'error'); }
    });
  }

  descargarDocumento(doc: any): void {
    this.hojaVidaService.descargarDocumento(this.uid, doc.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.nombre;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error', 'No se pudo descargar el archivo', 'error')
    });
  }

  eliminarDocumentoItem(id: number): void {
    Swal.fire({ title: '¿Eliminar documento?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' }).then(r => {
      if (r.isConfirmed) {
        this.hojaVidaService.eliminarDocumento(this.uid, id).subscribe({ next: () => this.cargarDocumentos() });
      }
    });
  }

  // ---- Notas expediente ----
  agregarNota(): void {
    if (!this.nuevaNota.trim()) return;
    this.hojaVidaService.agregarNota(this.uid, this.nuevaNota.trim()).subscribe({
      next: () => { this.nuevaNota = ''; this.cargarNotas(); },
      error: () => Swal.fire('Error', 'No se pudo agregar la nota', 'error')
    });
  }

  eliminarNota(id: number): void {
    Swal.fire({ title: '¿Eliminar nota?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'No' }).then(r => {
      if (r.isConfirmed) this.hojaVidaService.eliminarNota(this.uid, id).subscribe({ next: () => this.cargarNotas() });
    });
  }

  // ---- Helpers modales ----
  abrirModal(tipo: string, registro?: any): void {
    this.mostrarModal = tipo;
    this.editandoId = registro?.id || null;
    switch (tipo) {
      case 'experiencia':
        this.formExperiencia.reset({ activo: false });
        if (registro) this.formExperiencia.patchValue(registro);
        break;
      case 'formacion':
        this.formFormacion.reset({ nivel: 'universitario', graduado: false });
        if (registro) this.formFormacion.patchValue(registro);
        break;
      case 'habilidad':
        this.formHabilidad.reset({ tipo: 'tecnica', nivel: 'intermedio' });
        break;
      case 'referencia':
        this.formReferencia.reset({ tipo: 'laboral' });
        break;
      case 'familiar':
        this.formFamiliar.reset({ dependiente: false });
        if (registro) this.formFamiliar.patchValue(registro);
        break;
    }
  }

  cerrarModal(): void {
    this.mostrarModal = '';
    this.editandoId = null;
  }

  // ---- CRUD Experiencia ----
  guardarExperiencia(): void {
    if (this.formExperiencia.invalid) { this.formExperiencia.markAllAsTouched(); return; }
    const obs = this.editandoId
      ? this.hojaVidaService.editarExperiencia(this.uid, this.editandoId, this.formExperiencia.value)
      : this.hojaVidaService.agregarExperiencia(this.uid, this.formExperiencia.value);
    obs.subscribe({ next: () => { this.cerrarModal(); this.cargarHojaVida(); }, error: (e) => Swal.fire('Error', e.error?.msg, 'error') });
  }
  eliminarExperiencia(id: number): void {
    Swal.fire({ title: '¿Eliminar experiencia?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' }).then(r => {
      if (r.isConfirmed) this.hojaVidaService.eliminarExperiencia(this.uid, id).subscribe({ next: () => this.cargarHojaVida() });
    });
  }

  // ---- CRUD Formación ----
  guardarFormacion(): void {
    if (this.formFormacion.invalid) { this.formFormacion.markAllAsTouched(); return; }
    const obs = this.editandoId
      ? this.hojaVidaService.editarFormacion(this.uid, this.editandoId, this.formFormacion.value)
      : this.hojaVidaService.agregarFormacion(this.uid, this.formFormacion.value);
    obs.subscribe({ next: () => { this.cerrarModal(); this.cargarHojaVida(); }, error: (e) => Swal.fire('Error', e.error?.msg, 'error') });
  }
  eliminarFormacion(id: number): void {
    Swal.fire({ title: '¿Eliminar formación?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'No' }).then(r => {
      if (r.isConfirmed) this.hojaVidaService.eliminarFormacion(this.uid, id).subscribe({ next: () => this.cargarHojaVida() });
    });
  }

  // ---- CRUD Habilidades ----
  guardarHabilidad(): void {
    if (this.formHabilidad.invalid) { this.formHabilidad.markAllAsTouched(); return; }
    this.hojaVidaService.agregarHabilidad(this.uid, this.formHabilidad.value).subscribe({ next: () => { this.cerrarModal(); this.cargarHojaVida(); } });
  }
  eliminarHabilidad(id: number): void {
    this.hojaVidaService.eliminarHabilidad(this.uid, id).subscribe({ next: () => this.cargarHojaVida() });
  }

  // ---- CRUD Referencias ----
  guardarReferencia(): void {
    if (this.formReferencia.invalid) { this.formReferencia.markAllAsTouched(); return; }
    this.hojaVidaService.agregarReferencia(this.uid, this.formReferencia.value).subscribe({ next: () => { this.cerrarModal(); this.cargarHojaVida(); } });
  }
  eliminarReferencia(id: number): void {
    this.hojaVidaService.eliminarReferencia(this.uid, id).subscribe({ next: () => this.cargarHojaVida() });
  }

  // ---- CRUD Grupo Familiar ----
  guardarFamiliar(): void {
    if (this.formFamiliar.invalid) { this.formFamiliar.markAllAsTouched(); return; }
    const obs = this.editandoId
      ? this.hojaVidaService.editarFamiliar(this.uid, this.editandoId, this.formFamiliar.value)
      : this.hojaVidaService.agregarFamiliar(this.uid, this.formFamiliar.value);
    obs.subscribe({ next: () => { this.cerrarModal(); this.cargarHojaVida(); } });
  }
  eliminarFamiliar(id: number): void {
    this.hojaVidaService.eliminarFamiliar(this.uid, id).subscribe({ next: () => this.cargarHojaVida() });
  }

  // ---- Helpers ----
  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    return new Date(fecha + (fecha.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  formatearFechaCorta(fecha: string | Date): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  iconoArchivo(tipo: string): string {
    if (!tipo) return 'bi-file-earmark';
    if (tipo.includes('pdf')) return 'bi-file-earmark-pdf text-danger';
    if (tipo.includes('word') || tipo.includes('document')) return 'bi-file-earmark-word text-primary';
    if (tipo.includes('sheet') || tipo.includes('excel')) return 'bi-file-earmark-excel text-success';
    if (tipo.includes('image')) return 'bi-file-earmark-image text-info';
    return 'bi-file-earmark';
  }
  calcularEdad(fechaNac: string): number {
    if (!fechaNac) return 0;
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }
}
