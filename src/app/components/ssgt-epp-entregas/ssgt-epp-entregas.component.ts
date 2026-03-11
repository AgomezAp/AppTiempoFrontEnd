import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { SsgtService } from '../../services/ssgt.service';
import { UserService } from '../../services/user.service';
import {
  EntregaEPP,
  CatalogoEPP,
  CrearEntregaEppRequest,
  FirmaEntregaEPP,
} from '../../interfaces/ssgt';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ssgt-epp-entregas',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './ssgt-epp-entregas.component.html',
  styleUrl: './ssgt-epp-entregas.component.css',
})
export class SsgtEppEntregasComponent implements OnInit {
  entregas: EntregaEPP[] = [];
  epps: CatalogoEPP[] = [];
  usuarios: any[] = [];
  loading = false;
  userId: number = 0;

  // New delivery form
  mostrarFormulario = false;
  nuevaEntrega = {
    fecha: '',
    empresa: '',
    observaciones: '',
  };
  items: { eppId: number; cantidad: number; talla: string }[] = [];
  firmantes: {
    tipo: string;
    tipoCustom: string;
    esExterno: boolean;
    usuarioId: number;
    nombreCompleto: string;
    email: string;
  }[] = [];
  tiposFirma: string[] = ['Entrega', 'Recibe', 'Testigo', 'Supervisor'];

  // Detail view
  entregaSeleccionada: EntregaEPP | null = null;
  mostrarDetalle = false;

  constructor(
    private ssgtService: SsgtService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userId')) || 0;
    this.cargarEntregas();
    this.cargarEPPs();
    this.cargarUsuarios();
  }

