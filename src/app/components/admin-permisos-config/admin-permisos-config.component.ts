import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../navbar/navbar.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { TipoPermisoService, TipoPermiso } from '../../services/tipo-permiso.service';

@Component({
  selector: 'app-admin-permisos-config',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SpinnerComponent],
  templateUrl: './admin-permisos-config.component.html',
  styleUrl: './admin-permisos-config.component.css',
})
export class AdminPermisosConfigComponent implements OnInit {
  tipos: TipoPermiso[] = [];
  loading = false;
  showForm = false;
  editingId: number | null = null;

  form: TipoPermiso = this.nuevoForm();

  constructor(
    private tipoService: TipoPermisoService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading = true;
    this.tipoService.getAllAdmin().subscribe({
      next: data => { this.tipos = data; this.loading = false; },
      error: () => { this.toastr.error('Error al cargar tipos'); this.loading = false; },
    });
  }

  nuevoForm(): TipoPermiso {
    return {
      nombre: '', descripcion: '',
      requiere_horas: false, requiere_soporte: false, requiere_fecha_fin: false,
      minimo_dias_general: undefined, minimo_dias_gestion_admin: undefined,
      es_para_cc_filtrado: false, activo: true, orden: 0,
    };
  }

  abrirNuevo() {
    this.editingId = null;
    this.form = this.nuevoForm();
    this.showForm = true;
  }

  editar(t: TipoPermiso) {
    this.editingId = t.id!;
    this.form = { ...t };
    this.showForm = true;
  }

  cancelar() { this.showForm = false; }

  guardar() {
    if (!this.form.nombre) { this.toastr.warning('El nombre es obligatorio'); return; }

    const op = this.editingId
      ? this.tipoService.update(this.editingId, this.form)
      : this.tipoService.create(this.form);

    op.subscribe({
      next: () => {
        this.toastr.success(this.editingId ? 'Tipo actualizado' : 'Tipo creado');
        this.showForm = false;
        this.cargar();
      },
      error: (e) => this.toastr.error(e.error?.msg || 'Error al guardar'),
    });
  }

  toggle(t: TipoPermiso) {
    const accion = t.activo ? 'desactivar' : 'activar';
    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} "${t.nombre}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    }).then(r => {
      if (!r.isConfirmed) return;
      this.tipoService.toggle(t.id!).subscribe({
        next: () => { this.toastr.success('Estado actualizado'); this.cargar(); },
        error: () => this.toastr.error('Error'),
      });
    });
  }

  moverArriba(idx: number) {
    if (idx === 0) return;
    [this.tipos[idx - 1], this.tipos[idx]] = [this.tipos[idx], this.tipos[idx - 1]];
    this.guardarOrden();
  }

  moverAbajo(idx: number) {
    if (idx === this.tipos.length - 1) return;
    [this.tipos[idx + 1], this.tipos[idx]] = [this.tipos[idx], this.tipos[idx + 1]];
    this.guardarOrden();
  }

  guardarOrden() {
    const orden = this.tipos.map((t, i) => ({ id: t.id!, orden: i + 1 }));
    this.tipoService.reorder(orden).subscribe({
      next: () => this.toastr.success('Orden guardado'),
      error: () => this.toastr.error('Error al guardar orden'),
    });
  }
}
