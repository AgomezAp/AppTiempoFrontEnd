import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar.component';
import { ReservationService } from '../../services/reservation.service';
import { Reservation, AvailableSlot } from '../../interfaces/reservation';
import { Room } from '../../interfaces/room';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { UserService } from '../../services/user.service';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface User {
  Uid: number;
  name: string;
  lastName: string;
  email: string;
}

interface DayReservations {
  date: string;
  reservations: Reservation[];
}

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css'],
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, HttpClientModule],
})
export class ReservasComponent implements OnInit {
  // Exponer JSON y localStorage para el template
  JSON = JSON;
  localStorage = localStorage;

  // Estado general
  loading = false;
  allUsers: User[] = [];
  rooms: Room[] = [];
  reservations: Reservation[] = [];
  currentMonth = dayjs();
  calendarDays: any[] = [];

  // Modal de crear/editar reserva
  showModal = false;
  modalTitle = 'Nueva Reserva';
  isEditing = false;
  editingReservationId: number | null = null;

  // Datos del formulario
  selectedRoom: number | null = null;
  selectedDate = '';
  startTime = '';
  endTime = '';
  reason = '';
  selectedParticipants: number[] = [];
  availableSlots: AvailableSlot[] = [];

  // Administración de salas
  showRoomManagement = false;
  newRoomName = '';
  isAdmin = false;

  // Vista detallada de día
  selectedDayReservations: Reservation[] = [];
  showDayDetails = false;
  selectedDayForDetails = '';

  constructor(
    private reservationService: ReservationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.checkAdminRole();
    this.loadRooms();
    this.loadAllReservations();
    this.loadAllUsers();
    this.generateCalendar();
  }

