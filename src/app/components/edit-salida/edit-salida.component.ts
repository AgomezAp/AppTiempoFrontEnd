import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HoraService } from '../../services/hora.service';
import { Hora } from '../../interfaces/hora';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { response } from 'express';

@Component({
  selector: 'app-edit-salida',
  imports	: [ FormsModule, CommonModule],
  templateUrl: './edit-salida.component.html',
  styleUrls: ['./edit-salida.component.css']
})
export class EditSalidaComponent implements OnInit {
  
  editingSalida: Hora = {
    ID: 0,
    Name: '',
    Entrada: '',
    Salida: '',
    Fecha: '',
    Extra: ''
  };
  loading: boolean = false;

  constructor(
    private route: Router,
    private horaService: HoraService,
    private toastr: ToastrService
  ) {}
  

  async ngOnInit(): Promise<void> {
    
    const id = localStorage.getItem('horaId');
    const fecha = localStorage.getItem('horaFecha')

    if (id && fecha) {
      try {
        const response = await firstValueFrom(this.horaService.getRegistro(+id, fecha));
        this.loading = false;
        this.editingSalida = {
          ID: response.ID || +id,
          Name: response.Name || '',
          Entrada: response.Entrada || '',
          Salida: response.Salida || '',
          Fecha: response.Fecha || fecha,
          Extra: response.Extra || ''
        };
        console.log('Datos recibidos del backend:', response)
        this.editingSalida = response;
        this.editingSalida.ID = response.ID || +id;
        
      } catch (error) {
        this.loading = true;
        this.toastr.error('Error al cargar el horario');
      }
    } else {
      console.log('ID and Date is null');
      this.loading = true;
    }
  }

  async updateSalida(): Promise<void>{
    try {
      this.loading = true;
      await firstValueFrom(this.horaService.updateSalida(this.editingSalida.ID, this.editingSalida.Fecha, this.editingSalida.Salida))
      this.toastr.success('Hora actualizada correctamente');
      this.route.navigate(['/horas']);
    } catch (error) {
      this.toastr.error('Error al actualizar la hora');
      console.error(error)
    this.loading = true;
    }
    this.loading = false;
  }


  cancelEdit() {
    this.route.navigate(['/horas']);  
  }
}
