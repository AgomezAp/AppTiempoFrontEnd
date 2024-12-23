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

@Component({
  selector: 'app-login',
  imports: [CommonModule,SpinnerComponent,FormsModule,RouterLink],
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
  
      const user = { email: this.email, password: this.password };
      this.loading = true;
  
      this.userService.logIn(user).subscribe({
        next: (response: any) => {
          const token = response.token;
          const role = response.role;
          const userId = response.userId;
          const Aid = response.Aid;
          this.loading = false;
          this.toastr.success('', 'Bienvenido');
          localStorage.setItem('token', token);
          localStorage.setItem('userId', userId); 
          localStorage.setItem('Aid', Aid);
          console.log(response.id);
          localStorage.setItem('role', role); // Guarda el rol en el localStorage
          this.router.navigate(['/horas']);
        },
        error: (e: HttpErrorResponse) => {
          this.loading = false;
          this.errorService.messageError(e);
        }
      });
    }
    
}
