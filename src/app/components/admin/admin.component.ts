import {
  CommonModule,
  Location,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { UResponse } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-admin',
  imports: [NavbarComponent,CommonModule,SpinnerComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent  implements OnInit {
  users: UResponse[] = [];
  currentUserId: number | null = null;
  loading: boolean = false;
  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getAllUsers();
    this.loading = false;
    this.currentUserId = Number(localStorage.getItem('userId'));
  }

  getAllUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        console.log(data); // Verificar los datos obtenidos
        this.users = data;
        this.loading = false;

      },
      error: (err) => {
        this.toastr.error('Error al obtener los usuarios', 'Error');
      }
    });
  }

  deleteUser(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción es irreparable',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
          this.loading = true;
        this.userService.deleteUserById(id).subscribe({
          next: () => {
            this.toastr.success('Usuario eliminado con éxito', 'Éxito');
            this.getAllUsers(); // Actualizar la lista de usuarios
          },
          error: (err) => {
            this.toastr.error('Error al eliminar el usuario', 'Error');
          }
        });
      }
    });
  }

  goBack(): void {
    this.location.back(); // Navegar a la página anterior
  }
}