  cargarEntregas(): void {
    this.loading = true;
    this.ssgtService.obtenerEntregasEpp().subscribe({
      next: (data) => {
        this.entregas = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'Error al cargar entregas', 'error');
      },
    });
  }

  cargarEPPs(): void {
    this.ssgtService.obtenerEPPs(true).subscribe({
      next: (data) => (this.epps = data),
      error: () => console.error('Error al cargar EPPs'),
    });
  }

  cargarUsuarios(): void {
    this.userService.getListUser().subscribe({
      next: (users) => (this.usuarios = users),
      error: () => console.error('Error al cargar usuarios'),
    });
  }

  abrirFormulario(): void {
    this.nuevaEntrega = { fecha: '', empresa: '', observaciones: '' };
    this.items = [{ eppId: 0, cantidad: 1, talla: '' }];
    this.firmantes = [
      { tipo: 'Entrega', tipoCustom: '', esExterno: false, usuarioId: 0, nombreCompleto: '', email: '' },
      { tipo: 'Recibe', tipoCustom: '', esExterno: true, usuarioId: 0, nombreCompleto: '', email: '' },
    ];
    this.mostrarFormulario = true;
  }

  // Items management
  agregarItem(): void {
    this.items.push({ eppId: 0, cantidad: 1, talla: '' });
  }

  eliminarItem(index: number): void {
    if (this.items.length > 1) this.items.splice(index, 1);
  }

  // Firmantes management
  agregarFirmante(): void {
    this.firmantes.push({
      tipo: '',
      tipoCustom: '',
      esExterno: true,
      usuarioId: 0,
      nombreCompleto: '',
      email: '',
    });
  }

  eliminarFirmante(index: number): void {
    if (this.firmantes.length > 1) this.firmantes.splice(index, 1);
  }

  onUsuarioChange(firmante: any): void {
    if (firmante.usuarioId && !firmante.esExterno) {
      const user = this.usuarios.find((u) => u.Uid === firmante.usuarioId);
      if (user) {
        firmante.nombreCompleto = user.nombre;
        firmante.email = user.email || '';
      }
    }
  }

  onExternoChange(firmante: any): void {
    if (firmante.esExterno) {
      firmante.usuarioId = 0;
    } else {
      firmante.nombreCompleto = '';
      firmante.email = '';
    }
  }

  getEppNombre(eppId: number): string {
    const epp = this.epps.find((e) => e.id === eppId);
    return epp ? epp.nombre : '';
  }

  guardarEntrega(): void {
    if (!this.nuevaEntrega.fecha) {
      Swal.fire('Error', 'La fecha es requerida', 'warning');
      return;
    }
    const validItems = this.items.filter((i) => i.eppId > 0 && i.cantidad > 0);
    if (validItems.length === 0) {
      Swal.fire('Error', 'Agregue al menos un item de EPP', 'warning');
      return;
    }
    const validFirmantes = this.firmantes
      .filter((f) => f.nombreCompleto && f.email)
      .map((f) => ({
        tipo: f.tipo === 'custom' ? f.tipoCustom : f.tipo,
        esExterno: f.esExterno,
        usuarioId: f.esExterno ? undefined : f.usuarioId || undefined,
        nombreCompleto: f.nombreCompleto,
        email: f.email,
      }));
    if (validFirmantes.length === 0) {
      Swal.fire('Error', 'Agregue al menos un firmante', 'warning');
      return;
    }

    const request: CrearEntregaEppRequest = {
      fecha: this.nuevaEntrega.fecha,
      empresa: this.nuevaEntrega.empresa,
      observaciones: this.nuevaEntrega.observaciones,
      creadoPor: this.userId,
      items: validItems,
      firmantes: validFirmantes,
    };

    this.ssgtService.crearEntregaEpp(request).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Entrega creada',
          text: 'Se han enviado los correos de firma a los firmantes',
          timer: 3000,
          showConfirmButton: false,
        });
        this.mostrarFormulario = false;
        this.cargarEntregas();
      },
      error: (err) => {
        Swal.fire('Error', err.error?.msg || 'Error al crear la entrega', 'error');
      },
    });
  }

  verDetalle(entrega: EntregaEPP): void {
    this.ssgtService.obtenerEntregaEppPorId(entrega.id!).subscribe({
      next: (data) => {
        this.entregaSeleccionada = data;
        this.mostrarDetalle = true;
      },
      error: () => Swal.fire('Error', 'Error al cargar detalle', 'error'),
    });
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.entregaSeleccionada = null;
  }

  reenviarCorreo(firma: FirmaEntregaEPP): void {
    if (!this.entregaSeleccionada) return;
    Swal.fire({
      title: 'Reenviar correo',
      text: `¿Reenviar enlace de firma a ${firma.nombreCompleto}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#141414',
      confirmButtonText: 'Reenviar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ssgtService
          .reenviarCorreoFirmaEpp(this.entregaSeleccionada!.id!, firma.id!)
          .subscribe({
            next: () => Swal.fire('Enviado', 'Correo reenviado exitosamente', 'success'),
            error: (err) => Swal.fire('Error', err.error?.msg || 'Error al reenviar', 'error'),
          });
      }
    });
  }

  descargarPdf(): void {
    if (!this.entregaSeleccionada) return;
    this.ssgtService.descargarPdfEntregaEpp(this.entregaSeleccionada.id!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `entrega-epp-${this.entregaSeleccionada!.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error', 'Error al generar PDF', 'error'),
    });
  }

  eliminarEntrega(id: number): void {
    Swal.fire({
      title: '¿Eliminar entrega?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ssgtService.eliminarEntregaEpp(id).subscribe({
          next: () => {
            Swal.fire('Eliminada', 'La entrega ha sido eliminada', 'success');
            this.cargarEntregas();
          },
          error: () => Swal.fire('Error', 'Error al eliminar', 'error'),
        });
      }
    });
  }

  cancelar(): void {
    this.mostrarFormulario = false;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'completado': return 'estado-completado';
      case 'firmado': return 'estado-firmado';
      default: return 'estado-pendiente';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'completado': return 'Completado';
      case 'firmado': return 'Firmado';
      default: return 'Pendiente';
    }
  }

  contarFirmas(entrega: EntregaEPP): string {
    if (!entrega.firmas) return '0/0';
    const firmadas = entrega.firmas.filter((f) => f.firmado).length;
    return `${firmadas}/${entrega.firmas.length}`;
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date + 'T12:00:00').toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getEmpresaNombre(empresa: string): string {
    switch (empresa) {
      case 'AP': return 'Andr\u00e9s Publicidad';
      case 'AT': return 'Andr\u00e9s Tob\u00f3n';
      case 'ME': return 'Mar\u00eda Evangelina';
      default: return empresa || 'No especificada';
    }
  }
}
