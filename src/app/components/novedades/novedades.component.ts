import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NovedadService } from '../../services/novedad.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { response } from 'express';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-novedades',
  imports: [FormsModule, SpinnerComponent, CommonModule, NavbarComponent],
  templateUrl: './novedades.component.html',
  styleUrl: './novedades.component.css'
})
export class NovedadesComponent {
  loading: boolean = false;
  newNovedad: any = {
    Name: '',
    ID: 0,
    type: '',
    description: '',
    Fecha: ''
  };
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private novedadService: NovedadService) {}

  addNovedad() {
    this.loading = true;
    const novedadData = {
      ID: this.newNovedad.ID,
      Name: this.newNovedad.Name,
      type: this.newNovedad.type,
      description: this.newNovedad.description,
      Fecha: this.newNovedad.Fecha
    };
    this.novedadService.createNovedad(novedadData).subscribe({
      next: (response) => {
        console.log('Novedad agregada con exito', response);
        this.loading = false;
        this.router.navigate(['/verNovedad']);
      },
      error: (err) => {
        console.error('Error al agregar novedad: front', err);
        this.toastr.error('Error al crear la novedad completa todos los camos');
        this.loading = false;
      }
    });
  }
  resetForm(){
    this.newNovedad = {
      ID: '',
      Name: '',
      type: '',
      description: '',
      Fecha: ''
    };
  }
  cancel() {
    this.loading = true;
    this.router.navigate(['/verNovedad'])

  }
}


