import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../navbar/navbar.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { DestinatarioPermisoService, DestinatarioPermiso } from '../../services/destinatario-permiso.service';
import { TipoPermisoService, TipoPermiso } from '../../services/tipo-permiso.service';

@Component({
  selector: 'app-admin-destinatarios',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SpinnerComponent],
  templateUrl: './admin-destinatarios.component.html',
  styleUrl: './admin-destinatarios.component.css',
})
export class AdminDestinatariosComponent implements OnInit {
  destinatarios: DestinatarioPermiso[] = [];
  tiposPermiso: TipoPermiso[] = [];
  loading = false;
  esAdmin = false;

  showForm = false;
  editingId: number | null = null;

  form: DestinatarioPermiso = {
    email: '',
    nombre: '',
    tipo: 'fijo',
    tipos_permiso: [],
    es_cc: false,
    activo: true,
  };

  constructor(
    private destinatarioService: DestinatarioPermisoService,
    private tipoService: TipoPermisoService,
    private toastr: ToastrService,
  ) {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.esAdmin = payload.role === 'Admin';
      }
    } catch { this.esAdmin = false; }
  }

  ngOnInit() {
    this.cargar();
    this.tipoService.getAllAdmin().subscribe({ next: t => this.tiposPermiso = t });
  }

  cargar() {
    this.loading = true;
    this.destinatarioService.getAll().subscribe({
      next: data => { this.destinatarios = data; this.loading = false; },
      error: () => { this.toastr.error('Error al cargar destinatarios'); this.loading = false; },
    });
  }

  abrirNuevo() {
    this.editingId = null;
    this.form = { email: '', nombre: '', tipo: 'fijo', tipos_permiso: [], es_cc: false, activo: true };
    this.showForm = true;
  }

  editar(d: DestinatarioPermiso) {
    this.editingId = d.id!;
    this.form = { ...d, tipos_permiso: [...(d.tipos_permiso || [])] };
    this.showForm = true;
  }

  cancelar() { this.showForm = false; }

  guardar() {
    if (!this.form.email) { this.toastr.warning('El email es obligatorio'); return; }

    const op = this.editingId
      ? this.destinatarioService.update(this.editingId, this.form)
      : this.destinatarioService.create(this.form);

    op.subscribe({
      next: () => {
        this.toastr.success(this.editingId ? 'Destinatario actualizado' : 'Destinatario creado');
        this.showForm = false;
        this.cargar();
      },
      error: () => this.toastr.error('Error al guardar'),
    });
  }

  toggle(d: DestinatarioPermiso) {
    this.destinatarioService.toggle(d.id!).subscribe({
      next: () => { this.toastr.success('Estado actualizado'); this.cargar(); },
      error: () => this.toastr.error('Error al cambiar estado'),
    });
  }

  eliminar(d: DestinatarioPermiso) {
    Swal.fire({
      title: '¿Eliminar destinatario?',
      text: d.email,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(r => {
      if (!r.isConfirmed) return;
      this.destinatarioService.delete(d.id!).subscribe({
        next: () => { this.toastr.success('Eliminado'); this.cargar(); },
        error: () => this.toastr.error('Error al eliminar'),
      });
    });
  }

  toggleTipoFiltrado(nombre: string) {
    const idx = this.form.tipos_permiso.indexOf(nombre);
    if (idx >= 0) {
      this.form.tipos_permiso = this.form.tipos_permiso.filter((_, i) => i !== idx);
    } else {
      this.form.tipos_permiso = [...this.form.tipos_permiso, nombre];
    }
  }

  tipoSeleccionado(nombre: string): boolean {
    return this.form.tipos_permiso.includes(nombre);
  }

  get fijosList() { return this.destinatarios.filter(d => d.tipo === 'fijo'); }
  get filtradosList() { return this.destinatarios.filter(d => d.tipo === 'filtrado'); }
}
