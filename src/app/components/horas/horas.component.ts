import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Hora } from '../../interfaces/hora';

import { HoraService } from '../../services/hora.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { NgxPaginationModule } from 'ngx-pagination';

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
  filteredHoras: any[] = [];
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


  constructor(
    private horaService: HoraService,
    private route: ActivatedRoute,
    private router: Router) {}

    ngOnInit(): void {
      this.route.params.subscribe((params) => {
        const id = +params['id']; // Obtener el parámetro ID de la URL
        if (!isNaN(id)) {
          this.showList = false;
          this.getHoraById(id); // Cargar detalle
        } else {
          this.showList = true;
          this.loadHoras(); // Cargar lista
        }
      });
    }

  loadHoras(): void {
    this.loading = true;
    this.horaService.getHoras().subscribe((data: Hora[]) => {
      this.listHoras = data;
      this.filteredHoras = data;
      this.loading = false;
      console.log(data);
    });
  }

  getHoraById(id: number): void {
    this.loading = true;
    
    this.horaService.getHorarioById(id).subscribe((data: Hora[]) => {
        this.listHoras = data;
        this.filteredHoras = data;
        this.loading = false;
        console.log(data);
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
        console.log(data);
      },
      (error) => {
        console.error('Error al obtener la hora', error);
        this.loading = false;
      }
    );
  }

  navigateToEditSalida(id: number, fecha: string): void {
    localStorage.setItem('horaId', id.toString());
    localStorage.setItem('horaFecha', fecha);
    this.router.navigate(['/editar-salida', id, fecha]);
  }
  navigateToEditEntrada(id: number, fecha: string): void {
    localStorage.setItem('horaId', id.toString());
    localStorage.setItem('horaFecha', fecha);
    this.router.navigate(['/editar-salida', id, fecha]);
  }
  sortHoursID(order: string): void {
    this.sortOrder = order;
    if (order === 'asc') {
      this.filteredHoras.sort((a,b) => a.ID - b.ID);
    } else if (order === 'desc') {
      this.filteredHoras.sort((a,b) => b.ID - a.ID);
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
    } else {
      this.filteredHoras = this.listHoras
    }
  }

  toggleDateWeek(): void{
    this.showDateRange = !this.showDateRange
  }

}