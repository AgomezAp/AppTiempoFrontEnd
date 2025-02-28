import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HoraService } from '../../services/hora.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { application, response } from 'express';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-informes',
  imports: [NavbarComponent, FormsModule, CommonModule],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css'
})
export class InformesComponent {
  id: string = '';
  ids: number[] = []
  fechaInicial: string = '';
  fechaFinal: string = '';
  tipo: string = 'personal';
  loading: boolean= false;
  name: string = ''
  nombres: string[] = []
  usuarios: any[] = []
  seleccionados: number[] = [];

  constructor(
    private router: Router,
    private horaService: HoraService,
    private toastr: ToastrService,
    private userService: UserService) {}

  seleccionarTipoInforme(tipoinforme: string) {
    this.tipo = tipoinforme;
  }
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
        this.name = selectedUsuario.nombre;
        this.id = String(selectedUsuario.Uid);
      }
  }
  onCheckboxChange(event: any, usuario:any): void {
    if (event.target.checked) {
      // Agrega el ID si no está en la lista
      if (!this.seleccionados.includes(usuario.Uid)) {
        this.seleccionados.push(usuario.Uid);
      }
    } else {
      // Elimina el ID si se desmarca el checkbox
      this.seleccionados = this.seleccionados.filter(id => id !== usuario.Uid);
    }
  }
  agregarNombre(): void {
    if (this.name) {
      const usuario = this.usuarios.find(u => u.nombre === this.name);
      if (usuario && !this.ids.includes(usuario.Uid)) {
        this.nombres.push(usuario.nombre);
        this.ids.push(usuario.Uid);
        this.id = this.ids.join(', ');
        this.name = '';
      }
    }
  }
  agregarNombres(): void {
    if (this.seleccionados.length > 0) {
      this.seleccionados.forEach(id => {
        const usuario = this.usuarios.find(u => u.Uid === id);
        if (usuario && !this.ids.includes(id)) {
          this.nombres.push(usuario.nombre);
          this.ids.push(id);
        }
      });
      // Limpiar selección después de añadir
      this.id = this.ids.join(', ');
      this.seleccionados = [];
    }
  }
  generarInforme() {
    if (this.tipo === 'personal') {
      this.generarInformePersonal();
    } else if (this.tipo === 'novedad') {
      this.generarInformeNovedad();
    } else if (this.tipo === 'riesgo') {
      this.generarInformeRiesgo();
    }
  }
  generarInformePersonal() {
    
    if(!this.id || !this.fechaInicial || !this.fechaFinal) {

      this.toastr.error('Por favor, completa todos los campos' )
      return;
    }
    this.loading = true;
    const idArray = this.id.split(',').map(id => parseInt(id.trim(), 10));
    const data = {
      id: idArray,
      fechaInicial: this.fechaInicial,
      fechaFinal: this.fechaFinal,
    };
    
    this.horaService.informePersonal(data.id, data.fechaInicial, data.fechaFinal).subscribe({
      next: (response) => {
        const blob = new Blob([response],{type: 'application/pdf'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Informe_personal_${new Date().toISOString()}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loading = false; 
      },
      error: (error) => {
        console.error('Error al general el informe:1', error);
        this.toastr.error('Ocurrio un error al general el informe, intentalo de nuevo.');
        this.loading = false;
      }
    });

    

  }

  generarInformeNovedad() {
    if (!this.fechaInicial || !this.fechaFinal) {
      this.toastr.error('Por favor, completa todos los campos');
      return;
    }
    this.loading = true;
    const data = {
      fechaInicial: this.fechaInicial,
      fechaFinal: this.fechaFinal,
    };
    this.horaService.informeNovedad(data.fechaInicial, data.fechaFinal).subscribe({
      next: (response) => {
        const blob = new Blob([response],{type: 'application/pdf'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Novedades_${data.fechaInicial}_${data.fechaFinal}.pdf`
        a.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al generar el informe', error)
        this.toastr.error('Ocurrio un error al general el informe, intentalo de nuevo.');
        this.loading = false;
      }
    });
  }

  generarInformeRiesgo() {
    if (!this.fechaInicial || !this.fechaFinal) {
      this.toastr.error('Por favor, completa todos los campos');
      return;
    }

    this.loading = true;
    const data = {
      fechaInicial: this.fechaInicial,
      fechaFinal: this.fechaFinal,
    };

    this.horaService.informeRiesgo(data.fechaInicial, data.fechaFinal).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Riesgo_${data.fechaInicial}_${data.fechaFinal}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al generar el informe:', error);
        this.toastr.error('Ocurrió un error al generar el informe, inténtalo de nuevo.');
        this.loading = false;
      }
    });
  }
  cancelEdit() {
    this.router.navigate(['/horas']);  
  }  
}
