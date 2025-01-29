import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HoraService } from '../../services/hora.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { application, response } from 'express';
@Component({
  selector: 'app-informes',
  imports: [NavbarComponent, FormsModule],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css'
})
export class InformesComponent {
  id: number[] = [];
  fechaInicial: string = '';
  fechaFinal: string = '';
  tipo: number = 0;
  loading: boolean= false;


  constructor(
    private horaService: HoraService,
    private toastr: ToastrService) {}

  generarInformePersonal() {
    console.log('id',this.id);
    console.log('fin',this.fechaFinal);
    console.log('inicio',this.fechaInicial);
    
    // if(this.id.length || this.startDate || this.endDate) {

    //   this.toastr.error('Por favor, completa todos los campos' )
    //   return;
    // }
    this.loading = true;
    const data = {
      id: this.id,
      fechaInicial: this.fechaInicial,
      fechaFinal: this.fechaFinal,
    };
    
    this.horaService.informePersonal(this.id, this.fechaInicial, this.fechaInicial).subscribe({
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

    // this.horaService.informePersonal( this.id, this.startDate, this.endDate).subscribe(
    //   response => {
    //     console.log('informe', response);
    //   },
    //   error => {
    //     console.error('error', error);
    //   }
    // )
  }
}
