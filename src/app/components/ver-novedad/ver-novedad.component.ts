import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule, NumberValueAccessor } from '@angular/forms';
import { NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, mapToResolve, Router } from '@angular/router';
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
  editandoHoras: any = {};
  horasTemp: any = {}
  errorMesssage: {[key: number]: string}= {}

  constructor(
    private route : ActivatedRoute,
    private novedadService: NovedadService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.showList = true;
    this.loadNovedad();
    console.log('ngOnInit') 
  }

  loadNovedad(): void {
    this.loading = true;
    this.novedadService.verNovedad().subscribe((data: Novedad[]) => {
      this.listNovedad = data;
      this.filteredNovedad = data;
      console.log('loadNovedad') 
    });
  }

  filterdByName(): void {
    if(this.filterName) {
      this.filteredNovedad = this.listNovedad.filter(novedad => novedad.Name.toLowerCase().includes(this.filterName.toLowerCase()));
    } else {
      this.filteredNovedad = this.listNovedad
    }
    console.log('filterdByName') 
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
    console.log('filterByData')
  }

  activarEdicion(novedad: Novedad){
    this.editandoHoras[novedad.Nid] = true;
    this.horasTemp[novedad.Nid] = novedad.horas;
    console.log('activarEdicion')

  }
  validarYActualizarHora(id: number, horas: string): void {
    const regex = /^-?(0?[0-9]|1[0-9]|2[0-3]):(00|30)$/;
    console.log(id)
    if (regex.test(horas)) {
      this.novedadService.actualizaHora(id, horas).subscribe({
        next: (response) => {
          console.log('Hora actualizada', response);
          this.toastr.success('Hora actualizada exitosamente');
        },
        error: (err) => {
          console.error('Error al actualizar la hora', err);
        }
      });
    } else {
      console.warn('Formato de hora invalido');
      this.toastr.error('Por favor usa un formato correcto');

    }
    console.log('validarYActualizarHora')

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
    console.log('crearNovedad')
  }

  editarEstado(novedad: any, aceptacion: boolean | null) {
    this.novedadService.actualizaEstado(novedad.id, aceptacion).subscribe({
      next: () => {
        novedad.aceptacion = aceptacion;
        novedad.editable = true;
      },
      error: (err) => {
        console.error('Error al actualizara', err);
      }
    });
    console.log('editarEstado')
  }

  enviarAceptacion(): void {
    this.novedadService.aceptar().subscribe({
      next: (response: Novedad) => {
        console.log(`Novedad Aceptada:`, response);
        this.toastr.success('Novedades aceptadas exitosamente');
        this.loadNovedad()
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastr.error('Ninguna novedad para aceptar');
        }  else if (err.status === 500) {
          this.toastr.error('Error al aceptar la novedad');
        }
      },
    })
  }
}
