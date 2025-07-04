import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Extra, Hora } from '../../interfaces/hora';
import { UResponse } from '../../interfaces/user';
import { HoraService } from '../../services/hora.service';
import * as bootstrap from 'bootstrap';
import { NavbarComponent } from '../navbar/navbar.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../services/user.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-horas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    NgxPaginationModule,
    SpinnerComponent,
  ],
  templateUrl: './horas.component.html',
  styleUrl: './horas.component.css',
})
export class HorasComponent implements OnInit {
  hora: Hora | null = null;
  listHoras: Hora[] = [];
  listExtra: Extra[] = [];
  listUsers: UResponse[] = [];
  filteredHoras: any[] = [];
  filterdExtra: any[] = [];
  filterText: string = '';
  totalQuantity: number = 0;
  loading: boolean = false;
  showList: boolean = true;
  editingHora: any = null;
  p: number = 1;
  itemsPerPage: number = 10;
  sortOrder: string = 'asc';
  week: string = '';
  filterName: string = '';
  showDateRange: boolean = true;
  startDate: string = '';
  endDate: string = '';
  selectedItem: any = null;

  // Nuevas propiedades para paginación
  paginatedHoras: any[] = [];
  pageSize: number = 7;
  currentPage: number = 1;
  totalPages: number = 1;

  // Control de roles
  isAdmin: boolean = false;

  constructor(
    private horaService: HoraService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkUserRole(); // Verificar rol del usuario
    this.route.params.subscribe((params) => {
      const id = +params['id']; // Obtener el parámetro ID de la URL
      if (!isNaN(id)) {
        this.showList = false;
        this.getHoraById(id); // Cargar detalle
        this.getExtraById(id);
      } else {
        this.showList = true;
        this.loadUsers();
        this.loadHoras(); // Cargar lista
        this.loadExtra();
      }
    });
  }

  // Control de roles
  checkUserRole(): void {
    const userRole = localStorage.getItem('role'); // Cambié 'userRole' por 'role'
    this.isAdmin = userRole === 'Admin'; // Cambié 'admin' por 'Admin' (mayúscula)
  }

  loadUsers(): void {
    this.userService.getListUser().subscribe((users: UResponse[]) => {
      this.listUsers = users;
    });
  }

