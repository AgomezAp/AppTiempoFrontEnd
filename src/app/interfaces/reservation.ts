export interface Reservation {
  ReservationId: number;
  Uid: number;
  Rid: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  reason: string;
  participants: number[]; // Array de Uid
  createdAt?: Date;
  updatedAt?: Date;
  User?: {
    Uid: number;
    email: string;
    name: string;
    lastName: string;
  };
  Room?: {
    Rid: number;
    name: string;
  };
}

export interface AvailableSlot {
  start: string;
  end: string;
}
