import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContratosService, Contrato, ContratoModificacion } from '../../services/contratos.service';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule,NavbarComponent],
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.css']
})
export class ContratosComponent implements OnInit {
  // Vista principal: listado de contratos vigentes o contratos de un empleado
  contratos: Contrato[] = [];
  colaboradores: any[] = [];
  cargando = false;
  modoAdmin = false;

  // Formulario nuevo contrato
  formContrato: FormGroup;
  mostrarFormContrato = false;
  editandoId: number | null = null;

  // Formulario modificación
  formModificacion: FormGroup;
  mostrarFormMod = false;
  contratoSeleccionado: Contrato | null = null;

  tiposContrato = ['termino-indefinido', 'termino-fijo', 'prestacion-servicios', 'aprendizaje', 'obra-labor'];
  tiposModificacion = ['otroSi', 'cambio_salario', 'cambio_cargo', 'prorroga', 'suspension', 'reactivacion', 'terminacion'];
  empresas = ['AP', 'AT', 'ME'];
  jornadas = ['tiempo-completo', 'medio-tiempo', 'horas'];

  constructor(
    private contratosService: ContratosService,
    private userService: UserService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.formContrato = this.fb.group({
      Uid: ['', Validators.required],
      tipo_contrato: ['termino-indefinido', Validators.required],
      numero_contrato: [''],
      fecha_inicio: ['', Validators.required],
      fecha_fin: [''],
      salario: ['', [Validators.required, Validators.min(1)]],
      cargo: ['', Validators.required],
      empresa: ['AP', Validators.required],
      area: [''],
      jornada: ['tiempo-completo'],
      lugar_trabajo: [''],
      periodo_prueba_dias: [0],
      observaciones: [''],
      documento_url: ['']
    });

    this.formModificacion = this.fb.group({
      tipo_modificacion: ['otroSi', Validators.required],
      fecha_efectiva: ['', Validators.required],
      descripcion: ['', Validators.required],
      nuevo_salario: [''],
      nuevo_cargo: [''],
      nueva_fecha_fin: [''],
      documento_url: ['']
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.modoAdmin = payload.role === 'Admin';
      } catch {}
    }
    this.cargarDatos();
    this.userService.getAllUsers().subscribe(u => this.colaboradores = u);
  }

  cargarDatos(): void {
    this.cargando = true;
    if (this.modoAdmin) {
      this.contratosService.obtenerContratosVigentes().subscribe({
        next: (contratos) => { this.contratos = contratos; this.cargando = false; },
        error: () => { this.cargando = false; }
      });
    } else {
      const uid = this.obtenerUidUsuario();
      if (uid) {
        this.contratosService.obtenerContratosEmpleado(uid).subscribe({
          next: (contratos) => { this.contratos = contratos; this.cargando = false; },
          error: () => { this.cargando = false; }
        });
      }
    }
  }

  obtenerUidUsuario(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.Uid || payload.uid || null;
    } catch { return null; }
  }

  abrirFormContrato(contrato?: Contrato): void {
    this.mostrarFormContrato = true;
    if (contrato) {
      this.editandoId = contrato.id!;
      this.formContrato.patchValue(contrato);
    } else {
      this.editandoId = null;
      this.formContrato.reset({ tipo_contrato: 'termino-indefinido', empresa: 'AP', jornada: 'tiempo-completo', periodo_prueba_dias: 0 });
    }
  }

  onColaboradorChange(uid: string): void {
    if (!uid) return;
    const col = this.colaboradores.find(c => String(c.Uid) === String(uid));
    if (!col) return;

    const patch: any = {};

    if (col.empresa) patch.empresa = col.empresa;
    if (col.cargo)   patch.cargo   = col.cargo;
    if (col.salario) patch.salario = col.salario;

    // Area: puede venir como objeto relacionado con Aname, o como string directo
    if (col.area?.Aname) {
      patch.area = col.area.Aname;
    } else if (typeof col.area === 'string' && col.area) {
      patch.area = col.area;
    }

    // Fecha de ingreso como fecha de inicio por defecto
    if (col.fechaIngreso) {
      patch.fecha_inicio = col.fechaIngreso.substring(0, 10);
    }

    // tipoContrato del usuario mapeado al campo del form
    if (col.tipoContrato) patch.tipo_contrato = col.tipoContrato;

    this.formContrato.patchValue(patch);
  }

  cerrarFormContrato(): void {
    this.mostrarFormContrato = false;
    this.editandoId = null;
    this.formContrato.reset();
  }

  guardarContrato(): void {
    if (this.formContrato.invalid) {
      this.formContrato.markAllAsTouched();
      return;
    }
    const datos = this.formContrato.value;
    const obs = this.editandoId
      ? this.contratosService.actualizarContrato(this.editandoId, datos)
      : this.contratosService.crearContrato(datos);

    obs.subscribe({
      next: () => {
        Swal.fire('Éxito', this.editandoId ? 'Contrato actualizado' : 'Contrato creado exitosamente', 'success');
        this.cerrarFormContrato();
        this.cargarDatos();
      },
      error: (err) => Swal.fire('Error', err.error?.msg || 'Error al guardar el contrato', 'error')
    });
  }

  abrirFormModificacion(contrato: Contrato): void {
    this.contratoSeleccionado = contrato;
    this.mostrarFormMod = true;
    this.formModificacion.reset({ tipo_modificacion: 'otroSi' });
  }

  cerrarFormModificacion(): void {
    this.mostrarFormMod = false;
    this.contratoSeleccionado = null;
  }

  guardarModificacion(): void {
    if (this.formModificacion.invalid) {
      this.formModificacion.markAllAsTouched();
      return;
    }
    this.contratosService.agregarModificacion(this.contratoSeleccionado!.id!, this.formModificacion.value).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Modificación registrada correctamente', 'success');
        this.cerrarFormModificacion();
        this.cargarDatos();
      },
      error: (err) => Swal.fire('Error', err.error?.msg || 'Error al registrar la modificación', 'error')
    });
  }

  descargarPdf(id: number): void {
    this.contratosService.generarPdf(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrato_${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error', 'No se pudo generar el PDF del contrato', 'error')
    });
  }

  etiquetaEstado(estado: string): string {
    const mapa: Record<string, string> = {
      activo: 'Vigente', terminado: 'Terminado', suspendido: 'Suspendido', renovado: 'Renovado'
    };
    return mapa[estado] || estado;
  }

  claseEstado(estado: string): string {
    const mapa: Record<string, string> = {
      activo: 'badge bg-success', terminado: 'badge bg-danger',
      suspendido: 'badge bg-warning text-dark', renovado: 'badge bg-info text-dark'
    };
    return mapa[estado] || 'badge bg-secondary';
  }

  formatearSalario(valor: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
