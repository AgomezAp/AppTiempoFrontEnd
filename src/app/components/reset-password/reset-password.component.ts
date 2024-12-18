import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink,
} from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  loading: boolean = false;

  constructor(private userService: UserService, private toastr: ToastrService, private router: Router) {}

  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Las contraseñas no coinciden', 'Error');
      return;
    }

    this.loading = true;
    this.userService.resetPassword({ email: this.email, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.loading = false;
        this.toastr.success('Contraseña restablecida con éxito', 'Éxito');
        this.router.navigate(['/logIn']);
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 404) {
          this.toastr.error('El correo electrónico no existe', 'Error');
        } else {
          this.toastr.error('Error al restablecer la contraseña', 'Error');
        }
      }
    });
  }
}