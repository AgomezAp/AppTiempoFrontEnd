import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HoraService } from '../../services/hora.service';
import { NovedadService } from '../../services/novedad.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Extra, Novedad, HistoricoExtra, Hora } from '../../interfaces/hora';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-extra-list',
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './extra-list.component.html',
  styleUrl: './extra-list.component.css',
})
export class ExtraListComponent implements OnInit {
  loading: boolean = false;
  listExtra: Extra[] = [];
  listNovedad: Novedad[] = [];
  filterdExtra: any[] = [];
  filterdNovedad: any[] = [];
  observacionSeleccionada: string | null = null;
  nombreSeleccionado: string | null = null;
  historicoData: HistoricoExtra[] = [];
  historicoNombre: string = '';
  historicoVisible: boolean = false;
  historicoLoading: boolean = false;

  // Detalle diario de horas extras
  detalleData: Hora[] = [];
  detalleNombre: string = '';
  detalleSid: number = 0;
  detalleVisible: boolean = false;
  detalleLoading: boolean = false;
  detallePeriodo: string = 'semana'; // 'semana' | 'semanaAnterior' | 'mes'

  // Modal de edición de acumulado
  editModalVisible: boolean = false;
  editExtra: Extra | null = null;
  editAcumulado: string = '';

  constructor(
    private horaService: HoraService,
    private novedadService: NovedadService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  pageSize = 7;
  currentPage = 1;
  totalPages = 1;
  filterdExtraOriginal: any[] = [];

  updatePagination() {
    this.totalPages = Math.ceil(
      this.filterdExtraOriginal.length / this.pageSize,
    );
    this.goToPage(1);
  }
  mostrarObservacion(observacion: string, nombre: string): void {
    if (observacion) {
      this.observacionSeleccionada = observacion;
      this.nombreSeleccionado = nombre;
    }
  }
  cerrarModalObservacion(): void {
    this.observacionSeleccionada = null;
    this.nombreSeleccionado = null;
  }
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filterdExtra = this.filterdExtraOriginal.slice(start, end);
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  getEndIndex(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filterdExtraOriginal.length,
    );
  }
  ngOnInit(): void {
    this.loadData();
  }

  loadExtra(): void {
    this.loading = true;
    this.horaService.getExtra().subscribe((data: Extra[]) => {
      this.listExtra = data;
      this.filterdExtra = data;
      this.loading = false;
    });
  }
  loadNovedad(): void {
    this.loading = true;
    this.novedadService.verNovedad().subscribe((data: Novedad[]) => {
      this.listNovedad = data;
      this.filterdNovedad = data;
      this.loading = false;
    });
  }

  loadData(): void {
    this.horaService.getExtra().subscribe((dataE: Extra[]) => {
      this.novedadService.verNovedad().subscribe((dataN: Novedad[]) => {
        
        // OPTIMIZACIÓN: Crear un diccionario de novedades para evitar bucles anidados O(N*M)
        const novedadMap = new Map<number, string[]>();
        dataN.forEach(n => {
          if (!novedadMap.has(n.Nid)) novedadMap.set(n.Nid, []);
          novedadMap.get(n.Nid)?.push(n.description);
        });

        this.listExtra = dataE.map((extra) => {
          const novedadEncontrada = novedadMap.get(extra.Sid) || [];

          const acumulado = extra.Acumulado || '';
          let acumuladoEnDias = 'Sin datos';

          if (acumulado.includes(':') && !acumulado.includes('NaN')) {
            const isNeg = acumulado.startsWith('-');
            const clean = acumulado.replace('-', '');
            const parts = clean.split(':');
            const hours = isNeg ? -parseInt(parts[0], 10) : parseInt(parts[0], 10);
            const minutes = isNeg ? -parseInt(parts[1], 10) : parseInt(parts[1], 10);
            let totalMinutes = hours * 60 + minutes;
            const days =
              totalMinutes < 0
                ? Math.ceil(totalMinutes / (8.5 * 60))
                : Math.floor(totalMinutes / (8.5 * 60));
            totalMinutes = totalMinutes - days * 510;
            const remainingHours =
              totalMinutes < 0
                ? Math.ceil(totalMinutes / 60)
                : Math.floor(totalMinutes / 60);
            const remainingMinutes = totalMinutes % 60;
            acumuladoEnDias = `${days} días, ${remainingHours} horas, ${remainingMinutes} minutos`;
          }

          return {
            ...extra,
            observaciones:
              novedadEncontrada.length > 0
                ? novedadEncontrada
                : ['sin observacion'],
            acumuladoEnDias,
          };
        });
        this.filterdExtra = this.listExtra;
        this.loading = false;
      });
    });
  }
  isPositive(acumulado: string): boolean {
    if (!acumulado) return false;
    const value = this.parseHours(acumulado);
    return value > 0;
  }

