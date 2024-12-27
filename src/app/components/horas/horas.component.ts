import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
export class HorasComponent {
  listHoras: any[] = [];
  filteredHoras: any[] = [];
  filterText: string = '';
  totalQuantity: number = 0;
  loading: boolean = false;

  p: number = 1;
  itemsPerPage: number = 10;
  sortOrder: string = 'asc';

  constructor(
    private horaService: HoraService,
    private router: Router) {}

  ngOnInit(): void {
    this.loading = true;
    this.loadHoras();
  }

  loadHoras(): void {
    this.horaService.getHoras().subscribe((data: any[]) => {
      this.listHoras = data;
      this.filteredHoras = data;
      this.updateTotalQuantity();
      this.loading = false;
      console.log(data);
    });
  }
  updateTotalQuantity(): void {
    this.totalQuantity = this.filteredHoras.reduce((acc, product) => acc + product.quantity, 0);
    this.loading = false;
  }
  applyFilter(): void {
    this.filteredHoras = this.listHoras.filter(hora => hora.name.toLowerCase().includes(this.filterText.toLowerCase()));
    this.updateTotalQuantity();
  }

  sortdata(order: string): void {
    if (order === 'asc') {
      this.filteredHoras.sort((a, b) => a.quantity - b.quantity);
    } else if (order === 'desc') {
      this.filteredHoras.sort((a, b) => b.quantity - a.quantity);
    }
  }

  navigateToEdit(id: number): void {
    localStorage.setItem('horaId', id.toString());
    this.router.navigate(['/edit-hora', id]);
  }


}