  /**
   * Verificar si el usuario es administrador
   */
  checkAdminRole(): void {
    const rawRole = localStorage.getItem('role');
    const rawUser = localStorage.getItem('user');

    // Intentar leer desde 'user' (JSON) o desde 'role' (puede ser string plano "Admin")
    let role: string | undefined;
    let rid: number | undefined;

    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        role = parsed.role || parsed.Rol || parsed.RID || parsed.Rid;
        rid = parsed.Rid || parsed.RID;
      } catch (e) {
        // Si falla el parse, seguimos con rawRole
      }
    }

    if (!role && rawRole) {
      // rawRole podría ser un JSON o un string plano
      try {
        const parsedRole = JSON.parse(rawRole);
        role = parsedRole.role || parsedRole;
      } catch (e) {
        role = rawRole; // valor plano
      }
    }

    this.isAdmin = role === 'Admin' || rid === 1;
  }

  /**
   * Cargar todas las salas
   */
  loadRooms(): void {
    this.loading = true;
    this.reservationService.getAllRooms().subscribe({
      next: (res) => {
        if (res.success) {
          this.rooms = res.rooms;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar salas:', err);
        this.loading = false;
      },
    });
  }

  /**
   * Cargar todas las reservaciones
   */
  loadAllReservations(): void {
    const month = this.currentMonth.month() + 1;
    const year = this.currentMonth.year();

    this.reservationService.getAllReservations(month, year).subscribe({
      next: (res) => {
        if (res.success) {
          this.reservations = res.reservations;
          this.generateCalendar();
        }
      },
      error: (err) => {
        console.error('Error al cargar reservaciones:', err);
      },
    });
  }

  /**
   * Cargar todos los usuarios
   */
  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        if (res && Array.isArray(res)) {
          this.allUsers = res.map((user: any) => ({
            Uid: user.Uid,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
          }));
        }
      },
      error: (err: any) => {
        console.error('Error al cargar usuarios:', err);
      },
    });
  }

  /**
   * Generar el calendario del mes actual
   */
  generateCalendar(): void {
    const year = this.currentMonth.year();
    const month = this.currentMonth.month();

    const firstDay = dayjs(`${year}-${String(month + 1).padStart(2, '0')}-01`);
    const lastDay = firstDay.endOf('month');
    const startDate = firstDay.startOf('week');
    const endDate = lastDay.endOf('week');

    this.calendarDays = [];
    let current = startDate;

    while (current.isSameOrBefore(endDate)) {
      const dateStr = current.format('YYYY-MM-DD');
      const dayReservations = this.reservations.filter((r) => r.date === dateStr);

      this.calendarDays.push({
        date: dateStr,
        day: current.date(),
        isCurrentMonth: current.month() === month,
        dayOfWeek: current.day(),
        reservations: dayReservations,
        reservationCount: dayReservations.length,
        isWorkDay: current.day() >= 1 && current.day() <= 6,
      });

      current = current.add(1, 'day');
    }
  }

  /**
   * Navegar al mes anterior
   */
  previousMonth(): void {
    this.currentMonth = this.currentMonth.subtract(1, 'month');
    this.loadAllReservations();
  }

  /**
   * Navegar al mes siguiente
   */
  nextMonth(): void {
    this.currentMonth = this.currentMonth.add(1, 'month');
    this.loadAllReservations();
  }

  /**
   * Obtener el color de un día según su estado
   */
  getDayColor(day: any): string {
    if (!day.isCurrentMonth) return '#f0f0f0'; // Gris para días fuera del mes
    if (!day.isWorkDay) return '#e8f4f8'; // Azul claro para días no laborales

    if (day.reservations.length === 0) {
      return '#d4edda'; // Verde para disponible
    } else {
      // Rojo para reservado
      return '#f8d7da';
    }
  }

  /**
   * Obtener el texto de un día según su estado
   */
  getDayStatus(day: any): string {
    if (!day.isCurrentMonth) return '';
    if (!day.isWorkDay) return 'No laboral';
    if (day.reservations.length === 0) return 'Disponible';
    return `${day.reservations.length} reserva${day.reservations.length > 1 ? 's' : ''}`;
  }

  /**
   * Obtener el color indicador según el estado
   */
  getStatusColor(day: any): string {
    if (!day.isCurrentMonth) return '#ccc';
    if (!day.isWorkDay) return '#6c757d';
    if (day.reservations.length === 0) return '#28a745'; // Verde
    return '#dc3545'; // Rojo
  }

  /**
   * Abrir modal para crear nueva reserva
   */
  openNewReservationModal(dateStr: string): void {
    if (!dayjs(dateStr).isSameOrAfter(dayjs().startOf('day'))) {
      alert('No puedes reservar fechas en el pasado');
      return;
    }

    this.isEditing = false;
    this.editingReservationId = null;
    this.modalTitle = 'Nueva Reserva';
    this.selectedDate = dateStr;
    this.selectedRoom = null;
    this.startTime = '';
    this.endTime = '';
    this.reason = '';
    this.selectedParticipants = [];
    this.availableSlots = [];
    this.showModal = true;
  }

  /**
   * Abrir modal para editar reserva
   */
  openEditReservationModal(reservation: Reservation): void {
    this.isEditing = true;
    this.editingReservationId = reservation.ReservationId;
    this.modalTitle = 'Editar Reserva';
    this.selectedDate = reservation.date;
    this.selectedRoom = reservation.Rid;
    this.startTime = reservation.startTime;
    this.endTime = reservation.endTime;
    this.reason = reservation.reason;
    this.selectedParticipants = reservation.participants || [];
    this.showModal = true;
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  /**
   * Cuando se selecciona una sala, cargar los slots disponibles
   */
  onRoomSelected(): void {
    if (this.selectedRoom && this.selectedDate) {
      this.loadAvailableSlots();
    }
  }

  /**
   * Cuando se selecciona una fecha, cargar los slots disponibles
   */
  onDateSelected(): void {
    console.log('Fecha seleccionada en input:', this.selectedDate);
    if (this.selectedRoom && this.selectedDate) {
      this.loadAvailableSlots();
    }
  }

  /**
   * Cargar slots disponibles
   */
  loadAvailableSlots(): void {
    if (!this.selectedRoom || !this.selectedDate) {
      this.availableSlots = [];
      return;
    }

    // Debug: log the date format being sent
    console.log('Enviando solicitud de slots - Sala:', this.selectedRoom, 'Fecha:', this.selectedDate, 'Tipo:', typeof this.selectedDate);

    this.reservationService.getAvailableSlots(this.selectedRoom, this.selectedDate).subscribe({
      next: (res) => {
        if (res.success && res.availableSlots) {
          this.availableSlots = res.availableSlots;
          if (this.availableSlots.length === 0) {
            console.warn('No hay slots disponibles para esta sala y fecha');
          } else {
            console.log('Slots cargados:', this.availableSlots);
          }
        } else {
          this.availableSlots = [];
          console.warn('Respuesta sin slots:', res);
        }
      },
      error: (err: any) => {
        console.error('Error al cargar slots disponibles:', err);
        this.availableSlots = [];
        if (err.error?.message) {
          console.log('Detalles del error:', err.error.message);
        }
      },
    });
  }

  /**
   * Establecer la hora de inicio basada en un slot disponible
   */
  setTimeSlot(slot: AvailableSlot): void {
    this.startTime = slot.start;
    this.endTime = slot.end;
  }

  /**
   * Alternar selección de participante
   */
  toggleParticipant(userId: number): void {
    if (this.selectedParticipants.includes(userId)) {
      this.selectedParticipants = this.selectedParticipants.filter((id) => id !== userId);
    } else {
      this.selectedParticipants.push(userId);
    }
  }

  /**
   * Guardar la reserva (crear o actualizar)
   */
  saveReservation(): void {
    if (!this.selectedRoom || !this.selectedDate || !this.startTime || !this.endTime || !this.reason) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    if (this.isEditing && this.editingReservationId) {
      this.updateReservation();
    } else {
      this.createReservation();
    }
  }

  /**
   * Crear una nueva reserva
   */
  createReservation(): void {
    this.loading = true;
    const data = {
      roomId: this.selectedRoom!,
      date: this.selectedDate,
      startTime: this.startTime,
      endTime: this.endTime,
      reason: this.reason,
      participants: this.selectedParticipants,
    };

    this.reservationService.createReservation(data).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Reserva creada exitosamente. Se han enviado correos de confirmación.');
          this.closeModal();
          this.loadAllReservations();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al crear reserva:', err);
        alert(err.error?.message || 'Error al crear la reserva');
        this.loading = false;
      },
    });
  }

  /**
   * Actualizar una reserva existente
   */
  updateReservation(): void {
    this.loading = true;
    const data = {
      date: this.selectedDate,
      startTime: this.startTime,
      endTime: this.endTime,
      reason: this.reason,
      participants: this.selectedParticipants,
    };

    this.reservationService.updateReservation(this.editingReservationId!, data).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Reserva actualizada exitosamente');
          this.closeModal();
          this.loadAllReservations();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al actualizar reserva:', err);
        alert(err.error?.message || 'Error al actualizar la reserva');
        this.loading = false;
      },
    });
  }

  /**
   * Cancelar una reserva
   */
  cancelReservation(reservationId: number): void {
    if (!confirm('¿Deseas cancelar esta reserva?')) {
      return;
    }

    this.loading = true;
    this.reservationService.cancelReservation(reservationId).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Reserva cancelada exitosamente');
          this.loadAllReservations();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cancelar reserva:', err);
        alert(err.error?.message || 'Error al cancelar la reserva');
        this.loading = false;
      },
    });
  }

  /**
   * Mostrar detalles de reservaciones de un día
   */
  showDayReservations(day: any): void {
    if (day.reservations.length === 0) {
      alert('No hay reservaciones para este día');
      return;
    }

    this.selectedDayForDetails = day.date;
    this.selectedDayReservations = day.reservations;
    this.showDayDetails = true;
  }

  /**
   * Cerrar vista de detalles del día
   */
  closeDayDetails(): void {
    this.showDayDetails = false;
  }

  /**
   * Formatear hora en formato legible
   */
  formatTime(time: string): string {
    return time; // Ya viene en formato HH:mm
  }

  /**
   * Resetear el formulario
   */
  resetForm(): void {
    this.selectedRoom = null;
    this.selectedDate = '';
    this.startTime = '';
    this.endTime = '';
    this.reason = '';
    this.selectedParticipants = [];
    this.availableSlots = [];
  }

  /**
   * ========== ADMINISTRACIÓN DE SALAS ==========
   */

  /**
   * Abrir panel de administración de salas
   */
  openRoomManagement(): void {
    this.showRoomManagement = true;
    this.newRoomName = '';
  }

  /**
   * Cerrar panel de administración de salas
   */
  closeRoomManagement(): void {
    this.showRoomManagement = false;
  }

  /**
   * Crear una nueva sala
   */
  createRoom(): void {
    if (!this.newRoomName.trim()) {
      alert('Por favor ingresa un nombre para la sala');
      return;
    }

    this.loading = true;
    this.reservationService.createRoom(this.newRoomName.trim()).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Sala creada exitosamente');
          this.newRoomName = '';
          this.loadRooms();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al crear sala:', err);
        alert(err.error?.message || 'Error al crear la sala');
        this.loading = false;
      },
    });
  }

  /**
   * Eliminar una sala
   */
  deleteRoom(roomId: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta sala?')) {
      return;
    }

    this.loading = true;
    this.reservationService.deleteRoom(roomId).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Sala eliminada exitosamente');
          this.loadRooms();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al eliminar sala:', err);
        alert(err.error?.message || 'Error al eliminar la sala');
        this.loading = false;
      },
    });
  }

  /**
   * Obtener el nombre de una sala por ID
   */
  getRoomName(roomId: number): string {
    const room = this.rooms.find((r) => r.Rid === roomId);
    return room ? room.name : 'Sala desconocida';
  }

  /**
   * Obtener el nombre de un usuario por ID
   */
  getUserName(userId: number): string {
    const user = this.allUsers.find((u) => u.Uid === userId);
    return user ? `${user.name} ${user.lastName}` : 'Usuario desconocido';
  }

  /**
   * Obtener la fecha mínima para seleccionar (hoy)
   */
  getMinDate(): string {
    return dayjs().format('YYYY-MM-DD');
  }

  /**
   * Obtener la fecha máxima para seleccionar (dentro de 7 días)
   */
  getMaxDate(): string {
    return dayjs().add(7, 'days').format('YYYY-MM-DD');
  }
}
