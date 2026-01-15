import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reservation, AvailableSlot } from '../interfaces/reservation';
import { Room } from '../interfaces/room';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // ========== ROOMS ==========

  /**
   * Obtener todas las salas disponibles
   */
  getAllRooms(): Observable<{ success: boolean; rooms: Room[] }> {
    return this.http.get<{ success: boolean; rooms: Room[] }>(`${this.apiUrl}/rooms`);
  }

  /**
   * Obtener una sala por ID
   */
  getRoomById(id: number): Observable<{ success: boolean; room: Room }> {
    return this.http.get<{ success: boolean; room: Room }>(`${this.apiUrl}/rooms/${id}`);
  }

  /**
   * Crear una nueva sala (solo administradores)
   */
  createRoom(name: string): Observable<{ success: boolean; message: string; room: Room }> {
    return this.http.post<{ success: boolean; message: string; room: Room }>(
      `${this.apiUrl}/rooms`,
      { name }
    );
  }

  /**
   * Actualizar una sala (solo administradores)
   */
  updateRoom(id: number, name: string): Observable<{ success: boolean; message: string; room: Room }> {
    return this.http.patch<{ success: boolean; message: string; room: Room }>(
      `${this.apiUrl}/rooms/${id}`,
      { name }
    );
  }

  /**
   * Eliminar una sala (solo administradores)
   */
  deleteRoom(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/rooms/${id}`);
  }

  // ========== RESERVATIONS ==========

  /**
   * Obtener espacios disponibles para una sala en una fecha específica
   */
  getAvailableSlots(roomId: number, date: string): Observable<{ success: boolean; availableSlots: AvailableSlot[] }> {
    let params = new HttpParams();
    params = params.set('roomId', roomId.toString());
    params = params.set('date', date);

    return this.http.get<{ success: boolean; availableSlots: AvailableSlot[] }>(
      `${this.apiUrl}/reservations/available-slots`,
      { params }
    );
  }

  /**
   * Obtener todas las reservaciones
   */
  getAllReservations(month?: number, year?: number): Observable<{ success: boolean; reservations: Reservation[] }> {
    let params = new HttpParams();
    if (month !== undefined && year !== undefined) {
      params = params.set('month', month.toString());
      params = params.set('year', year.toString());
    }

    return this.http.get<{ success: boolean; reservations: Reservation[] }>(
      `${this.apiUrl}/reservations`,
      { params }
    );
  }

  /**
   * Obtener las reservaciones del usuario actual
   */
  getMyReservations(month?: number, year?: number): Observable<{ success: boolean; reservations: Reservation[] }> {
    let params = new HttpParams();
    if (month !== undefined && year !== undefined) {
      params = params.set('month', month.toString());
      params = params.set('year', year.toString());
    }

    return this.http.get<{ success: boolean; reservations: Reservation[] }>(
      `${this.apiUrl}/reservations/my-reservations`,
      { params }
    );
  }

  /**
   * Crear una nueva reservación
   */
  createReservation(data: {
    roomId: number;
    date: string;
    startTime: string;
    endTime: string;
    reason: string;
    participants?: number[];
  }): Observable<{ success: boolean; message: string; reservation: Reservation }> {
    return this.http.post<{ success: boolean; message: string; reservation: Reservation }>(
      `${this.apiUrl}/reservations`,
      data
    );
  }

  /**
   * Actualizar una reservación
   */
  updateReservation(
    id: number,
    data: {
      date?: string;
      startTime?: string;
      endTime?: string;
      reason?: string;
      participants?: number[];
    }
  ): Observable<{ success: boolean; message: string; reservation: Reservation }> {
    return this.http.patch<{ success: boolean; message: string; reservation: Reservation }>(
      `${this.apiUrl}/reservations/${id}`,
      data
    );
  }

  /**
   * Cancelar una reservación
   */
  cancelReservation(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/reservations/${id}`);
  }
}
