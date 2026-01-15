import { Component, OnInit } from '@angular/core';
import { AdminService, AusentismoStats } from '../../services/admin.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ausentismo',
  templateUrl: './ausentismo.component.html',
  styleUrls: ['./ausentismo.component.css'],
  standalone: true,
  imports: [NavbarComponent, CommonModule, HttpClientModule, BaseChartDirective, FormsModule],
})
export class AusentismoComponent implements OnInit {
  loading = false;
  stats: AusentismoStats | null = null;
  fromDate = '';
  toDate = '';

  // Chart configurations
  typeChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  typeChartOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, plugins: { legend: { position: 'top' } } };

  typeChartDataPie: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  typeChartOptionsPie: ChartConfiguration<'doughnut'>['options'] = { responsive: true };

  constructor(private adminService: AdminService) {
    console.log('AusentismoComponent initialized');
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    console.log('Fetching ausentismo stats...');
    this.adminService.getAusentismoStats(this.fromDate, this.toDate).subscribe({
      next: (res) => {
        console.log('Stats received:', res);
        if (res.success && res.stats) {
          this.stats = res.stats;
          this.generateCharts();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stats', err);
        this.loading = false;
      },
    });
  }

  generateCharts(): void {
    if (!this.stats) return;

    // Bar chart for types
    const typeLabels = this.stats.byType.map((t) => t.type);
    const typeCounts = this.stats.byType.map((t) => t.count);

    this.typeChartData = {
      labels: typeLabels,
      datasets: [
        {
          label: 'Cantidad de Ausencias por Tipo',
          data: typeCounts,
          backgroundColor: [
            '#ff6384',
            '#36a2eb',
            '#ffce56',
            '#4bc0c0',
            '#9966ff',
            '#ff9f40',
            '#ff6384',
            '#c9cbcf',
          ],
          borderColor: '#fff',
          borderWidth: 1,
        },
      ],
    };

    // Pie chart for types
    this.typeChartDataPie = {
      labels: typeLabels,
      datasets: [
        {
          data: typeCounts,
          backgroundColor: [
            '#ff6384',
            '#36a2eb',
            '#ffce56',
            '#4bc0c0',
            '#9966ff',
            '#ff9f40',
            '#ff6384',
            '#c9cbcf',
          ],
          borderColor: '#fff',
          borderWidth: 1,
        },
      ],
    };
  }

  minutesToHHMM(mins: number): string {
    const sign = mins < 0 ? '-' : '';
    const abs = Math.abs(mins);
    const h = Math.floor(abs / 60)
      .toString()
      .padStart(2, '0');
    const m = (abs % 60).toString().padStart(2, '0');
    return `${sign}${h}:${m}`;
  }

  exportCSV(): void {
    if (!this.stats) return;
    const headers = ['Uid', 'Nombre', 'Total Horas', 'Cantidad', 'Promedio (min)'];
    const rows = this.stats.byUser.map((u) => [u.Uid, u.Name, u.totalHours, u.count, u.average]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ausentismo_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  applyFilters(): void {
    this.loadStats();
  }

  clearFilters(): void {
    this.fromDate = '';
    this.toDate = '';
    this.loadStats();
  }
}

