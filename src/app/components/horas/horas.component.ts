import { Component } from '@angular/core';

import { HoraService } from '../../services/hora.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-horas',
  imports: [NavbarComponent],
  templateUrl: './horas.component.html',
  styleUrl: './horas.component.css'
})
export class HorasComponent {
  listHoras: any[] = [];

  constructor(private horaService: HoraService) {}

  ngOnInit(): void {
    this.loadHoras();
  }

  loadHoras(): void {
    this.horaService.getHoras().subscribe(
      (horas) => {
        this.listHoras = horas;
      },
      (error) => {
        console.error('Error al cargar las horas', error);
      }
    );
  }
}
