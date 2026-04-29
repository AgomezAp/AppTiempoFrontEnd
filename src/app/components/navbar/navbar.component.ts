import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActaRecargaService } from '../../services/acta-recarga.service';
import { RolesService } from '../../services/roles.service';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  esAdmin = false;
  userName = '';
  userRole = '';
  userId = '';
  tieneAccesoActas = false;
  modulosUsuario: string[] = [];

  constructor(
    private router: Router,
    private actaService: ActaRecargaService,
    private rolesService: RolesService
  ) {}

  ngOnInit() {
    this.verificarRol();
    this.verificarAccesoActas();
    const token = localStorage.getItem('token');
    if (token) {
      this.rolesService.getMisModulos().subscribe({
        next: (res) => this.modulosUsuario = res.modulos,
        error: () => this.modulosUsuario = []
      });
    }
  }

  tieneModulo(key: string): boolean {
    if (this.esAdmin) return true;
    return this.modulosUsuario.includes(key);
  }

  verificarRol() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userRole = payload.role || '';
        this.esAdmin = this.userRole === 'Admin';
        this.userName = payload.name || '';
        this.userId = payload.id || localStorage.getItem('userId') || '';
      } catch (e) {
        this.esAdmin = false;
      }
    }
  }

  verificarAccesoActas() {
    this.actaService.verificarMiAcceso().subscribe({
      next: (res) => {
        this.tieneAccesoActas = res.tieneAcceso;
      },
      error: () => {
        this.tieneAccesoActas = false;
      }
    });
  }

  logOut(){
    localStorage.removeItem('token')
    localStorage.clear();
    this.router.navigate(['/logIn'])
  }

  verHoras() {
    const id = Number(localStorage.getItem('userId'))
    this.router.navigate([`/horas/${id}`])
  }
}
