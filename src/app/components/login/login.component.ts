import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
} from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { ErrorsService } from '../../services/errors.service';
import { UserService } from '../../services/user.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { response } from 'express';

const SYSTEM_ROLES = ['Admin', 'User', 'Tecnologia'];

const MODULE_ROUTE_MAP: Record<string, string> = {
  horas:                   '/horas',
  novedades:               '/novedad',
  permisos:                '/permisos',
  usuarios:                '/admin',
  admin_roles:             '/admin-roles',
  recursos:                '/gestion-archivos',
  ssgt:                    '/ssgt-dashboard',
  rrhh_contratos:          '/contratos',
  rrhh_hoja_vida:          '/hoja-vida',
  rrhh_evaluaciones:       '/evaluaciones',
  inventario_dispositivos: '/inventario',
  inventario_mobiliario:   '/inventario-mobiliario',
  inventario_aseo:         '/inventario-aseo',
  inventario_papeleria:    '/inventario-papeleria',
  inventario_botiquin:     '/inventario-botiquin',
  inventario_desechables:  '/inventario-desechables',
  inventario_dotacion:     '/inventario-dotacion',
};

@Component({
  selector: 'app-login',
  imports: [CommonModule,SpinnerComponent,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

    email: string = ''
    password: string = ''
    loading: boolean = false
    constructor(private userService: UserService,private toastr: ToastrService,private router:Router,private errorService:ErrorsService){}
    
    logIn() {
      if (this.email === '' || this.password === '') {
        this.toastr.error('Todos los campos son obligatorios', 'Error');
        return;
      }
  
      const user = { email: this.email, password: this.password};
      this.loading = true;
      this.userService.logIn(user).subscribe({
        next: (response: any) => {
          const token = response.token;
          const role = response.role;
          const userId = response.userId;
          const Aid = response.Aid;
          const area = response.area || '';
          const correoLider = response.correolider;
          const email = user.email;
          const name = response.name;
          const lastname = response.lastname;
          const documentoIdentificacion = response.documentoIdentificacion || '';
          const modulos: string[] = response.modulos || [];
          this.loading = false;
          this.toastr.success('', 'Bienvenido');
          localStorage.setItem('token', token);
          localStorage.setItem('correoLider', correoLider);
          localStorage.setItem('userId', userId); 
          localStorage.setItem('Aid', Aid);
          localStorage.setItem('area', area);
          localStorage.setItem('email', email);
          localStorage.setItem('name', name);
          localStorage.setItem('lastname', lastname);
          localStorage.setItem('documentoIdentificacion', documentoIdentificacion);
          localStorage.setItem('role', role);
          localStorage.setItem('modulos', JSON.stringify(modulos));

          const isCustomRole = !SYSTEM_ROLES.includes(role);
          if (isCustomRole) {
            // Redirigir al primer módulo habilitado
            let redirect = '/access-denied';
            for (const mod of modulos) {
              const base = MODULE_ROUTE_MAP[mod];
              if (base) {
                redirect = mod === 'horas' || mod === 'rrhh_hoja_vida'
                  ? `${base}/${userId}`
                  : base;
                break;
              }
            }
            this.router.navigate([redirect]);
          } else {
            this.router.navigate([`/horas/${userId}`]);
          }
        },
        error: (e: HttpErrorResponse) => {
          this.loading = false;
          this.errorService.messageError(e);
        }
      });
    }
    uploadFiles() {}
    
}
