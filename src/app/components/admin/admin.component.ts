import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { UResponse } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { AreaService } from '../../services/area.service';
import { RoleService } from '../../services/role.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { Area } from '../../interfaces/area';
import { Role } from '../../interfaces/role';
import { PlantillaInventarioService, PlantillaInventario, InventarioUsuario } from '../../services/plantilla-inventario.service';

@Component({
  selector: 'app-admin',
  imports: [NavbarComponent, CommonModule, SpinnerComponent, FormsModule],
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

  // Edición de usuario
  editingUser: UResponse | null = null;
  editForm: any = {
    name: '',
    lastName: '',
    email: '',
    Rid: 0,
    Aid: 0,
    salario: 0,
    empresa: 'AP',
    documentoIdentificacion: '',
    fechaIngreso: '',
    cargo: '',
    tipoContrato: 'termino-indefinido',
    celular: ''
  };

  // Adición de usuario
  addingUser: boolean = false;
  addForm: any = {
    Uid: '',
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    Rid: 0,
    Aid: 0,
    salario: 0,
    empresa: 'AP',
    documentoIdentificacion: '',
    fechaIngreso: '',
    cargo: '',
    tipoContrato: 'termino-indefinido',
    fondoPension: 'PORVENIR',
    fondoCesantias: 'PORVENIR',
    celular: ''
  };

  // Listas para selects
  areas: Area[] = [];
  roles: Role[] = [];

  // Paginación
  pageSize = 12;
  currentPage = 1;
  totalPages = 1;

  // Inventarios por usuario
  tabModal: 'datos' | 'inventarios' = 'datos';
  inventariosUsuario: InventarioUsuario[] = [];
  todasPlantillas: PlantillaInventario[] = [];
  plantillaSeleccionadaId: number | null = null;
  loadingInventarios = false;

  constructor(
    private userService: UserService,
    private areaService: AreaService,
    private roleService: RoleService,
    private plantillaService: PlantillaInventarioService,
    private toastr: ToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getAllUsers();
    this.loadAreas();
    this.loadRoles();
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

  loadAreas(): void {
    this.areaService.GetArea().subscribe({
      next: (data) => {
        this.areas = data;
      },
      error: (err) => {
        this.toastr.error('Error al cargar las áreas', 'Error');
      },
    });
  }

  loadRoles(): void {
    this.roleService.getRoleS().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => {
        this.toastr.error('Error al cargar los roles', 'Error');
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
            user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            (user.celular || '').toLowerCase().includes(this.searchTerm.toLowerCase())
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

  // Edición de usuario
  editUser(user: UResponse): void {
    this.tabModal = 'datos';
    this.inventariosUsuario = [];
    this.plantillaSeleccionadaId = null;
    this.editingUser = user;
    this.cargarInventariosUsuario(user.Uid!);
    
    // Convertir fechaIngreso de ISO a formato YYYY-MM-DD para input type="date"
    let fechaIngresoFormateada = '';
    if (user.fechaIngreso) {
      const fecha = new Date(user.fechaIngreso);
      if (!isNaN(fecha.getTime())) {
        const year = fecha.getUTCFullYear();
        const month = String(fecha.getUTCMonth() + 1).padStart(2, '0');
        const day = String(fecha.getUTCDate()).padStart(2, '0');
        fechaIngresoFormateada = `${year}-${month}-${day}`;
      }
    }
    
    this.editForm = {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      Rid: user.Rid,
      Aid: user.Aid,
      salario: user.salario || 0,
      empresa: user.empresa || 'AP',
      documentoIdentificacion: user.documentoIdentificacion || '',
      fechaIngreso: fechaIngresoFormateada,
      cargo: user.cargo || '',
      tipoContrato: user.tipoContrato || 'termino-indefinido',
      fondoPension: user.fondoPension || 'PORVENIR',
      fondoCesantias: user.fondoCesantias || 'PORVENIR',
      celular: user.celular || ''
    };
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.editForm = {
      name: '',
      lastName: '',
      email: '',
      Rid: 0,
      Aid: 0,
      salario: 0,
      empresa: 'AP',
      documentoIdentificacion: '',
      fechaIngreso: '',
      cargo: '',
      tipoContrato: 'termino-indefinido',
      fondoPension: 'PORVENIR',
      fondoCesantias: 'PORVENIR',
      celular: ''
    };
  }

  saveUser(): void {
    if (!this.editingUser || !this.editingUser.Uid) return;

    // Validaciones
    if (!this.editForm.name || !this.editForm.lastName || !this.editForm.email) {
      this.toastr.error('Nombre, apellido y email son obligatorios', 'Error');
      return;
    }

    if (!this.editForm.Rid || !this.editForm.Aid) {
      this.toastr.error('Debes seleccionar un rol y un área', 'Error');
      return;
    }

    this.loading = true;
    this.userService.updateUser(this.editingUser.Uid, this.editForm).subscribe({
      next: () => {
        this.toastr.success('Usuario actualizado con éxito', 'Éxito');
        this.cancelEdit();
        this.getAllUsers();
      },
      error: (err) => {
        this.toastr.error('Error al actualizar el usuario', 'Error');
        this.loading = false;
      },
    });
  }

  // Formatear salario con puntos de miles
  formatSalario(value: number | undefined | null): string {
    if (!value || value === 0) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Manejar cambios en el input de salario
  onSalarioChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\./g, ''); // Quitar puntos
    const numericValue = parseInt(value, 10);
    
    if (!isNaN(numericValue)) {
      this.editForm.salario = numericValue;
    } else {
      this.editForm.salario = 0;
    }
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

  openAddModal(): void {
    this.addingUser = true;
    this.addForm = {
      Uid: '',
      name: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      Rid: 0,
      Aid: 0,
      salario: 0,
      empresa: 'AP',
      documentoIdentificacion: '',
      fechaIngreso: '',
      cargo: '',
      tipoContrato: 'termino-indefinido',
      fondoPension: 'PORVENIR',
      fondoCesantias: 'PORVENIR',
      celular: ''
    };
  }

  cancelAdd(): void {
    this.addingUser = false;
  }

  registerUser(): void {
    if (!this.addForm.Uid) {
      this.toastr.error('El ID de usuario es obligatorio', 'Error');
      return;
    }
    if (!this.addForm.name || !this.addForm.lastName || !this.addForm.email || !this.addForm.password) {
      this.toastr.error('Nombre, apellido, email y contraseña son obligatorios', 'Error');
      return;
    }
    if (this.addForm.password !== this.addForm.confirmPassword) {
      this.toastr.warning('Las contraseñas no coinciden', 'Advertencia');
      return;
    }
    if (!this.addForm.Rid || !this.addForm.Aid) {
      this.toastr.error('Debes seleccionar un rol y un área', 'Error');
      return;
    }

    this.loading = true;
    const { confirmPassword, ...userData } = this.addForm;
    this.userService.signIn(userData).subscribe({
      next: () => {
        this.toastr.success('Usuario registrado con éxito', 'Éxito');
        this.cancelAdd();
        this.getAllUsers();
      },
      error: (err) => {
        this.toastr.error(err?.error?.msg || 'Error al registrar el usuario', 'Error');
        this.loading = false;
      }
    });
  }

  onAddSalarioChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\./g, '');
    const numericValue = parseInt(value, 10);
    this.addForm.salario = !isNaN(numericValue) ? numericValue : 0;
  }

  goBack(): void {
    this.location.back();
  }

  // ---- Gestión de inventarios por usuario ----
  cargarInventariosUsuario(Uid: number) {
    this.loadingInventarios = true;
    this.plantillaService.getInventariosUsuario(Uid).subscribe({
      next: data => { this.inventariosUsuario = data; this.loadingInventarios = false; },
      error: () => this.loadingInventarios = false,
    });
    if (this.todasPlantillas.length === 0) {
      this.plantillaService.getAll().subscribe({ next: p => this.todasPlantillas = p });
    }
  }

  asignarInventario() {
    if (!this.editingUser?.Uid || !this.plantillaSeleccionadaId) {
      this.toastr.warning('Seleccione una plantilla');
      return;
    }
    this.plantillaService.asignar(this.editingUser.Uid, this.plantillaSeleccionadaId).subscribe({
      next: () => {
        this.toastr.success('Inventario asignado');
        this.plantillaSeleccionadaId = null;
        this.cargarInventariosUsuario(this.editingUser!.Uid!);
      },
      error: () => this.toastr.error('Error al asignar inventario'),
    });
  }

  removerInventario(id: number) {
    this.plantillaService.remover(id).subscribe({
      next: () => {
        this.toastr.success('Inventario removido');
        this.cargarInventariosUsuario(this.editingUser!.Uid!);
      },
      error: () => this.toastr.error('Error al remover inventario'),
    });
  }
}
