import { Component } from '@angular/core';
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
  editandoHoras: {[key: number]: boolean} = {};
  horasTemp: { [key: number]: string} = {}
  errorMesssage: {[key: number]: string}= {}

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
      data.forEach(novedad => {
        this.horasTemp[novedad.Nid] = novedad.horas;
        this.editandoHoras[novedad.Nid] = false;
      })
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

  activarEdicion(novedad: Novedad){
    this.filteredNovedad.forEach(item => {
      this.editandoHoras[item.Nid] = false;
    });
    this.editandoHoras[novedad.Nid] = true;
    this.horasTemp[novedad.Nid] = novedad.horas;
  }

  guardarHora(novedad: Novedad) {
    const hora = this.horasTemp[novedad.Nid];
    if(!this.validarHora(hora)) {
      console.error('Formato de hora invalido');
      return
    }
    this.novedadService.actualizaHora(novedad.Nid, hora).subscribe({
      next: () => {
        novedad.horas = hora;
        this.editandoHoras[novedad.Nid] = false;
      },
      error: (err) => {
        console.error('Error al actualizar la hora', err);
      }
    });
  }

  cancelarEdicion(novedad: Novedad){
    this.editandoHoras[novedad.Nid] = false;
  }

  validarHora(hora: string): boolean {
    const regex = /^-?\d+:(00|30)$/;
    return regex.test(hora);
  }

  validarInput(event: KeyboardEvent) {
    const key = event.key
    if (!/[\d:-]/.test(key)) {
      event.preventDefault();
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
        novedad.editable = true;

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
