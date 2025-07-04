import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule, NumberValueAccessor } from '@angular/forms';
import { NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, mapToResolve, Router } from '@angular/router';
import { NovedadService } from '../../services/novedad.service';
import { NovedadHistorico } from '../../interfaces/hora';
import { response } from 'express';
@Component({
  selector: 'app-novedades',
  imports: [NavbarComponent, FormsModule, CommonModule],
  templateUrl: './novedades.component.html',
  styleUrl: './novedades.component.css',
})
export class NovedadComponent {
  loading: boolean = true;
  listNovedad: NovedadHistorico[] = [];
  filteredNovedad: NovedadHistorico[] = [];
  showList: boolean = true;
  filterName: string = '';
  fecha: string = '';
  horas: string = '';
  id: number = 0;
  editandoHoras: any = {};
  horasTemp: any = {};
  errorMesssage: { [key: number]: string } = {};

  // Variables para paginación - Simplificadas
  currentPage: number = 1;
  itemsPerPage: number = 7; // Fijo en 7 elementos
  totalItems: number = 0;
  totalPages: number = 0;
  paginatedData: NovedadHistorico[] = [];

  constructor(
    private route: ActivatedRoute,
    private novedadService: NovedadService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.showList = true;
    this.loadNovedad();
  }

  loadNovedad(): void {
    this.loading = true;

    this.novedadService
      .verNovedadHistorico()
      .subscribe((data: NovedadHistorico[]) => {
        this.listNovedad = data;
        this.filteredNovedad = data;
        this.updatePagination();
      });
  }

  filterdByName(): void {
    if (this.filterName) {
      this.filteredNovedad = this.listNovedad.filter((novedad) =>
        novedad.Name.toLowerCase().includes(this.filterName.toLowerCase())
      );
    } else {
      this.filteredNovedad = this.listNovedad;
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  filterByData(): void {
    if (this.fecha) {
      const fecha = new Date(this.fecha).getTime();
      this.filteredNovedad = this.listNovedad.filter((novedad) => {
        const fechaN = new Date(novedad.Fecha).getTime();
        return fechaN === fecha;
      });
    } else {
      this.filteredNovedad = this.listNovedad;
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  // Métodos para paginación
  updatePagination(): void {
    this.totalItems = this.filteredNovedad.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.paginatedData = this.filteredNovedad.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  getVisiblePages(): number[] {
    const visiblePages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i);
    }

    return visiblePages;
  }

  // Métodos para mostrar información
  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  revision(Cid: number): void {
    String(Cid);
    this.novedadService.errorNovedad(String(Cid)).subscribe({
      next: (response) => {
        this.toastr.success('Revisión completada con éxito');
        this.loadNovedad();
      },
      error: (err) => {
        console.error('Error al mover la novedad:', err);
        this.toastr.error('Error al mover la novedad');
      },
    });
  }
}
