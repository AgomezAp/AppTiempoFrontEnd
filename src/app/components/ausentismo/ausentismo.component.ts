import { Component, OnInit } from '@angular/core';
import { AdminService, CostoPermisosMedicos, CostoUsuario, IncapacidadesResponse, IncapacidadUsuario } from '../../services/admin.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ausentismo',
  templateUrl: './ausentismo.component.html',
  styleUrls: ['./ausentismo.component.css'],
  standalone: true,
  imports: [NavbarComponent, CommonModule, HttpClientModule, FormsModule],
})
export class AusentismoComponent implements OnInit {
  // Tab activo
  tabActivo: 'citas' | 'incapacidades' = 'citas';

  // Tab citas médicas
  loading = false;
  stats: CostoPermisosMedicos | null = null;
  fromDate = '';
  toDate = '';
  expandedUid: number | null = null;

  // Tab incapacidades
  loadingIncap = false;
  incapacidades: IncapacidadesResponse | null = null;
  incapFromDate = '';
  incapToDate = '';
  expandedIncapUid: number | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  cambiarTab(tab: 'citas' | 'incapacidades'): void {
    this.tabActivo = tab;
    if (tab === 'incapacidades' && !this.incapacidades) {
      this.loadIncapacidades();
    }
  }

  // ── CITAS MÉDICAS ──────────────────────────────────────────────
  loadStats(): void {
    this.loading = true;
    this.adminService.getCostoPermisosMedicos(this.fromDate, this.toDate).subscribe({
      next: (res) => {
        if (res.success && res.stats) {
          this.stats = res.stats;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando costos de permisos médicos', err);
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.loadStats();
  }

  clearFilters(): void {
    this.fromDate = '';
    this.toDate = '';
    this.loadStats();
  }

  toggleDetalle(uid: number | undefined): void {
    if (!uid) return;
    this.expandedUid = this.expandedUid === uid ? null : uid;
  }

  toggleCancelado(permisoId: number): void {
    this.adminService.togglePermisoCancelado(permisoId).subscribe({
      next: () => this.loadStats(),
      error: () => alert('Error al actualizar el permiso'),
    });
  }

  getTotalCitasMedicas(): number {
    if (!this.stats) return 0;
    return this.stats.byUser.reduce((sum, u) => sum + u.citasMedicas, 0);
  }

  getTotalCitasOdonto(): number {
    if (!this.stats) return 0;
    return this.stats.byUser.reduce((sum, u) => sum + u.citasOdontologicas, 0);
  }

  // ── INCAPACIDADES ──────────────────────────────────────────────
  loadIncapacidades(): void {
    this.loadingIncap = true;
    this.adminService.getIncapacidades(this.incapFromDate || undefined, this.incapToDate || undefined).subscribe({
      next: (res) => {
        if (res.success) {
          this.incapacidades = res;
        }
        this.loadingIncap = false;
      },
      error: (err) => {
        console.error('Error cargando incapacidades', err);
        this.loadingIncap = false;
      },
    });
  }

  applyIncapFilters(): void {
    this.loadIncapacidades();
  }

  clearIncapFilters(): void {
    this.incapFromDate = '';
    this.incapToDate = '';
    this.loadIncapacidades();
  }

  toggleIncapDetalle(uid: number): void {
    this.expandedIncapUid = this.expandedIncapUid === uid ? null : uid;
  }

  // ── UTILIDADES ──────────────────────────────────────────────────
  formatCOP(value: number | undefined | null): string {
    if (!value || value === 0 || isNaN(value)) return '$ 0';
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    } catch (e) {
      return '$ ' + value;
    }
  }

  exportCSV(): void {
    if (!this.stats) return;
    const headers = ['Nombre', 'Cargo', 'Empresa', 'Salario', 'Citas Médicas', 'Citas Odontológicas', 'Total Permisos', 'Total Horas', 'Tarifa/Hora', 'Costo Total'];
    const rows = this.stats.byUser.map((u) => [
      u.nombre, u.cargo, u.empresa, u.salario,
      u.citasMedicas, u.citasOdontologicas,
      u.totalPermisos, u.totalHoras, u.tarifaHora, u.costoTotal,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `costo_permisos_medicos_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}


