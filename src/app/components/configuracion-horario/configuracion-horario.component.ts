import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { HorarioUsuarioService } from '../../services/horario-usuario.service';
import { UserService } from '../../services/user.service';
import { HorarioUsuario } from '../../interfaces/horario-usuario';
import { UResponse } from '../../interfaces/user';
import { ToastrService } from 'ngx-toastr';

const DIAS_SEMANA = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

@Component({
  selector: 'app-configuracion-horario',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './configuracion-horario.component.html',
  styleUrls: ['./configuracion-horario.component.css']
})
export class ConfiguracionHorarioComponent implements OnInit {
  users: UResponse[] = [];
  filteredUsers: UResponse[] = [];
  selectedUser: UResponse | null = null;
  searchTerm = '';
  loading = false;
  saving = false;

  diasSemana = DIAS_SEMANA;
  horarios: HorarioUsuario[] = [];

  constructor(
    private horarioService: HorarioUsuarioService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Error al cargar usuarios');
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term)
    );
  }

  selectUser(user: UResponse): void {
    this.selectedUser = user;
    this.loading = true;
    this.horarioService.getHorarioUsuario(user.Uid!).subscribe({
      next: (horarios) => {
        this.horarios = this.diasSemana.map(dia => {
          const existing = horarios.find(h => h.diaSemana === dia.value);
          return existing || {
            Uid: user.Uid!,
            diaSemana: dia.value,
            jornadaMinutos: dia.value === 6 ? 240 : 510,
            almuerzoMinutos: dia.value === 6 ? 0 : 60,
            activo: true
          };
        });
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Error al cargar horario');
        this.loading = false;
      }
    });
  }

  getDiaLabel(diaSemana: number): string {
    return this.diasSemana.find(d => d.value === diaSemana)?.label || '';
  }

  formatMinutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  }

  getTotalRestar(horario: HorarioUsuario): number {
    return horario.jornadaMinutos + horario.almuerzoMinutos;
  }

  saveHorarios(): void {
    if (!this.selectedUser) return;
    this.saving = true;
    this.horarioService.updateHorarioUsuario(this.selectedUser.Uid!, this.horarios).subscribe({
      next: () => {
        this.toastr.success('Horario guardado correctamente');
        this.saving = false;
      },
      error: () => {
        this.toastr.error('Error al guardar horario');
        this.saving = false;
      }
    });
  }

  inicializarGlobal(): void {
    this.saving = true;
    this.horarioService.inicializarHorariosGlobal().subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Horarios inicializados');
        this.saving = false;
      },
      error: () => {
        this.toastr.error('Error al inicializar horarios');
        this.saving = false;
      }
    });
  }

  clearSelection(): void {
    this.selectedUser = null;
    this.horarios = [];
  }
}
