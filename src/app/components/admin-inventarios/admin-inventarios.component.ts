import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../navbar/navbar.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { InventarioAdminService } from '../../services/inventario-admin.service';

interface ItemNuevo {
  nombre: string;
  descripcion: string;
  categoria: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  ubicacion: string;
}

interface CampoNuevo {
  nombre: string;
  clave: string;
  tipo_campo: 'texto' | 'numero' | 'fecha' | 'booleano';
  requerido: boolean;
}

@Component({
  selector: 'app-admin-inventarios',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SpinnerComponent],
  templateUrl: './admin-inventarios.component.html',
  styleUrl: './admin-inventarios.component.css',
})
export class AdminInventariosComponent implements OnInit {
  seccion: 'catalogo' | 'crear' = 'catalogo';

  // ─── CATÁLOGO ───────────────────────────────────────────────────────────────
  catalogoDispositivos: any[] = [];
  catalogoMobiliario: any[] = [];
  catalogoTipos: any[] = [];
  loadingCatalogo = false;
  mostrarOcultos = false;
  subSeccionCatalogo = 'dispositivos';
  editandoCatalogo: { tipo: 'dispositivo' | 'mobiliario' | 'consumible'; item: any } | null = null;
  formCatalogo: Record<string, any> = {};

  // ─── GESTIÓN DE CAMPOS (catálogo - inventarios existentes) ──────────────────
  tipoGestionandoCampos: any | null = null;
  camposDelTipo: any[] = [];
  loadingCampos = false;
  formCampoNuevo: CampoNuevo = { nombre: '', clave: '', tipo_campo: 'texto', requerido: false };
  guardandoCampo = false;
  campoEditando: any | null = null;

  // ─── CREACIÓN DE INVENTARIOS ─────────────────────────────────────────────────
  tiposExistentes: any[] = [];
  loadingTipos = false;
  creando = false;

  formInventario = { nombre: '', codigo: '', descripcion: '' };
  camposNuevo: CampoNuevo[] = [];
  items: ItemNuevo[] = [];
  erroresCrear: string[] = [];

  constructor(
    private invAdminService: InventarioAdminService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.cargarCatalogo();
    this.cargarTipos();
  }

  // ─── CATÁLOGO ───────────────────────────────────────────────────────────────

  cargarCatalogo() {
    this.loadingCatalogo = true;
    this.invAdminService.getCatalogo().subscribe({
      next: data => {
        this.catalogoDispositivos = data.dispositivos;
        this.catalogoMobiliario = data.mobiliario;
        this.catalogoTipos = data.tiposInventario;
        this.loadingCatalogo = false;
      },
      error: () => { this.toastr.error('Error al cargar catálogo'); this.loadingCatalogo = false; },
    });
  }

  get dispositivosVisibles() {
    return this.mostrarOcultos
      ? this.catalogoDispositivos
      : this.catalogoDispositivos.filter(d => d.estado !== 'obsoleto');
  }
  get mobiliarioVisible() {
    return this.mostrarOcultos
      ? this.catalogoMobiliario
      : this.catalogoMobiliario.filter(m => m.activo !== false);
  }
  consumiblesVisibles(tipo: any) {
    const lista = tipo.consumibles || [];
    return this.mostrarOcultos ? lista : lista.filter((c: any) => c.activo !== false);
  }

  abrirEditarCatalogo(tipo: 'dispositivo' | 'mobiliario' | 'consumible', item: any) {
    this.editandoCatalogo = { tipo, item };
    this.cerrarGestionCampos();
    if (tipo === 'dispositivo') {
      this.formCatalogo = { nombre: item.nombre, categoria: item.categoria, descripcion: item.descripcion,
        observaciones: item.observaciones, ubicacion: item.ubicacion, color: item.color,
        marca: item.marca, modelo: item.modelo };
    } else if (tipo === 'mobiliario') {
      this.formCatalogo = { nombre: item.nombre, categoria: item.categoria, descripcion: item.descripcion,
        observaciones: item.observaciones, ubicacionAlmacen: item.ubicacionAlmacen, proveedor: item.proveedor };
    } else {
      this.formCatalogo = { nombre: item.nombre, categoria: item.categoria, descripcion: item.descripcion,
        observaciones: item.observaciones, ubicacionAlmacen: item.ubicacionAlmacen, proveedor: item.proveedor,
        stockMinimo: item.stockMinimo, stockMaximo: item.stockMaximo };
    }
  }
  cancelarEditarCatalogo() { this.editandoCatalogo = null; }

