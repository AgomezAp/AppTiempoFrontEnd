import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HoraService } from '../../services/hora.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-informes',
  imports: [NavbarComponent, FormsModule],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.css'
})
export class InformesComponent {
  id: number;
  startDate: Date;
  endDate: Date;

  constructor(private horaService: HoraService) {
    this.id = 0;
    this.startDate = new Date();
    this.endDate = new Date();
  }

  // informePersonal() {
  //   const startDateStr = this.startDate.toISOString();
  //   const endDateStr = this.endDate.toISOString();
  //   console.log(startDateStr);
  //   console.log(endDateStr);
  //   this.horaService.informePersonal(this.id, startDateStr, endDateStr)
  //     .subscribe(response => {
  //     const fileURL = URL.createObjectURL(new Blob([response as Blob], { type: 'application/pdf' }));
  //     window.open(fileURL);
  //     }, error => {
  //     console.error('Error al obtener el informe personal:', error);
  //     });
  // }
}
