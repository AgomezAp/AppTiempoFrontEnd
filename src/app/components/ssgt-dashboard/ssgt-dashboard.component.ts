import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { SsgtService } from '../../services/ssgt.service';
import { DashboardSSGT } from '../../interfaces/ssgt';

@Component({
  selector: 'app-ssgt-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './ssgt-dashboard.component.html',
  styleUrl: './ssgt-dashboard.component.css',
})
export class SsgtDashboardComponent implements OnInit {
  dashboard: DashboardSSGT | null = null;
  loading = false;
  anioSeleccionado: number = new Date().getFullYear();
  aniosDisponibles: number[] = [];

  meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  constructor(private ssgtService: SsgtService) {}

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 4; y--) {
      this.aniosDisponibles.push(y);
    }
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.loading = true;
    this.ssgtService.obtenerDashboard(this.anioSeleccionado).subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  cambiarAnio(): void {
    this.cargarDashboard();
  }

  getSeveridadTotal(severidad: string): number {
    if (!this.dashboard?.porSeveridad) return 0;
    const item = this.dashboard.porSeveridad.find((s: any) => s.severidad === severidad);
    return item ? Number(item.total) : 0;
  }

  getEstadoTotal(estado: string): number {
    if (!this.dashboard?.porEstado) return 0;
    const item = this.dashboard.porEstado.find((s: any) => s.estado === estado);
    return item ? Number(item.total) : 0;
  }

  getMesTotales(): { mes: string; accidentes: number; incidentes: number }[] {
    if (!this.dashboard?.porMes) return [];
    const result: { mes: string; accidentes: number; incidentes: number }[] = [];
    for (let i = 1; i <= 12; i++) {
      const accidentes = this.dashboard.porMes
        .filter((m: any) => Number(m.mes) === i && m.tipoEvento === 'accidente')
        .reduce((sum: number, m: any) => sum + Number(m.total), 0);
      const incidentes = this.dashboard.porMes
        .filter((m: any) => Number(m.mes) === i && m.tipoEvento === 'incidente')
        .reduce((sum: number, m: any) => sum + Number(m.total), 0);
      if (accidentes > 0 || incidentes > 0) {
        result.push({ mes: this.meses[i - 1], accidentes, incidentes });
      }
    }
    return result;
  }

  getMaxMensual(): number {
    const totales = this.getMesTotales();
    if (totales.length === 0) return 1;
    return Math.max(...totales.map(t => t.accidentes + t.incidentes), 1);
  }

  getBarHeight(value: number): string {
    const max = this.getMaxMensual();
    return Math.max((value / max) * 100, 2) + '%';
  }
}