  isNegative(acumulado: string): boolean {
    if (!acumulado) return false;
    const value = this.parseHours(acumulado);
    return value < 0;
  }

  isNeutral(acumulado: string): boolean {
    if (!acumulado) return true;
    const value = this.parseHours(acumulado);
    return value === 0;
  }

  // Convertir formato HH:MM a número
  private parseHours(timeString: string): number {
    if (!timeString) return 0;
    const isNegative = timeString.startsWith('-');
    const cleanTime = timeString.replace('-', '');
    const [hours, minutes] = cleanTime.split(':').map(Number);
    const totalMinutes = hours * 60 + (minutes || 0);
    return isNegative ? -totalMinutes : totalMinutes;
  }

  openModal(extra: Extra): void {
    this.editExtra = extra;
    this.editAcumulado = extra.Acumulado || '';
    this.editModalVisible = true;
  }

  cerrarEditModal(): void {
    this.editModalVisible = false;
    this.editExtra = null;
    this.editAcumulado = '';
  }

  guardarEditModal(): void {
    if (!this.editExtra) return;
    this.horaService.updateExtra(this.editExtra.Sid.toString(), this.editAcumulado).subscribe({
      next: () => {
        this.toastr.success('Datos actualizados con éxito');
        this.cerrarEditModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Error al actualizar los datos', err);
        this.toastr.error('Error al actualizar');
      },
    });
  }

  verHistorial(extra: any): void {
    this.historicoNombre = extra.Name;
    this.historicoVisible = true;
    this.historicoLoading = true;
    this.horaService.getHistoricoExtras(extra.Sid).subscribe({
      next: (data: HistoricoExtra[]) => {
        this.historicoData = data;
        this.historicoLoading = false;
      },
      error: () => {
        this.historicoData = [];
        this.historicoLoading = false;
        this.toastr.error('Error al cargar historial');
      }
    });
  }

  cerrarHistorial(): void {
    this.historicoVisible = false;
    this.historicoData = [];
    this.historicoNombre = '';
  }

  formatearFechaHistorico(fecha: string): string {
    const d = new Date(fecha + 'T12:00:00');
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
  }

  // === DETALLE DIARIO DE HORAS EXTRAS ===

  verDetalle(extra: any): void {
    this.detalleNombre = extra.Name;
    this.detalleSid = extra.Sid;
    this.detalleVisible = true;
    this.detallePeriodo = 'semana';
    this.cargarDetalle();
  }

  cerrarDetalle(): void {
    this.detalleVisible = false;
    this.detalleData = [];
    this.detalleNombre = '';
  }

  cambiarPeriodo(periodo: string): void {
    this.detallePeriodo = periodo;
    this.cargarDetalle();
  }

  private calcularRangoFechas(): { desde: string; hasta: string } {
    const hoy = new Date();
    let desde: Date;
    let hasta: Date = new Date(hoy);

    if (this.detallePeriodo === 'semana') {
      // Lunes de esta semana
      const dia = hoy.getDay();
      const diff = dia === 0 ? 6 : dia - 1;
      desde = new Date(hoy);
      desde.setDate(hoy.getDate() - diff);
    } else if (this.detallePeriodo === 'semanaAnterior') {
      // Lunes a domingo de la semana pasada
      const dia = hoy.getDay();
      const diff = dia === 0 ? 6 : dia - 1;
      hasta = new Date(hoy);
      hasta.setDate(hoy.getDate() - diff - 1); // Domingo anterior
      desde = new Date(hasta);
      desde.setDate(hasta.getDate() - 6); // Lunes anterior
    } else {
      // Este mes
      desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    }

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const dd = d.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    return { desde: formatDate(desde), hasta: formatDate(hasta) };
  }

  cargarDetalle(): void {
    this.detalleLoading = true;
    const { desde, hasta } = this.calcularRangoFechas();
    this.horaService.getDetalleExtras(this.detalleSid, desde, hasta).subscribe({
      next: (data: Hora[]) => {
        this.detalleData = data;
        this.detalleLoading = false;
      },
      error: () => {
        this.detalleData = [];
        this.detalleLoading = false;
        this.toastr.error('Error al cargar detalle');
      }
    });
  }

  formatearFechaDetalle(fecha: string): string {
    const d = new Date(fecha);
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
  }

  formatearHora(fecha: string): string {
    const d = new Date(fecha);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  getPeriodoLabel(): string {
    const { desde, hasta } = this.calcularRangoFechas();
    const d1 = new Date(desde + 'T12:00:00');
    const d2 = new Date(hasta + 'T12:00:00');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d1.getDate()} ${meses[d1.getMonth()]} - ${d2.getDate()} ${meses[d2.getMonth()]} ${d2.getFullYear()}`;
  }
}
