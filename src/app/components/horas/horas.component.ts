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
}