  guardarCatalogo() {
    if (!this.editandoCatalogo) return;
    const { tipo, item } = this.editandoCatalogo;
    if (!this.formCatalogo['nombre'] || !String(this.formCatalogo['nombre']).trim()) {
      this.toastr.warning('El nombre no puede estar vacío');
      return;
    }
    let op$;
    if (tipo === 'dispositivo') op$ = this.invAdminService.editarDispositivo(item.id, this.formCatalogo);
    else if (tipo === 'mobiliario') op$ = this.invAdminService.editarMobiliario(item.id, this.formCatalogo);
    else op$ = this.invAdminService.editarConsumible(item.id, this.formCatalogo);
    op$.subscribe({
      next: () => { this.toastr.success('Ítem actualizado'); this.editandoCatalogo = null; this.cargarCatalogo(); },
      error: (err: any) => this.toastr.error(err?.error?.msg || 'Error al guardar'),
    });
  }

  ocultarItem(tipo: 'dispositivo' | 'mobiliario' | 'consumible', item: any) {
    Swal.fire({
      title: '¿Ocultar ítem?',
      html: `<b>${item.nombre}</b> quedará oculto pero <b>no se eliminará</b>. Se conserva toda la trazabilidad.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#e65100', confirmButtonText: 'Sí, ocultar', cancelButtonText: 'Cancelar',
    }).then(r => {
      if (!r.isConfirmed) return;
      let op$;
      if (tipo === 'dispositivo') op$ = this.invAdminService.ocultarDispositivo(item.id);
      else if (tipo === 'mobiliario') op$ = this.invAdminService.ocultarMobiliario(item.id);
      else op$ = this.invAdminService.ocultarConsumible(item.id);
      op$.subscribe({
        next: () => { this.toastr.success('Ítem ocultado'); this.cargarCatalogo(); },
        error: () => this.toastr.error('Error al ocultar'),
      });
    });
  }

  restaurarItem(tipo: 'dispositivo' | 'mobiliario' | 'consumible', item: any) {
    let op$;
    if (tipo === 'dispositivo') op$ = this.invAdminService.restaurarDispositivo(item.id);
    else if (tipo === 'mobiliario') op$ = this.invAdminService.restaurarMobiliario(item.id);
    else op$ = this.invAdminService.restaurarConsumible(item.id);
    op$.subscribe({
      next: () => { this.toastr.success('Ítem restaurado'); this.cargarCatalogo(); },
      error: () => this.toastr.error('Error al restaurar'),
    });
  }

  // ─── GESTIÓN DE CAMPOS (inventarios existentes) ──────────────────────────────

  abrirGestionCampos(tipo: any) {
    if (this.tipoGestionandoCampos?.id === tipo.id) {
      this.cerrarGestionCampos();
      return;
    }
    this.cancelarEditarCatalogo();
    this.tipoGestionandoCampos = tipo;
    this.campoEditando = null;
    this.formCampoNuevo = { nombre: '', clave: '', tipo_campo: 'texto', requerido: false };
    this.cargarCampos(tipo.id);
  }

  cerrarGestionCampos() {
    this.tipoGestionandoCampos = null;
    this.camposDelTipo = [];
    this.campoEditando = null;
  }

  cargarCampos(tipoId: number) {
    this.loadingCampos = true;
    this.invAdminService.getCampos(tipoId).subscribe({
      next: campos => { this.camposDelTipo = campos; this.loadingCampos = false; },
      error: () => { this.toastr.error('Error al cargar campos'); this.loadingCampos = false; },
    });
  }

  generarClaveDesdeNombre(nombreStr: string): string {
    return nombreStr
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');
  }

  onNombreCampoNuevoBlur() {
    if (!this.formCampoNuevo.clave) {
      this.formCampoNuevo.clave = this.generarClaveDesdeNombre(this.formCampoNuevo.nombre);
    }
  }

  guardarCampoNuevo() {
    if (!this.tipoGestionandoCampos) return;
    if (!this.formCampoNuevo.nombre.trim()) {
      this.toastr.warning('El nombre del campo es obligatorio');
      return;
    }
    if (!this.formCampoNuevo.clave.trim() || !/^[a-z0-9_]+$/.test(this.formCampoNuevo.clave.trim())) {
      this.toastr.warning('La clave solo puede tener letras minúsculas, números y guiones bajos');
      return;
    }
    this.guardandoCampo = true;
    this.invAdminService.crearCampo({
      tipoInventarioId: this.tipoGestionandoCampos.id,
      nombre: this.formCampoNuevo.nombre.trim(),
      clave: this.formCampoNuevo.clave.trim(),
      tipo_campo: this.formCampoNuevo.tipo_campo,
      requerido: this.formCampoNuevo.requerido,
    }).subscribe({
      next: () => {
        this.toastr.success('Campo agregado');
        this.formCampoNuevo = { nombre: '', clave: '', tipo_campo: 'texto', requerido: false };
        this.guardandoCampo = false;
        this.cargarCampos(this.tipoGestionandoCampos.id);
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.msg || 'Error al crear campo');
        this.guardandoCampo = false;
      },
    });
  }

  abrirEditarCampo(campo: any) {
    this.campoEditando = { ...campo };
  }

  guardarCampoEditado() {
    if (!this.campoEditando) return;
    this.invAdminService.actualizarCampo(this.campoEditando.id, {
      nombre: this.campoEditando.nombre,
      tipo_campo: this.campoEditando.tipo_campo,
      requerido: this.campoEditando.requerido,
    }).subscribe({
      next: () => {
        this.toastr.success('Campo actualizado');
        this.campoEditando = null;
        this.cargarCampos(this.tipoGestionandoCampos.id);
      },
      error: (err: any) => this.toastr.error(err?.error?.msg || 'Error al actualizar campo'),
    });
  }

  eliminarCampo(campo: any) {
    Swal.fire({
      title: '¿Eliminar campo?',
      html: `El campo <b>${campo.nombre}</b> será eliminado permanentemente.<br>Los ítems que tengan datos en este campo perderán esa información.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#dc3545', confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar',
    }).then(r => {
      if (!r.isConfirmed) return;
      this.invAdminService.eliminarCampo(campo.id).subscribe({
        next: () => {
          this.toastr.success('Campo eliminado');
          this.cargarCampos(this.tipoGestionandoCampos.id);
        },
        error: () => this.toastr.error('Error al eliminar campo'),
      });
    });
  }

