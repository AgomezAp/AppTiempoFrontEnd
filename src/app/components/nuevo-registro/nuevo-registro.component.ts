import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HoraService } from '../../services/hora.service';
import { UserService } from '../../services/user.service'
import { Router } from '@angular/router';
import { response } from 'express';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
@Component({
  selector: 'app-nuevo-registro',
  imports: [NavbarComponent, FormsModule, CommonModule],
  templateUrl: './nuevo-registro.component.html',
  styleUrl: './nuevo-registro.component.css'
})
export class NuevoRegistroComponent {
  loading: boolean = false;
  newRegistro: any = {
    Hid: '',
    Name: '',
    Entrada: '',
    Salida: '',
    Fecha: '',
    // Extra: '',
    // Total: '',
  };
  usuarios: any[] = []
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private horaService: HoraService,
    private userService: UserService
  ) {}

  ngOnInit(){
    this.userService.getListUser().subscribe(
      (data: any[]) => {
        this.usuarios = data;
        console.log('Usuarios recibidos', this.usuarios)
      },
      (error) => {
        console.log('Error al obtener los nombres', error);
      }
    );
  }
  onNombreChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const selectedUsuario = this.usuarios.find(usuario => usuario.nombre === target.value);
      if (selectedUsuario) {
        this.newRegistro.Hid = selectedUsuario.Uid;
      }
  }
  addRegistro() {
    this.loading = true;
    const entrada =  this.formatDate(this.newRegistro.Fecha, this.newRegistro.Entrada);
    const salida =  this.formatDate(this.newRegistro.Fecha, this.newRegistro.Salida); 
    const registroData = {
      Hid: this.newRegistro.Hid.toString(),
      Name: this.newRegistro.Name,
      Entrada: entrada,
      Salida: salida,
      // Extra: this.newRegistro.Extra,
      Fecha: this.newRegistro.Fecha,
      // Total: this.newRegistro.Total,
    };
    this.horaService.createRegistro(registroData).subscribe({
      next: (response) => {
        console.log('Registro agregado con exito', response);
        this.loading = false;
        this.router.navigate(['/horas']);
      },
      error: (err) => {
        console.error('Error al agregar el registro', err);
        this.toastr.error('Error al crear el registro completa todos los campos');
        this.loading = false;
      }
    })
    
  }
  formatDate(date: string, time: string): string {
    const dateTime = DateTime.fromISO(`${date}T${time}:00.000`, { zone: 'America/Bogota' });
    return dateTime.toFormat("yyyy-MM-dd HH:mm:ss.SSS ' -05:00'");
  } 
  cancelEdit() {
    this.router.navigate(['/horas']);  
  }  
}
