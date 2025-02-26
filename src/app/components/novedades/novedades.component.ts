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
  styleUrl: './novedades.component.css'
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
    console.log('loadNovedad1') 

    this.novedadService.verNovedadHistorico().subscribe((data: NovedadHistorico[]) => {
      console.log('loadNovedad2') 

      this.listNovedad = data;
      this.filteredNovedad = data;
      console.log('loadNovedad3') 
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

  revision(Cid: number): void {
    console.log(this.filteredNovedad)
    console.log(Cid)
    this.novedadService.errorNovedad(Cid).subscribe({
      next: (response) => {
        this.toastr.success('Revisión completada con éxito');
      }, 
      error: (err) => {
        console.error('Error al mover la novedad:', err);
      }
    })
  }


}