  loadHoras(): void {
    this.loading = true;
    this.horaService.getHoras().subscribe((data: Hora[]) => {
      this.listHoras = data;
      this.filteredHoras = data;
      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      this.filteredHoras = data.filter(
        (hora) => new Date(hora.Fecha).getTime() >= startOfMonth.getTime()
      );
      this.filteredHoras.sort(
        (a, b) => new Date(a.Fecha).getTime() - new Date(b.Fecha).getTime()
      );
      this.updatePagination(); // Actualizar paginación
      this.loading = false;
    });
  }
  getExtraHoursBadgeClass(acumulado: string | number): string {
    const valor = this.parseTimeToMinutes(acumulado.toString());

    if (valor > 0) {
      return 'hours-badge positive'; // Verde para horas extras
    } else if (valor < 0) {
      return 'hours-badge negative'; // Rojo para horas debidas
    } else {
      return 'hours-badge neutral'; // Gris para cero horas
    }
  }
  getExtraCellClass(extra: string | number): string {
    const valor = this.parseTimeToMinutes(extra.toString());

    if (valor > 0) {
      return 'extra-cell positive';
    } else if (valor < 0) {
      return 'extra-cell negative';
    } else {
      return 'extra-cell neutral';
    }
  }
  getExtraIconClass(extra: string | number): string {
    const valor = this.parseTimeToMinutes(extra.toString());

    if (valor > 0) {
      return 'extra-icon positive';
    } else if (valor < 0) {
      return 'extra-icon negative';
    } else {
      return 'extra-icon neutral';
    }
  }
  getRowClass(item: any): string {
    const extraMinutes = this.parseTimeToMinutes(item.Extra);

    if (extraMinutes > 0) {
      return 'row-with-extra'; // Fila con horas extras
    } else if (extraMinutes < 0) {
      return 'row-with-debt'; // Fila con horas debidas
    } else {
      return ''; // Fila normal
    }
  }
  private parseTimeToMinutes(timeValue: string): number {
    if (!timeValue) return 0;

    // Si es un número directo
    if (!isNaN(Number(timeValue))) {
      return Number(timeValue);
    }

    // Si es formato HH:MM
    const timeParts = timeValue.toString().split(':');
    if (timeParts.length === 2) {
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      return hours * 60 + minutes;
    }

    // Si contiene texto como "2h 30m"
    const hourMatch = timeValue.match(/(-?\d+)h/);
    const minuteMatch = timeValue.match(/(-?\d+)m/);

    let totalMinutes = 0;
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1], 10) * 60;
    }
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1], 10);
    }

    return totalMinutes;
  }
  loadHoras2(): void {
    this.loading = true;
    this.horaService.getHoras().subscribe((data: Hora[]) => {
      this.listHoras = data.map((hora) => {
        const user = this.listUsers.find((u) => u.Uid === hora.Hid);
        console.log(user);
        return {
          ...hora,
          Name: user ? `aca${user.name}` : `1${hora.Name}`,
        };
      });
      console.log(this.listHoras);
      this.filteredHoras = this.listHoras;
      this.updatePagination(); // Actualizar paginación
      this.loading = false;
    });
  }

  loadExtra(): void {
    this.loading = true;
    this.horaService.getExtra().subscribe((data: Extra[]) => {
      this.listExtra = data;
      this.filterdExtra = data;
      this.loading = false;
    });
  }

  getHoraById(id: number): void {
    this.loading = true;

    this.horaService.getHorarioById(id).subscribe(
      (data: Hora[]) => {
        this.listHoras = data;
        this.filteredHoras = data;
        this.loading = false;
        this.filteredHoras = data.filter((hora) => {
          const horaDate = new Date(hora.Fecha);
          const currentDate = new Date();
          const oneMonthAgo = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            currentDate.getDate()
          );
          return horaDate >= oneMonthAgo && horaDate <= currentDate;
        });
        this.updatePagination(); // Actualizar paginación
      },
      (error) => {
        console.error('Error al obtener la hora', error);
        this.loading = false;
      }
    );
  }

  getExtraById(id: number): void {
    this.loading = true;
    this.horaService.getExtraById(id).subscribe(
      (dato: Extra[]) => {
        this.listExtra = dato;
        this.filterdExtra = dato;
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener la hora', error);
        this.loading = false;
      }
    );
  }

  getHoraByFecha(fecha: string): void {
    this.loading = true;

    this.horaService.getHorarioByFecha(fecha).subscribe(
      (data: Hora[]) => {
        this.listHoras = data;
        this.filteredHoras = data;
        this.updatePagination(); // Actualizar paginación
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener la hora', error);
        this.loading = false;
      }
    );
  }

  navigateToEditSalida(Hid: number, fecha: string): void {
    localStorage.setItem('horaId', Hid.toString());
    localStorage.setItem('horaFecha', fecha);
    this.router.navigate(['/editar-salida', Hid, fecha]);
  }

  agregarRegistro(): void {
    this.router.navigate(['/nuevoRegistro']);
  }

  sortHoursID(order: string): void {
    this.sortOrder = order;
    if (order === 'asc') {
      this.filteredHoras.sort((a, b) => a.Hid - b.Hid);
      this.filterdExtra.sort((a, b) => a.Hid - b.Hid);
    } else if (order === 'desc') {
      this.filteredHoras.sort((a, b) => b.Hid - a.Hid);
      this.filterdExtra.sort((a, b) => b.Hid - a.Hid);
    }
    this.updatePagination(); // Actualizar paginación después de ordenar
  }

  sortHours(order: string): void {
    this.sortOrder = order;
    if (order === 'asc') {
      this.filteredHoras.sort(
        (a, b) => new Date(a.Fecha).getTime() - new Date(b.Fecha).getTime()
      );
    } else if (order === 'desc') {
      this.filteredHoras.sort(
        (a, b) => new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime()
      );
    }
    this.updatePagination(); // Actualizar paginación después de ordenar
  }

  filterByDataRange(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate).getTime();
      const end = new Date(this.endDate).getTime();
      this.filteredHoras = this.listHoras.filter((hora) => {
        const fecha = new Date(hora.Fecha).getTime();
        return fecha >= start && fecha <= end;
      });
    } else {
      this.filteredHoras = this.listHoras;
    }
    this.updatePagination(); // Actualizar paginación después de filtrar
  }

  filterByWeek(): void {
    if (this.week) {
      const [year, week] = this.week.split('-W').map(Number);
      const start = this.getDateOfISOWeek(week, year).getTime();
      const end = this.getEndOfISOWeek(week, year).getTime();
      this.filteredHoras = this.listHoras.filter((hora) => {
        const fecha = new Date(hora.Fecha).getTime();
        return fecha >= start && fecha <= end;
      });
    } else {
      this.filteredHoras = this.listHoras;
    }
    this.updatePagination(); // Actualizar paginación después de filtrar
  }

  getDateOfISOWeek(week: number, year: number): Date {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay());
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  }

  getEndOfISOWeek(week: number, year: number): Date {
    const startOfWeek = this.getDateOfISOWeek(week, year);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return endOfWeek;
  }

  filterdByName(): void {
    if (this.filterName) {
      this.filteredHoras = this.listHoras.filter((hora) =>
        hora.Name.toLowerCase().includes(this.filterName.toLowerCase())
      );
      this.filterdExtra = this.listExtra.filter((hora) =>
        hora.Name.toLowerCase().includes(this.filterName.toLowerCase())
      );
    } else {
      this.filteredHoras = this.listHoras;
      this.filterdExtra = this.listExtra;
    }
    this.updatePagination(); // Actualizar paginación después de filtrar
  }

  toggleDateWeek(): void {
    this.showDateRange = !this.showDateRange;
  }

  verHoras() {
    this.router.navigate([`/horas/`]);
  }

  // NUEVOS MÉTODOS PARA PAGINACIÓN
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredHoras.length / this.pageSize) || 1;
    this.goToPage(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedHoras = this.filteredHoras.slice(start, end);
  }

  getPageNumbers(): number[] {
    const maxVisiblePages = 5;
    const pages: number[] = [];

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(
        1,
        this.currentPage - Math.floor(maxVisiblePages / 2)
      );
      const endPage = Math.min(
        this.totalPages,
        startPage + maxVisiblePages - 1
      );

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  getStartIndex(): number {
    return this.filteredHoras.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredHoras.length
    );
  }
}
