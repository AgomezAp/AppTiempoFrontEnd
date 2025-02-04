import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NovedadService } from '../../services/novedad.service';
import { Novedad } from '../../interfaces/hora';
import { response } from 'express';
@Component({
  selector: 'app-ver-novedad',
  imports: [NavbarComponent, FormsModule, CommonModule],
  templateUrl: './ver-novedad.component.html',
  styleUrl: './ver-novedad.component.css'
})
export class VerNovedadComponent {
  loading: boolean = true;
  listNovedad: Novedad[] = [];
  filteredNovedad: Novedad[] = [];
  showList: boolean = true;
  filterName: string = '';
  fecha: string = '';
  horas: string = '';
  id: number = 0;


  constructor(
    private route : ActivatedRoute,
    private novedadService: NovedadService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.showList = true;
    this.loadNovedad();    
  }

  loadNovedad(): void {
    this.loading = true;
    this.novedadService.verNovedad().subscribe((data: Novedad[]) => {
      this.listNovedad = data;
      this.filteredNovedad = data;
      console.log(data);
    });
  }

  filterdByName(): void {
    if(this.filterName) {
      this.filteredNovedad = this.listNovedad.filter(novedad => novedad.Name.toLowerCase().includes(this.filterName.toLowerCase()));
    } else {
      this.filteredNovedad = this.listNovedad
    }
  }

  filterByData(): void {
    if(this.fecha) {
      const fecha = new Date(this.fecha).getTime();
      this.filteredNovedad = this.listNovedad.filter(novedad => {
        const fechaN = new Date(novedad.Fecha).getTime();
        return fechaN === fecha;
      });
    } else {
      this.filteredNovedad = this.listNovedad
    }
  }

  crearNovedad() {
    console.log('Creando novedad');
    this.novedadService.createNovedad().subscribe(
      (respuesta: Novedad) => {
        console.log('Novedad creada con exito', respuesta);
      },
      (error) => {
        console.error('Error al crear novedad', error);
      }
    );
  }

  editarHora(novedad: any, hora: string) {
    this.novedadService.actualizaHora(novedad.id, hora).subscribe({
      next: () => {
        novedad.hora = hora;
      },
      error: (err) => {
        console.error('Error al actualizara', err);
      }
    });
  }

  editarEstado(novedad: any, aceptacion: boolean | null) {
    this.novedadService.actualizaEstado(novedad.id, aceptacion).subscribe({
      next: () => {
        novedad.aceptacion = aceptacion;
      },
      error: (err) => {
        console.error('Error al actualizara', err);
      }
    });
  }

  enviarAceptacion() {
    const datos = { /* Replace with actual data */ };
    this.novedadService.aceptar().subscribe(
      (respuesta: any) => {
        console.log('Aceptación enviada con éxito', respuesta);
      },
      (error) => {
        console.error('Error al enviar aceptación', error);
      }
    );
  }
}
