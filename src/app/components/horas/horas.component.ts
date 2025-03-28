import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Extra, Hora } from '../../interfaces/hora';
import { UResponse } from '../../interfaces/user'
import { HoraService } from '../../services/hora.service';
import * as bootstrap from 'bootstrap';
import { NavbarComponent } from '../navbar/navbar.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-horas',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgxPaginationModule],
  templateUrl: './horas.component.html',
  styleUrl: './horas.component.css'
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
  selectedItem: any = null


  constructor(
    private horaService: HoraService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router) {}

    ngOnInit(): void {
      this.route.params.subscribe((params) => {
        const id = +params['id']; // Obtener el parámetro ID de la URL
        if (!isNaN(id)) {
          this.showList = false;
          this.getHoraById(id); // Cargar detalle
          this.getExtraById(id)
        } else {
          this.showList = true;
          this.loadUsers();
          this.loadHoras(); // Cargar lista
          this.loadExtra();
        }
      });
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
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      this.filteredHoras = data.filter(hora => new Date(hora.Fecha).getTime() >= startOfMonth.getTime());
      this.filteredHoras.sort((a, b) => new Date(a.Fecha).getTime() - new Date(b.Fecha).getTime());
      this.loading = false;
    });
  }
  loadHoras2(): void {
    this.loading = true;
    this.horaService.getHoras().subscribe((data: Hora[]) => {
      this.listHoras = data.map((hora) => {
        const user = this.listUsers.find((u) => u.Uid === hora.Hid);
        console.log(user)
        return {
          ...hora,
          Name: user ? `aca${user.name}` : `1${hora.Name}`
        };
      });
      console.log(this.listHoras)
      this.filteredHoras = this.listHoras;
      this.loading = false;
    });
  }

  loadExtra(): void {
    this.loading = true
    this.horaService.getExtra().subscribe((data: Extra[]) => {
      this.listExtra = data;
      this.filterdExtra = data;
      this.loading=false;
    })
  }

  getHoraById(id: number): void {
    this.loading = true;
    
    this.horaService.getHorarioById(id).subscribe((data: Hora[]) => {
        this.listHoras = data;
        this.filteredHoras = data;
        this.loading = false;
        this.filteredHoras = data.filter(hora => {
          const horaDate = new Date(hora.Fecha);
          const currentDate = new Date();
          const oneMonthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
          return horaDate >= oneMonthAgo && horaDate <= currentDate;
        });
      },
      (error) => {
        console.error('Error al obtener la hora', error);
        this.loading = false;
      }
    );
  }

  getExtraById(id: number): void {
    this.loading = true;
    this.horaService.getExtraById(id).subscribe((dato: Extra[]) => {
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
    
    this.horaService.getHorarioByFecha(fecha).subscribe((data: Hora[]) => {
        this.listHoras = data;
        this.filteredHoras = data;
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
      this.filteredHoras.sort((a,b) => a.Hid - b.Hid);
      this.filterdExtra.sort((a,b) => a.Hid - b.Hid)
    } else if (order === 'desc') {
      this.filteredHoras.sort((a,b) => b.Hid - a.Hid);
      this.filterdExtra.sort((a,b) => b.Hid - a.Hid);

    }
  }
  sortHours(order: string): void {
    this.sortOrder = order;
    if (order === 'asc') {
      this.filteredHoras.sort((a,b) => new Date(a.Fecha).getTime() - new Date(b.Fecha).getTime());
    } else if (order === 'desc') {
      this.filteredHoras.sort((a,b) => new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime());
    }
  }

  filterByDataRange(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate).getTime();
      const end = new Date(this.endDate).getTime();
      this.filteredHoras = this.listHoras.filter(hora => {
        const fecha = new Date(hora.Fecha).getTime();
        return fecha >= start && fecha <= end;
      });
    } else {
      this.filteredHoras = this.listHoras;
    }
  }

  filterByWeek(): void {
    if(this.week) {
      const [year, week] = this.week.split('-W').map(Number);
      const start = this.getDateOfISOWeek(week, year).getTime()
      const end = this.getEndOfISOWeek(week, year).getTime()
      this.filteredHoras = this.listHoras.filter(hora => {
        const fecha = new Date(hora.Fecha).getTime();
        return fecha >= start && fecha <= end;
      });
    } else {
      this.filteredHoras = this.listHoras;
    }
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
    if(this.filterName) {
      this.filteredHoras = this.listHoras.filter(hora => hora.Name.toLowerCase().includes(this.filterName.toLowerCase()));
      this.filterdExtra = this.listExtra.filter(hora => hora.Name.toLowerCase().includes(this.filterName.toLowerCase()));

    } else {
      this.filteredHoras = this.listHoras
      this.filterdExtra = this.listExtra
    }
  }

  toggleDateWeek(): void{
    this.showDateRange = !this.showDateRange
  }

  verHoras() {
    this.router.navigate([`/horas/`])
  }
}