import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { UResponse } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  imports: [NavbarComponent, CommonModule, SpinnerComponent,FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  users: UResponse[] = [];
  filteredUsers: UResponse[] = [];
  paginatedUsers: UResponse[] = [];
  currentUserId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  // Paginación
  pageSize = 7;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getAllUsers();
    this.currentUserId = Number(localStorage.getItem('userId'));
  }

  getAllUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Error al obtener los usuarios', 'Error');
        this.loading = false;
      },
    });
  }

  // Filtro de búsqueda
  onSearchChange(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(
        (user) =>
          user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.updatePagination();
  }

  // Paginación
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
    this.goToPage(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredUsers.length
    );
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
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.userService.deleteUserById(id).subscribe({
          next: () => {
            this.toastr.success('Usuario eliminado con éxito', 'Éxito');
            this.getAllUsers();
          },
          error: (err) => {
            this.toastr.error('Error al eliminar el usuario', 'Error');
            this.loading = false;
          },
        });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
