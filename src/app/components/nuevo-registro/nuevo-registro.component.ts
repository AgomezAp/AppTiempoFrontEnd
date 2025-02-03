import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HoraService } from '../../services/hora.service';
import { UserService } from '../../services/user.service'
import { Router } from '@angular/router';
import { response } from 'express';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-nuevo-registro',
  imports: [NavbarComponent, FormsModule, CommonModule],
  templateUrl: './nuevo-registro.component.html',
  styleUrl: './nuevo-registro.component.css'
})
export class NuevoRegistroComponent {
  loading: boolean = false;
  newRegistro: any = {
    Hid: 0,
    Name: '',
    Entrada: '',
    Salida: '',
    Fecha: '',
    Extra: '',
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
    const registroData = {
      Hid: this.newRegistro.Hid,
      Name: this.newRegistro.Name,
      Entrada: this.newRegistro.Entrada,
      Salida: this.newRegistro.Salida,
      Extra: this.newRegistro.Extra,
      Fecha: this.newRegistro.Fecha,
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

  cancelEdit() {
    this.router.navigate(['/horas']);  
  }

}
