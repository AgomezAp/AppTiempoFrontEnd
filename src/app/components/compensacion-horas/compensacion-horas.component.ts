import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { HoraService } from '../../services/hora.service';
import { CompensacionHorasService, PlanCompensacion, FilaCompensacion } from '../../services/compensacion-horas.service';

@Component({
  selector: 'app-compensacion-horas',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './compensacion-horas.component.html',
  styleUrls: ['./compensacion-horas.component.css'],
})
export class CompensacionHorasComponent implements OnInit {
  userId: number = 0;
  userRole: string = '';
  isAdmin: boolean = false;
  nombreCompleto: string = '';
  cargo: string = '';

  mesGenerador: string = '';
  mesCompensacion: string = '';
  anio: number = new Date().getFullYear();

  horasAcumuladas: string = '';
  observacionesGenerales: string = '';
  filas: FilaCompensacion[] = [];

  loadingHistorico: boolean = false;
  guardando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  // Vista admin
  planesAdmin: PlanCompensacion[] = [];
  loadingPlanes: boolean = false;

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  constructor(
    private horaService: HoraService,
    private compensacionService: CompensacionHorasService,
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.setDefaultPeriod();
    this.addFila();
    if (this.isAdmin) {
      this.cargarPlanesAdmin();
    } else {
      this.cargarMiPlan();
    }
  }

