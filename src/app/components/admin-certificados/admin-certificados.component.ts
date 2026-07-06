import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../navbar/navbar.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { ConfigEmpresaService, ConfigEmpresa } from '../../services/config-empresa.service';
import {
  PlantillaCertificadoService,
  PlantillaCertificado,
  VARIABLES_DISPONIBLES,
} from '../../services/plantilla-certificado.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-admin-certificados',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SpinnerComponent],
  templateUrl: './admin-certificados.component.html',
  styleUrl: './admin-certificados.component.css',
})
export class AdminCertificadosComponent implements OnInit {
  // ---- Pestaña principal ----
  seccionActiva: 'empresas' | 'plantillas' = 'empresas';

  // ---- Empresas ----
  empresas: ConfigEmpresa[] = [];
  empresaActiva: ConfigEmpresa | null = null;
  tabEmpresa: 'AP' | 'AT' | 'ME' = 'AP';
  guardando = false;
  apiUrl = environment.apiUrl;

  // ---- Plantillas de certificado ----
  plantillas: PlantillaCertificado[] = [];
  plantillaSeleccionada: PlantillaCertificado | null = null;
  editandoPlantilla: PlantillaCertificado | null = null;
  creandoNueva = false;
  guardandoPlantilla = false;
  variablesDisponibles = VARIABLES_DISPONIBLES;

  @ViewChild('cuerpoTextarea') cuerpoTextarea!: ElementRef<HTMLTextAreaElement>;

  loading = false;

  constructor(
    private empresaService: ConfigEmpresaService,
    private plantillaService: PlantillaCertificadoService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.cargarEmpresas();
    this.cargarPlantillas();
  }

  // ---- Empresas ----

  cargarEmpresas() {
    this.loading = true;
    this.empresaService.getAll().subscribe({
      next: data => {
        this.empresas = data;
        this.seleccionarTabEmpresa('AP');
        this.loading = false;
      },
      error: () => { this.toastr.error('Error al cargar configuración de empresas'); this.loading = false; },
    });
  }

  seleccionarTabEmpresa(codigo: 'AP' | 'AT' | 'ME') {
    this.tabEmpresa = codigo;
    this.empresaActiva = { ...(this.empresas.find(e => e.codigo === codigo) || {} as ConfigEmpresa) };
  }

  guardarEmpresa() {
    if (!this.empresaActiva) return;
    this.guardando = true;
    this.empresaService.update(this.empresaActiva.codigo, this.empresaActiva).subscribe({
      next: () => { this.toastr.success('Configuración guardada'); this.guardando = false; this.cargarEmpresas(); },
      error: () => { this.toastr.error('Error al guardar'); this.guardando = false; },
    });
  }

  onLogoChange(event: Event, tipo: 'logo' | 'watermark') {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.empresaActiva) return;
    const file = input.files[0];
    this.empresaService.uploadImagen(this.empresaActiva.codigo, file, tipo).subscribe({
      next: (r: any) => {
        this.toastr.success('Imagen actualizada');
        if (tipo === 'logo') this.empresaActiva!.logo_url = r.filename;
        else this.empresaActiva!.watermark_url = r.filename;
      },
      error: () => this.toastr.error('Error al subir imagen'),
    });
  }

  logoPath(filename: string): string {
    return `${this.apiUrl}/public/${filename}`;
  }

  // ---- Plantillas ----

  cargarPlantillas() {
    this.plantillaService.getAll().subscribe({
      next: data => { this.plantillas = data; },
      error: () => this.toastr.error('Error al cargar plantillas'),
    });
  }

  seleccionarPlantilla(p: PlantillaCertificado) {
    this.creandoNueva = false;
    this.plantillaSeleccionada = p;
    this.editandoPlantilla = { ...p };
  }

  nuevaPlantilla() {
    this.plantillaSeleccionada = null;
    this.creandoNueva = true;
    this.editandoPlantilla = {
      codigo: '',
      nombre: '',
      titulo: '',
      descripcion: '',
      cuerpo: '',
      variables_disponibles: [...this.variablesDisponibles.map(v => v.key)],
      activo: true,
      orden: 99,
    };
  }

  cancelarEdicion() {
    this.creandoNueva = false;
    this.editandoPlantilla = this.plantillaSeleccionada ? { ...this.plantillaSeleccionada } : null;
  }

  insertarVariable(key: string) {
    if (!this.editandoPlantilla) return;
    const textarea = this.cuerpoTextarea?.nativeElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const texto = this.editandoPlantilla.cuerpo;
      this.editandoPlantilla.cuerpo = texto.substring(0, start) + `{{${key}}}` + texto.substring(end);
      setTimeout(() => {
        const nuevaPos = start + key.length + 4;
        textarea.setSelectionRange(nuevaPos, nuevaPos);
        textarea.focus();
      });
    } else {
      this.editandoPlantilla.cuerpo += `{{${key}}}`;
    }
  }

  guardarPlantilla() {
    if (!this.editandoPlantilla) return;
    const { codigo, nombre, titulo, cuerpo } = this.editandoPlantilla;
    if (!codigo.trim() || !nombre.trim() || !titulo.trim() || !cuerpo.trim()) {
      this.toastr.warning('Código, nombre, título y cuerpo son obligatorios');
      return;
    }
    this.guardandoPlantilla = true;

    if (this.creandoNueva) {
      this.plantillaService.create(this.editandoPlantilla).subscribe({
        next: (nueva) => {
          this.toastr.success('Plantilla creada');
          this.guardandoPlantilla = false;
          this.creandoNueva = false;
          this.cargarPlantillas();
          this.plantillaSeleccionada = nueva;
          this.editandoPlantilla = { ...nueva };
        },
        error: (err) => { this.toastr.error(err?.error?.msg || 'Error al crear plantilla'); this.guardandoPlantilla = false; },
      });
    } else if (this.plantillaSeleccionada?.id) {
      this.plantillaService.update(this.plantillaSeleccionada.id, this.editandoPlantilla).subscribe({
        next: (actualizada) => {
          this.toastr.success('Plantilla guardada');
          this.guardandoPlantilla = false;
          this.plantillaSeleccionada = actualizada;
          this.editandoPlantilla = { ...actualizada };
          this.cargarPlantillas();
        },
        error: () => { this.toastr.error('Error al guardar'); this.guardandoPlantilla = false; },
      });
    }
  }

  togglePlantilla(p: PlantillaCertificado) {
    if (!p.id) return;
    this.plantillaService.toggle(p.id).subscribe({
      next: () => { this.toastr.success(p.activo ? 'Plantilla desactivada' : 'Plantilla activada'); this.cargarPlantillas(); },
      error: () => this.toastr.error('Error al cambiar estado'),
    });
  }

  eliminarPlantilla(p: PlantillaCertificado) {
    if (!p.id) return;
    Swal.fire({
      title: '¿Eliminar plantilla?',
      html: `<b>${p.nombre}</b> se eliminará permanentemente y ya no aparecerá en el generador de certificados.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (!result.isConfirmed) return;
      this.plantillaService.delete(p.id!).subscribe({
        next: () => {
          this.toastr.success('Plantilla eliminada');
          this.plantillaSeleccionada = null;
          this.editandoPlantilla = null;
          this.cargarPlantillas();
        },
        error: () => this.toastr.error('Error al eliminar la plantilla'),
      });
    });
  }
}
