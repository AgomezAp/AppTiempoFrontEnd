import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HojaVidaService } from '../../services/hoja-vida.service';
import { NavbarComponent } from '../navbar/navbar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-expedientes',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './expedientes.component.html',
  styleUrls: ['./expedientes.component.css']
})
export class ExpedientesComponent implements OnInit {
  colaboradores: any[] = [];
  filtrados: any[] = [];
  paginados: any[] = [];

  cargando = false;
  inicializando = false;
  busqueda = '';

  // Paginación
  pageSize = 15;
  paginaActual = 1;
  totalPaginas = 1;

  constructor(
    private hojaVidaService: HojaVidaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarColaboradores();
  }

  cargarColaboradores(): void {
    this.cargando = true;
    this.hojaVidaService.listarColaboradores().subscribe({
      next: (data) => {
        this.colaboradores = data;
        this.filtrados = data;
        this.actualizarPaginacion();
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        const msg = err?.error?.msg || `Error ${err?.status || ''}: No se pudieron cargar los colaboradores`;
        Swal.fire('Error al cargar', msg, 'error');
        console.error('Error listarColaboradores:', err);
      }
    });
  }

  onBusqueda(): void {
    const term = this.busqueda.trim().toLowerCase();
    if (!term) {
      this.filtrados = this.colaboradores;
    } else {
      this.filtrados = this.colaboradores.filter(c =>
        (c.name || '').toLowerCase().includes(term) ||
        (c.lastName || '').toLowerCase().includes(term) ||
        (`${c.name} ${c.lastName}`).toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term) ||
        (c.cargo || '').toLowerCase().includes(term) ||
        (c.documentoIdentificacion || '').includes(term)
      );
    }
    this.actualizarPaginacion();
  }

  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.filtrados.length / this.pageSize) || 1;
    this.irAPagina(1);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    const inicio = (pagina - 1) * this.pageSize;
    this.paginados = this.filtrados.slice(inicio, inicio + this.pageSize);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  verHojaVida(uid: number): void {
    this.router.navigate(['/hoja-vida', uid]);
  }

  iniciales(c: any): string {
    const n = (c.name || ' ').charAt(0).toUpperCase();
    const a = (c.lastName || ' ').charAt(0).toUpperCase();
    return n + a;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  inicializarTodasLasCarpetas(): void {
    Swal.fire({
      title: '¿Crear carpetas para todos?',
      text: 'Se creará la carpeta de expediente para cada colaborador activo que aún no la tenga.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#141414'
    }).then(r => {
      if (!r.isConfirmed) return;
      this.inicializando = true;
      this.hojaVidaService.inicializarCarpetas().subscribe({
        next: (res) => {
          this.inicializando = false;
          Swal.fire('Listo', res.msg, 'success');
        },
        error: () => {
          this.inicializando = false;
          Swal.fire('Error', 'No se pudieron crear las carpetas', 'error');
        }
      });
    });
  }
}