  loadUserInfo(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.nombreCompleto = payload.name || '';
        this.cargo = payload.cargo || '';
        this.userRole = payload.role || '';
        this.isAdmin = this.userRole === 'Admin';
      } catch (_) {}
    }
    this.userId = Number(localStorage.getItem('userId')) || 0;
    if (this.userId > 0) {
      this.loadHorasAcumuladas();
    }
  }

  setDefaultPeriod(): void {
    const now = new Date();
    const curMonth = now.getMonth();
    const prevMonthIndex = curMonth === 0 ? 11 : curMonth - 1;
    this.mesGenerador = this.meses[prevMonthIndex];
    this.mesCompensacion = this.meses[curMonth];
    this.anio = curMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
  }

  loadHorasAcumuladas(): void {
    this.loadingHistorico = true;
    this.horaService.getHistoricoExtras(this.userId).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
          );
          this.horasAcumuladas = sorted[0].Acumulado ?? '';
        }
        this.loadingHistorico = false;
      },
      error: () => { this.loadingHistorico = false; },
    });
  }

  cargarMiPlan(): void {
    this.compensacionService.getMiPlan().subscribe({
      next: (planes) => {
        if (planes && planes.length > 0) {
          const ultimo = planes[0];
          this.nombreCompleto = ultimo.nombreEmpleado || this.nombreCompleto;
          this.cargo = ultimo.cargo || this.cargo;
          this.mesGenerador = ultimo.mesGenerador;
          this.mesCompensacion = ultimo.mesCompensacion;
          this.anio = ultimo.anio;
          this.horasAcumuladas = ultimo.horasAcumuladas || this.horasAcumuladas;
          this.observacionesGenerales = ultimo.observaciones || '';
          this.filas = ultimo.filas.length ? ultimo.filas : [{ fecha: '', horas: '00:00' }];
        }
      },
      error: () => {},
    });
  }

  cargarPlanesAdmin(): void {
    this.loadingPlanes = true;
    this.compensacionService.getTodosLosPlanes().subscribe({
      next: (planes) => {
        this.planesAdmin = planes;
        this.loadingPlanes = false;
      },
      error: () => { this.loadingPlanes = false; },
    });
  }

  addFila(): void {
    this.filas.push({ fecha: '', horas: '00:00' });
  }

  removeFila(index: number): void {
    if (this.filas.length > 1) {
      this.filas.splice(index, 1);
    }
  }

  get totalPlaneado(): string {
    const total = this.filas.reduce((acc, f) => acc + this.parseTimeToMinutes(f.horas), 0);
    return this.minutesToTime(total);
  }

  get saldoPendiente(): string {
    return this.minutesToTime(
      this.parseTimeToMinutes(this.horasAcumuladas) - this.parseTimeToMinutes(this.totalPlaneado),
    );
  }

  get saldoPositivo(): boolean {
    return this.parseTimeToMinutes(this.saldoPendiente) >= 0;
  }

  parseTimeToMinutes(time: string): number {
    if (!time) return 0;
    const match = time.match(/^(-?)(\d+):(\d{2})/);
    if (!match) return 0;
    const sign = match[1] === '-' ? -1 : 1;
    return sign * (parseInt(match[2], 10) * 60 + parseInt(match[3], 10));
  }

  minutesToTime(minutes: number): string {
    const sign = minutes < 0 ? '-' : '';
    const abs = Math.abs(minutes);
    return `${sign}${Math.floor(abs / 60)}:${(abs % 60).toString().padStart(2, '0')}`;
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  guardarPlan(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
    if (!this.nombreCompleto || !this.mesGenerador || !this.mesCompensacion) {
      this.mensajeError = 'Completa los campos de nombre y meses antes de guardar.';
      return;
    }
    this.guardando = true;
    const plan: PlanCompensacion = {
      nombreEmpleado: this.nombreCompleto,
      cargo: this.cargo,
      mesGenerador: this.mesGenerador,
      mesCompensacion: this.mesCompensacion,
      anio: this.anio,
      horasAcumuladas: this.horasAcumuladas,
      observaciones: this.observacionesGenerales,
      filas: this.filas,
    };
    this.compensacionService.guardarPlan(plan).subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = 'Plan guardado correctamente.';
      },
      error: () => {
        this.guardando = false;
        this.mensajeError = 'Ocurrió un error al guardar. Intenta de nuevo.';
      },
    });
  }

  // Admin: descargar un único documento consolidado con todos los planes
  descargarDocumentoConsolidado(): void {
    if (!this.planesAdmin.length) return;
    const win = window.open('', '_blank', 'width=960,height=760');
    if (!win) return;
    win.document.write(this.buildHtmlConsolidado(this.planesAdmin));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  }

  // Empleado: descargar solo su propio plan
  descargarMiPlan(): void {
    const plan: PlanCompensacion = {
      nombreEmpleado: this.nombreCompleto,
      cargo: this.cargo,
      mesGenerador: this.mesGenerador,
      mesCompensacion: this.mesCompensacion,
      anio: this.anio,
      horasAcumuladas: this.horasAcumuladas,
      observaciones: this.observacionesGenerales,
      filas: this.filas,
    };
    const win = window.open('', '_blank', 'width=960,height=760');
    if (!win) return;
    win.document.write(this.buildHtmlIndividual(plan));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  }

  calcularTotalPlaneadoPlan(filas: FilaCompensacion[]): string {
    const total = filas.reduce((acc, f) => acc + this.parseTimeToMinutes(f.horas), 0);
    return this.minutesToTime(total);
  }

  calcularSaldoPlan(plan: PlanCompensacion): string {
    const acum = this.parseTimeToMinutes(plan.horasAcumuladas);
    const plan_ = this.parseTimeToMinutes(this.calcularTotalPlaneadoPlan(plan.filas));
    return this.minutesToTime(acum - plan_);
  }

  private get logoSrc(): string {
    return `${window.location.origin}/LogoAP.png`;
  }

  // Documento individual para el empleado (una sola hoja con logo y Fira Sans)
  private buildHtmlIndividual(plan: PlanCompensacion): string {
    const logo = this.logoSrc;
    const totalPlan = this.calcularTotalPlaneadoPlan(plan.filas);
    const saldo = this.calcularSaldoPlan(plan);

    const rowsHtml = plan.filas
      .map((f, i) => `
        <tr>
          <td>${i + 1}</td>
          <td style="text-align:left;">${f.fecha ? this.formatDateDisplay(f.fecha) : '&nbsp;'}</td>
          <td>${f.horas || '&nbsp;'}</td>
        </tr>`)
      .join('');

    const obsHtml = plan.observaciones
      ? `<p style="padding:4px 2px;font-size:12px;">${plan.observaciones}</p>`
      : '<div class="obs-line"></div><div class="obs-line"></div>';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Compensación — ${plan.nombreEmpleado}</title>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Fira Sans',Arial,sans-serif;font-size:12px;color:#1a1a1a;background:#f0f0f0;}
    .page{width:210mm;min-height:297mm;margin:20px auto;background:#fff;padding:18mm 20mm 20mm 20mm;box-shadow:0 2px 12px rgba(0,0,0,.15);}
    .header{display:flex;align-items:stretch;border:1.5px solid #1a1a1a;margin-bottom:12px;}
    .header-logo{width:42mm;display:flex;align-items:center;justify-content:center;border-right:1.5px solid #1a1a1a;padding:8px;min-height:22mm;}
    .header-logo img{max-width:100%;max-height:20mm;object-fit:contain;}
    .header-title{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;padding:8px 12px;}
    .header-title h1{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;line-height:1.4;}
    .header-meta{width:42mm;border-left:1.5px solid #1a1a1a;font-size:10px;}
    .header-meta .meta-row{display:flex;border-bottom:1px solid #1a1a1a;padding:4px 6px;}
    .header-meta .meta-row:last-child{border-bottom:none;}
    .header-meta .meta-label{font-weight:700;margin-right:4px;white-space:nowrap;}
    .section{border:1.5px solid #1a1a1a;margin-bottom:10px;}
    .section-title{background:#1a1a1a;color:#fff;font-weight:700;font-size:11px;padding:4px 8px;text-transform:uppercase;letter-spacing:.4px;}
    .section-body{padding:8px 10px;}
    .field-grid{display:grid;gap:6px 14px;}
    .field-grid.cols-2{grid-template-columns:1fr 1fr;}
    .field-grid.cols-3{grid-template-columns:1fr 1fr 1fr;}
    .field{display:flex;flex-direction:column;gap:2px;}
    .field label{font-weight:700;font-size:10px;color:#555;text-transform:uppercase;}
    .field-value{border-bottom:1px solid #888;min-height:16px;padding:1px 2px;font-size:12px;}
    table{width:100%;border-collapse:collapse;font-size:11px;}
    thead th{background:#1a1a1a;color:#fff;padding:5px 6px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:.3px;border:1px solid #1a1a1a;font-weight:700;}
    tbody td{border:1px solid #bbb;padding:5px 6px;text-align:center;height:20px;}
    tbody tr:nth-child(even) td{background:#f8f8f8;}
    .total-row td{background:#e8e8e8!important;font-weight:700;border:1px solid #1a1a1a!important;}
    .summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1.5px solid #1a1a1a;margin-bottom:10px;}
    .summary-item{padding:7px 10px;border-right:1px solid #1a1a1a;display:flex;flex-direction:column;gap:2px;}
    .summary-item:last-child{border-right:none;}
    .summary-item label{font-size:9px;text-transform:uppercase;color:#555;font-weight:700;}
    .summary-item .summary-val{font-size:16px;font-weight:700;color:#1a1a1a;}
    .summary-item.highlight .summary-val{color:#c0392b;}
    .obs-area{border:1.5px solid #1a1a1a;margin-bottom:10px;}
    .obs-area .section-title{background:#1a1a1a;color:#fff;font-weight:700;font-size:11px;padding:4px 8px;text-transform:uppercase;}
    .obs-lines{padding:6px 10px;}
    .obs-line{border-bottom:1px solid #ccc;min-height:16px;margin-bottom:6px;}
    .signatures{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px;}
    .signature-box{border-top:1.5px solid #1a1a1a;padding-top:5px;text-align:center;}
    .signature-line{height:22px;border-bottom:1px solid #888;margin-bottom:4px;}
    .signature-label{font-size:10px;color:#555;text-transform:uppercase;font-weight:700;}
    .signature-sublabel{font-size:9px;color:#888;}
    @media print{body{background:#fff;}.page{margin:0;box-shadow:none;padding:12mm 14mm 14mm 14mm;}}
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-logo"><img src="${logo}" alt="Logo empresa"/></div>
    <div class="header-title"><h1>Solicitud de Compensación<br/>de Horas Extras</h1></div>
    <div class="header-meta">
      <div class="meta-row"><span class="meta-label">Código:</span> RH-HE-01</div>
      <div class="meta-row"><span class="meta-label">Versión:</span> 1.0</div>
      <div class="meta-row"><span class="meta-label">Vigencia:</span> ${plan.anio}</div>
      <div class="meta-row"><span class="meta-label">Fecha:</span> ${new Date().toLocaleDateString('es-CO')}</div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Información del Empleado</div>
    <div class="section-body">
      <div class="field-grid cols-2" style="margin-bottom:8px;">
        <div class="field"><label>Nombre completo</label><div class="field-value">${plan.nombreEmpleado}</div></div>
        <div class="field"><label>Cargo / Área</label><div class="field-value">${plan.cargo || ''}</div></div>
      </div>
      <div class="field-grid cols-3">
        <div class="field"><label>Mes que generó las horas extras</label><div class="field-value">${plan.mesGenerador}</div></div>
        <div class="field"><label>Año</label><div class="field-value">${plan.anio}</div></div>
        <div class="field"><label>Mes en que se compensarán</label><div class="field-value">${plan.mesCompensacion}</div></div>
      </div>
    </div>
  </div>
  <div class="summary-grid">
    <div class="summary-item"><label>Total horas extras acumuladas</label><div class="summary-val">${plan.horasAcumuladas || '—'} h</div></div>
    <div class="summary-item"><label>Total horas a compensar</label><div class="summary-val">${totalPlan} h</div></div>
    <div class="summary-item highlight"><label>Saldo pendiente</label><div class="summary-val">${saldo} h</div></div>
  </div>
  <div class="section">
    <div class="section-title">Plan de Compensación — Detalle por Día</div>
    <div class="section-body" style="padding:0;">
      <table>
        <thead>
          <tr>
            <th style="width:8%">#</th>
            <th style="width:55%">Fecha</th>
            <th style="width:37%">Horas a compensar</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="total-row">
            <td colspan="2" style="text-align:right;">TOTAL HORAS:</td>
            <td>${totalPlan}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="obs-area">
    <div class="section-title">Observaciones Generales</div>
    <div class="obs-lines">${obsHtml}</div>
  </div>
  <div class="signatures">
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">Firma del Empleado</div>
      <div class="signature-sublabel">Nombre y fecha</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">Visto Bueno — Jefe Inmediato</div>
      <div class="signature-sublabel">Nombre y fecha</div>
    </div>
  </div>
</div>
</body>
</html>`;
  }

  // Documento consolidado para admin: UNA sola tabla con todos los colaboradores
  private buildHtmlConsolidado(planes: PlanCompensacion[]): string {
    const logo = this.logoSrc;
    const now = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

    const rowsHtml = planes.map((plan, idx) => {
      const totalPlan = this.calcularTotalPlaneadoPlan(plan.filas);
      const saldo = this.calcularSaldoPlan(plan);
      const saldoNeg = this.parseTimeToMinutes(saldo) < 0;
      return `
        <tr>
          <td>${idx + 1}</td>
          <td style="text-align:left;"><strong>${plan.nombreEmpleado}</strong></td>
          <td style="text-align:left;">${plan.cargo || '—'}</td>
          <td>${plan.mesGenerador}</td>
          <td>${plan.mesCompensacion}</td>
          <td>${plan.anio}</td>
          <td>${plan.horasAcumuladas || '—'}</td>
          <td><strong>${totalPlan}</strong></td>
          <td style="color:${saldoNeg ? '#c0392b' : 'inherit'};font-weight:${saldoNeg ? '700' : '400'}">${saldo}</td>
        </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Consolidado — Compensación de Horas Extras</title>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Fira Sans',Arial,sans-serif;font-size:12px;color:#1a1a1a;background:#f0f0f0;}
    .page{width:297mm;min-height:210mm;margin:20px auto;background:#fff;padding:14mm 18mm 16mm 18mm;box-shadow:0 2px 12px rgba(0,0,0,.15);}
    .cons-header{display:flex;align-items:center;gap:16px;border-bottom:2px solid #1a1a1a;padding-bottom:10px;margin-bottom:14px;}
    .cons-logo{height:22mm;object-fit:contain;}
    .cons-titles{flex:1;}
    .cons-titles h1{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;}
    .cons-titles p{font-size:11px;color:#555;margin-top:3px;}
    .cons-meta{font-size:10px;text-align:right;color:#555;white-space:nowrap;}
    table{width:100%;border-collapse:collapse;font-size:10.5px;margin-top:4px;}
    thead th{background:#1a1a1a;color:#fff;padding:6px 7px;text-align:center;font-size:9px;text-transform:uppercase;letter-spacing:.3px;border:1px solid #1a1a1a;font-weight:700;}
    tbody td{border:1px solid #bbb;padding:5px 7px;vertical-align:middle;text-align:center;}
    tbody tr:nth-child(even) td{background:#f8f8f8;}
    tfoot td{background:#e8e8e8;font-weight:700;border:1px solid #1a1a1a;padding:5px 7px;text-align:center;}
    @media print{body{background:#fff;}.page{margin:0;box-shadow:none;padding:10mm 14mm 12mm 14mm;}}
  </style>
</head>
<body>
<div class="page">
  <div class="cons-header">
    <img src="${logo}" alt="Logo empresa" class="cons-logo"/>
    <div class="cons-titles">
      <h1>Consolidado de Planes de Compensación de Horas Extras</h1>
      <p>Resumen de todos los colaboradores — generado el ${now}</p>
    </div>
    <div class="cons-meta">RH-HE-02<br/>Versión 1.0</div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:4%">#</th>
        <th style="width:22%">Colaborador</th>
        <th style="width:17%">Cargo / Área</th>
        <th style="width:10%">Mes Generador</th>
        <th style="width:10%">Mes Compensación</th>
        <th style="width:5%">Año</th>
        <th style="width:10%">Hrs Acumuladas</th>
        <th style="width:11%">Total Planeado</th>
        <th style="width:11%">Saldo Pendiente</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="7" style="text-align:right;">Total colaboradores:</td>
        <td colspan="2">${planes.length}</td>
      </tr>
    </tfoot>
  </table>
</div>
</body>
</html>`;
  }
}