  // ─── CREACIÓN DE INVENTARIOS ─────────────────────────────────────────────────

  cargarTipos() {
    this.loadingTipos = true;
    this.invAdminService.getTiposInventario().subscribe({
      next: tipos => { this.tiposExistentes = tipos; this.loadingTipos = false; },
      error: () => { this.toastr.error('Error al cargar inventarios'); this.loadingTipos = false; },
    });
  }

  generarCodigo() {
    this.formInventario.codigo = this.generarClaveDesdeNombre(this.formInventario.nombre);
  }

  // ─── CAMPOS DEL NUEVO INVENTARIO ─────────────────────────────────────────────

  agregarCampoNuevo() {
    this.camposNuevo.push({ nombre: '', clave: '', tipo_campo: 'texto', requerido: false });
  }

  quitarCampoNuevo(i: number) {
    this.camposNuevo.splice(i, 1);
  }

  onNombreCampoNuevoCrearBlur(campo: CampoNuevo) {
    if (!campo.clave) {
      campo.clave = this.generarClaveDesdeNombre(campo.nombre);
    }
  }

  // ─── ÍTEMS INICIALES ─────────────────────────────────────────────────────────

  agregarItem() {
    this.items.push({ nombre: '', descripcion: '', categoria: '', unidadMedida: 'unidad', stockActual: 0, stockMinimo: 0, stockMaximo: 0, ubicacion: '' });
  }

  quitarItem(i: number) {
    this.items.splice(i, 1);
  }

  private validarCrear(): boolean {
    this.erroresCrear = [];
    if (!this.formInventario.nombre.trim()) this.erroresCrear.push('El nombre del inventario es obligatorio.');
    if (!this.formInventario.codigo.trim()) this.erroresCrear.push('El código es obligatorio.');
    if (!/^[a-z0-9_]+$/.test(this.formInventario.codigo.trim()))
      this.erroresCrear.push('El código solo puede tener letras minúsculas, números y guiones bajos.');
    if (this.tiposExistentes.some(t => t.codigo === this.formInventario.codigo.trim()))
      this.erroresCrear.push(`Ya existe un inventario con el código "${this.formInventario.codigo}".`);
    this.camposNuevo.forEach((c, idx) => {
      if (!c.nombre.trim()) this.erroresCrear.push(`El campo #${idx + 1} debe tener nombre.`);
      if (!c.clave.trim() || !/^[a-z0-9_]+$/.test(c.clave.trim()))
        this.erroresCrear.push(`El campo #${idx + 1} tiene clave inválida (solo minúsculas, números y _).`);
    });
    this.items.forEach((it, idx) => {
      if (!it.nombre.trim()) this.erroresCrear.push(`El ítem #${idx + 1} debe tener nombre.`);
    });
    return this.erroresCrear.length === 0;
  }

  crearInventario() {
    if (!this.validarCrear()) return;
    this.creando = true;
    this.invAdminService.crearInventarioCompleto({
      nombre: this.formInventario.nombre.trim(),
      codigo: this.formInventario.codigo.trim(),
      descripcion: this.formInventario.descripcion.trim(),
      campos: this.camposNuevo,
      items: this.items,
    } as any).subscribe({
      next: (r: any) => {
        this.toastr.success(r.msg || 'Inventario creado');
        this.creando = false;
        this.resetFormCrear();
        this.cargarTipos();
        this.cargarCatalogo();
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.msg || 'Error al crear el inventario');
        this.creando = false;
      },
    });
  }

  private resetFormCrear() {
    this.formInventario = { nombre: '', codigo: '', descripcion: '' };
    this.camposNuevo = [];
    this.items = [];
    this.erroresCrear = [];
  }

  tipoCampoLabel(tipo: string): string {
    const labels: Record<string, string> = { texto: 'Texto', numero: 'Número', fecha: 'Fecha', booleano: 'Sí/No' };
    return labels[tipo] || tipo;
  }
}
