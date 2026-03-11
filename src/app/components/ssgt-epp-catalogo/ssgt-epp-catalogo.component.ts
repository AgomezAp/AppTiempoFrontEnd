import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { SsgtService } from '../../services/ssgt.service';
import { UserService } from '../../services/user.service';
import { CatalogoEPP, AlertaEPP } from '../../interfaces/ssgt';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ssgt-epp-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './ssgt-epp-catalogo.component.html',
  styleUrl: './ssgt-epp-catalogo.component.css',
})
export class SsgtEppCatalogoComponent implements OnInit {
  epps: CatalogoEPP[] = [];
  alertas: AlertaEPP[] = [];
  loading = false;
  mostrarFormulario = false;
  editandoId: number | null = null;

  nuevoEpp: {
    nombre: string;
    descripcion: string;
    categoria: string;
    stockActual: number;
    stockMinimo: number;
    fechaVencimiento: string;
    proveedor: string;
    activo: boolean;
  } = {
    nombre: '',
    descripcion: '',
    categoria: '',
    stockActual: 0,
    stockMinimo: 0,
    fechaVencimiento: '',
    proveedor: '',
    activo: true,
  };

  categorias: string[] = [
    'Cabeza',
    'Ojos',
    'Oídos',
    'Respiratorio',
    'Manos',
    'Pies',
    'Cuerpo',
    'Altura',
    'Otro',
  ];

  constructor(
    private ssgtService: SsgtService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.cargarEPPs();
    this.cargarAlertas();
  }

  cargarEPPs(): void {
    this.loading = true;
    this.ssgtService.obtenerEPPs().subscribe({
      next: (data) => {
        this.epps = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'No se pudieron cargar los EPPs', 'error');
      },
    });
  }

  cargarAlertas(): void {
    this.ssgtService.obtenerAlertasEpp(false).subscribe({
      next: (data) => {
        this.alertas = data;
      },
      error: () => {
        console.error('Error al cargar alertas');
      },
    });
  }

  abrirFormulario(): void {
    this.editandoId = null;
    this.nuevoEpp = {
      nombre: '',
      descripcion: '',
      categoria: '',
      stockActual: 0,
      stockMinimo: 0,
      fechaVencimiento: '',
      proveedor: '',
      activo: true,
    };
    this.mostrarFormulario = true;
  }

  editarEpp(epp: CatalogoEPP): void {
    this.editandoId = epp.id!;
    this.nuevoEpp = {
      nombre: epp.nombre,
      descripcion: epp.descripcion || '',
      categoria: epp.categoria || '',
      stockActual: epp.stockActual,
      stockMinimo: epp.stockMinimo,
      fechaVencimiento: epp.fechaVencimiento || '',
      proveedor: epp.proveedor || '',
      activo: epp.activo,
    };
    this.mostrarFormulario = true;
  }

  guardarEpp(): void {
    if (this.editandoId) {
      this.ssgtService.actualizarEPP(this.editandoId, this.nuevoEpp).subscribe({
        next: () => {
          Swal.fire({
            title: 'Actualizado',
            text: 'El EPP ha sido actualizado exitosamente',
            icon: 'success',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false,
          });
          this.mostrarFormulario = false;
          this.cargarEPPs();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.msg || 'Error al actualizar el EPP', 'error');
        },
      });
    } else {
      this.ssgtService.crearEPP(this.nuevoEpp).subscribe({
        next: () => {
          Swal.fire({
            title: 'Creado',
            text: 'El EPP ha sido creado exitosamente',
            icon: 'success',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false,
          });
          this.mostrarFormulario = false;
          this.cargarEPPs();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.msg || 'Error al crear el EPP', 'error');
        },
      });
    }
  }

  eliminarEpp(id: number): void {
    Swal.fire({
      title: 'Confirmar eliminación',
      text: '¿Está seguro de eliminar este elemento EPP?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ssgtService.eliminarEPP(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El EPP ha sido eliminado', 'success');
            this.cargarEPPs();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el EPP', 'error');
          },
        });
      }
    });
  }

  marcarAlertaLeida(id: number): void {
    this.ssgtService.marcarAlertaLeidaEpp(id).subscribe({
      next: () => {
        this.cargarAlertas();
      },
      error: () => {
        console.error('Error al marcar alerta como leída');
      },
    });
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.nuevoEpp = {
      nombre: '',
      descripcion: '',
      categoria: '',
      stockActual: 0,
      stockMinimo: 0,
      fechaVencimiento: '',
      proveedor: '',
      activo: true,
    };
  }

  getStockClass(epp: CatalogoEPP): string {
    if (epp.stockActual <= epp.stockMinimo) {
      return 'stock-critico';
    }
    if (epp.stockActual <= epp.stockMinimo * 1.5) {
      return 'stock-bajo';
    }
    return 'stock-ok';
  }
}
