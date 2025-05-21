import {
  CommonModule,
  Location,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { PermisosService } from '../../services/permisos.service';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-permiso',
  imports: [CommonModule, FormsModule, SpinnerComponent, NavbarComponent],
  templateUrl: './permiso.component.html',
  styleUrl: './permiso.component.css',
})
export class PermisoComponent implements OnInit {
  permiso: any = {
    tipo: '',
    descripcion: '',
    fecha: new Date(),
    horas: 0,
    Uid: parseInt(localStorage.getItem('userId') || '0', 10),
    emailPersonal: localStorage.getItem('email') || '',
    emailLider: '',
    nombre: localStorage.getItem('name') + ' ' + localStorage.getItem('lastname'),
    numeroDocumento: '',
    horaSalida: '',
    horaEntrada: '',
    observaciones: '',
  };
  cantidadDias: number = 1;
  
  ngOnInit(): void {
    // Obtener el correo del líder desde localStorage
    const correoLider = localStorage.getItem('correoLider');
    if (correoLider) {
      if (correoLider === this.permiso.emailPersonal){
        this.permiso.emailLider = ''
      } else {
        this.permiso.emailLider = correoLider;          
      }
    }
    this.loadHolidays()
  }
  transformHora() {
    const pipe = new DatePipe('en-GB'); // Configuración para 24 horas
    return pipe.transform(this.permiso.horaEntrada, 'HH:mm') ?? '';
  }
  actualizarHora(event: any) {
    const horaIngresada = event.target.value;
    this.permiso.horaEntrada = horaIngresada.length === 5 ? horaIngresada : ''; // Valida formato HH:mm
  }
  
  loadHolidays() {
    const year = new Date().getFullYear();
    this.permisoService.getHolidays(year).subscribe({
      next: (holidays) => {
        this.holidays = holidays.map(h => h.date); // Extrae solo las fechas
      },
      error: (err) => console.error('Error obteniendo días festivos:', err)
    });
  }
  loading: boolean = false;
  tiposPermiso: string[] = [
    'Permiso personal de todo el día',
    'Salida Temprano',
    'Permiso personal por horas',
    'Entrada luego de la jornada',
    'Llegada tarde por factores externos',
    'Cita médica',
    'Cita odontológica',
    'Incapacidad médica',
    'Día de la familia',
    'Día extralegal',
    'Calamidad',
    'Suspensión por proceso disciplinario',
    'Licencia de luto',
    'Media jornada por votación',
    'Jurado de votación',
    'Incapacidad laboral',
    'Urgencia médica',
    'Movimiento de horario',
    'Vacaciones',
    'Horas extras (en casa, fuera de las instalaciones y viajes)',
    'Adecuacion horario (Horarios Especiales)'
  ];

  permitidosSalida: string[] = [ 
    'Salida Temprano',
    'Cita médica',
    'Cita odontológica',
    'Movimiento de horario',
    'Permiso personal por horas',
    'Horas extras (en casa, fuera de las instalaciones y viajes)',
    'Adecuacion horario (Horarios Especiales)'
  ];

  permitidoEntrada: string[] = [
    'Entrada luego de la jornada',
    'Llegada tarde por factores externos',
    'Cita médica',
    'Cita odontológica',
    'Movimiento de horario',
    'Permiso personal por horas',
    'Horas extras (en casa, fuera de las instalaciones y viajes)',
    'Adecuacion horario (Horarios Especiales)'
  ];

  variosDias: string[] = [
    'Vacaciones',
    'Incapacidad médica',
    'Incapacidad laboral',
  ];

  holidays: string[] = []

  mostrarSalida(): boolean {
    return this.permitidosSalida.includes(this.permiso.tipo);
  }
  mostrarEntrada(): boolean {
    return this.permitidoEntrada.includes(this.permiso.tipo);
  }

  mostrarDias(): boolean {
    return this.variosDias.includes(this.permiso.tipo)
  }
  selectedFile: File | null = null;
  today: string;

  constructor(
    private permisoService: PermisosService,
    private toastr: ToastrService,
    private router: Router,
    private location: Location
  ) {
    const currentDate = new Date();
    this.today = currentDate.toISOString().split('T')[0];
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onTipoPermisoChange() {
  if (!this.mostrarSalida()) {
    this.permiso.horaSalida = '';
  }
  if (!this.mostrarEntrada()) {
    this.permiso.horaEntrada = '';
  }
  console.log('horaSalida:', this.permiso.horaSalida, 'horaEntrada:', this.permiso.horaEntrada);
}

  isHoliday(date: Date): boolean {
    const dateString = date.toISOString().split('T')[0];
    return this.holidays.includes(dateString);
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  isObservacionesValid(): boolean {
    // Elimina los espacios en blanco al inicio y al final, y verifica la longitud
    return this.permiso.observaciones?.trim().length >= 50;
  }

  createPermiso() {
    this.loading = true;
    let testDate = new Date("2025-01-01"); // Año Nuevo (feriado)
    let currentDate = new Date(this.permiso.fecha + "T00:00:00");
    let daysAdded = 0;

    if (this.variosDias.includes(this.permiso.tipo)) {
      daysAdded = 0;
    } else {
      daysAdded = this.cantidadDias - 1
    }
    const permisosRequests = [];
    while (daysAdded < this.cantidadDias) {
      while (this.isWeekend(currentDate) || this.isHoliday(currentDate)) {
        currentDate.setDate(currentDate.getDate()+1);
      }
      const formData = new FormData();
      for (const key in this.permiso) {
        if (this.permiso.hasOwnProperty(key)) {
          if(key === 'fecha'){
            formData.append(key, currentDate.toISOString().split('T')[0]);
          } else {
            formData.append(key, (this.permiso as any)[key]);
          }
        }
      }
      if (this.selectedFile) {
        formData.append('soporte', this.selectedFile);
      }
      permisosRequests.push(this.permisoService.createPermiso(formData));
      daysAdded++;
      currentDate.setDate(currentDate.getDate()+1);      
    }
    Promise.all(permisosRequests.map(req => req.toPromise()))
    .then(() => {
      this.toastr.success('Permisos creados con éxito');
      this.router.navigate(['/permisos']);
    })
    .catch(error => {
      this.toastr.error('Error al crear los permisos');
      console.error(error);
    })
    .finally(()=> {
      this.loading = false;
      this.permiso = {
        tipo: '',
        descripcion: '',
        fecha: new Date(),
        horas: 0,
        Uid: parseInt(localStorage.getItem('userId') || '0', 10),
        emailPersonal: localStorage.getItem('email') || '',
        emailLider: localStorage.getItem('correoLider') || '',
        nombre: localStorage.getItem('name') + ' ' + localStorage.getItem('lastname'),
        numeroDocumento: '',
        horaSalida: '',
        horaEntrada: '',
        observaciones: '',
      };
      this.selectedFile = null;
    })
  }
    

  cancel() {
    this.location.back(); // Redirigir a la página anterior
  }
}
