import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acces-denied',
  imports: [],
  templateUrl: './acces-denied.component.html',
  styleUrl: './acces-denied.component.css'
})
export class AccesDeniedComponent {
  constructor(private router: Router) { }

  ngOnInit(): void {
    // Redirigir a la página de horas después de 3 segundos
    setTimeout(() => {
      this.router.navigate(['/horas']);
    }, 3000);
  }

  // Método para redirigir inmediatamente a la página de horas
  redirectToHoras(): void {
    this.router.navigate(['/horas']);
  }
}
