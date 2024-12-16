import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-acces-denied',
  imports: [],
  templateUrl: './acces-denied.component.html',
  styleUrl: './acces-denied.component.css'
})
export class AccesDeniedComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back(); // Volver a la página anterior
  }
}
